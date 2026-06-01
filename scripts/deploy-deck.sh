#!/usr/bin/env bash
# deploy-deck.sh — fail-closed autopilot: publish a slidev-theme-vv deck to vedmich.dev/slides/<slug>/.
# macOS/BSD/bash-3.2 safe: no `sed -i`, no `timeout`, no bash-4 features. See
# docs/superpowers/specs/2026-06-01-vedmich-dev-skill-slides-deploy-design.md and docs/slides-onboarding.md.
set -Eeuo pipefail
IFS=$'\n\t'

THEME_REPO="$HOME/Documents/GitHub/vedmichv/slidev-theme-vv"
GHPAGES_REPO="$HOME/Documents/GitHub/vedmichv/slidev"
SITE_REPO="$HOME/Documents/GitHub/vedmich/vedmich.dev"
SUBMODULE="$SITE_REPO/slidev"
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
. "$HERE/lib/deploy-lib.sh"

SLUG="" ; THEME="" ; DRYRUN=0 ; NO_UNDRAFT=0 ; CUTOVER=0
ROLLBACK_NOTES=""
CURRENT_STEP="startup"   # later tasks (T7-T12) set this at the top of each step; trap surfaces it

log()  { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*" >&2; }
note_rollback() { local n="${1:-}"; ROLLBACK_NOTES="${ROLLBACK_NOTES}${n}"$'\n'; }
print_rollback() {
  [ -n "$ROLLBACK_NOTES" ] || return 0
  printf '\033[1;33m── rollback ──\n%s\033[0m\n' "$ROLLBACK_NOTES" >&2
}
die() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; print_rollback; exit 1; }
trap 'die "aborted during: $CURRENT_STEP"' ERR

# run <description> -- <cmd...>  : in --dry-run, print and skip; else execute.
run() {
  local desc="$1"; shift
  [ $# -gt 0 ] || die "run('$desc'): no command given"
  [ "${1:-}" = "--" ] && shift
  [ $# -gt 0 ] || die "run('$desc'): no command after --"
  if [ "$DRYRUN" -eq 1 ]; then
    printf '  [dry-run] %s\n     $ ' "$desc"; printf '%s ' "$@"; printf '\n'; return 0
  fi
  log "$desc"; "$@"
}

usage() { cat >&2 <<EOF
Usage: deploy-deck.sh --slug <slug> --theme slidev-theme-vv [--no-undraft] [--cutover] [--dry-run]
  --slug        deck slug (presentations/<slug>/ in the theme repo)
  --theme       slidev-theme-vv (only supported theme for now — D-8)
  --no-undraft  do NOT touch the homepage MDX card (theme demos, e.g. vv-demo — D-7)
  --cutover     allow overwriting a slug already deployed at a DIFFERENT base; also removes
                its card from the gh-pages root index.html (legacy s.vedmich.dev cutover — D-9)
  --dry-run     preflight + build + compute/show every diff; mutate & push nothing
EOF
exit 2; }

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --slug)       SLUG="${2:?--slug needs a value}"; shift 2 ;;
      --theme)      THEME="${2:?--theme needs a value}"; shift 2 ;;
      --no-undraft) NO_UNDRAFT=1; shift ;;
      --cutover)    CUTOVER=1; shift ;;
      --dry-run)    DRYRUN=1; shift ;;
      -h|--help)    usage ;;
      *)            warn "unknown arg: $1"; usage ;;
    esac
  done
  validate_slug "$SLUG" || die "invalid --slug '${SLUG:-}' (must match ^[a-z0-9]([a-z0-9-]*[a-z0-9])?\$)"
  [ "$THEME" = "slidev-theme-vv" ] || die "--theme must be slidev-theme-vv (slurm deferred — D-8)"
}

# Captured in preflight for later steps / drag-detection.
OLDPIN=""

preflight() {
  CURRENT_STEP="preflight"
  log "preflight (read-only)…"
  # 1. repos exist
  for d in "$THEME_REPO" "$GHPAGES_REPO" "$SITE_REPO" "$SUBMODULE"; do
    [ -d "$d/.git" ] || [ -f "$d/.git" ] || die "missing git repo: $d"
  done
  # 2. theme deck exists
  [ -f "$THEME_REPO/presentations/$SLUG/slides.md" ] || die "deck not found: presentations/$SLUG/slides.md"
  # 3. scoped cleanliness — theme: only the deck source (repo has untracked scratch)
  [ -z "$(git -C "$THEME_REPO" status --porcelain "presentations/$SLUG/")" ] \
    || die "theme working tree dirty under presentations/$SLUG/ — commit/stash first"
  #    site: clean ignoring submodule pointer; submodule checked separately
  [ -z "$(git -C "$SITE_REPO" status --porcelain --ignore-submodules=dirty)" ] \
    || die "site working tree dirty — commit/stash first"
  [ -z "$(git -C "$SUBMODULE" status --porcelain)" ] \
    || die "submodule working tree dirty"
  # 4. submodule wiring
  [ "$(git -C "$SITE_REPO" config -f .gitmodules --get submodule.slidev.branch)" = "gh-pages" ] \
    || die ".gitmodules submodule.slidev.branch must be gh-pages"
  git -C "$SUBMODULE" ls-remote --exit-code origin gh-pages >/dev/null 2>&1 \
    || die "submodule remote gh-pages unreachable"
  case "$(git -C "$SITE_REPO" submodule status slidev | cut -c1)" in
    '-'|'+'|'U') die "submodule not cleanly initialized (run: git submodule update --init)";;
  esac
  OLDPIN="$(git -C "$SITE_REPO" rev-parse :slidev 2>/dev/null)" || die "cannot read staged submodule pin (:slidev) — run: git submodule update --init"
  # 5. gh-pages repo really on gh-pages
  [ "$(git -C "$GHPAGES_REPO" symbolic-ref --short HEAD)" = "gh-pages" ] \
    || die "$GHPAGES_REPO is not on the gh-pages branch"
  # 6. base-collision guard (B1): slug already on gh-pages at a different base?
  local existing="$GHPAGES_REPO/$SLUG/index.html"
  if [ -f "$existing" ] && [ ! -r "$existing" ]; then
    die "gh-pages index exists but is unreadable: $existing (check permissions)"
  fi
  if [ -f "$existing" ]; then
    if [ -n "$(base_violations "$existing" "/slides/$SLUG/")" ]; then
      [ "$CUTOVER" -eq 1 ] || die "gh-pages /$SLUG/ is built for a DIFFERENT base (legacy s.vedmich.dev). Re-run with --cutover to migrate it to /slides/$SLUG/ (this overwrites the legacy surface)."
      warn "--cutover: will overwrite legacy /$SLUG/ surface and remove its root-index card"
    fi
  fi
  log "preflight OK (oldpin=${OLDPIN:0:9})"
}

DIST=""   # set by step_build

assert_base() {
  local index="$1"
  [ -f "$index" ] || die "no index.html at $index (build failed?)"
  [ "$(count_root_assets "$index")" -ge 1 ] || die "no root-absolute assets in $index (broken build?)"
  local v; v="$(base_violations "$index" "/slides/$SLUG/")"
  [ -z "$v" ] || die "base check FAILED — assets not under /slides/$SLUG/:"$'\n'"$v"
}

step_build() {
  CURRENT_STEP="build"
  DIST="$THEME_REPO/presentations/$SLUG/dist"
  # The build ALWAYS runs — even in --dry-run — because the base check is the cheapest catch of
  # the most expensive mistake, and dist/ is gitignored (verified .gitignore:2) so it can't poison
  # the next run's cleanliness preflight. This is the one intentional exception to run()'s skip.
  rm -rf -- "$DIST"
  log "build deck (base /slides/$SLUG/)"
  ( cd "$THEME_REPO" && pnpm exec slidev build "presentations/$SLUG/slides.md" --base "/slides/$SLUG/" ) \
    || die "slidev build failed"
  assert_base "$DIST/index.html"
  [ -f "$DIST/404.html" ] && assert_base "$DIST/404.html" || warn "no 404.html in dist (deep-link fallback)"
  log "build + base gate OK"
}

PUSHED=""   # gh-pages SHA after step 2

step_publish_ghpages() {
  CURRENT_STEP="publish-ghpages"
  local dest="$GHPAGES_REPO/$SLUG" snap=""
  # snapshot the existing slot for rollback (B1). Gated behind non-dry-run so the dry-run
  # leaves zero side effects (no mktemp dir, no phantom rollback note). The tarball lives in a
  # per-run $(mktemp -d) — reboot-scoped, NOT durable; the rollback note is good only this session.
  if [ "$DRYRUN" -eq 0 ] && [ -d "$dest" ]; then
    snap="$(mktemp -d)/snap.tgz"
    tar -czf "$snap" -C "$GHPAGES_REPO" "$SLUG" || die "snapshot failed for /$SLUG"
    note_rollback "restore gh-pages slot: rm -rf '$dest' && tar -xzf '$snap' -C '$GHPAGES_REPO' && (cd '$GHPAGES_REPO' && git add '$SLUG' && git commit -m 'rollback $SLUG')"
  elif [ "$DRYRUN" -eq 1 ] && [ -d "$dest" ]; then
    printf '  [dry-run] snapshot existing /%s for rollback (tar to a tempdir)\n' "$SLUG"
  fi
  # contents-form copy (NEVER nests dist/) — G2
  run "swap dist into /$SLUG slot" -- sh -c "rm -rf -- '$dest'; mkdir -p '$dest'; cp -R '$DIST/.' '$dest/'"
  if [ "$DRYRUN" -eq 0 ]; then
    [ -f "$dest/index.html" ] && [ ! -d "$dest/dist" ] || die "cp shape wrong (nested dist?) at $dest"
  fi
  # cutover: drop the legacy card from the gh-pages root index.html (D-9)
  if [ "$CUTOVER" -eq 1 ] && grep -q "\"\\./$SLUG/\"" "$GHPAGES_REPO/index.html" 2>/dev/null; then
    run "remove legacy /$SLUG card from gh-pages root index.html" -- \
      sh -c "awk 'BEGIN{skip=0} /<a class=\"card\" href=\"\\.\\/$SLUG\\/\">/{skip=1} skip&&/<\\/a>/{skip=0;next} !skip{print}' '$GHPAGES_REPO/index.html' > '$GHPAGES_REPO/index.html.tmp' && mv -- '$GHPAGES_REPO/index.html.tmp' '$GHPAGES_REPO/index.html'"
  fi
  # commit + push (path-specific: slug, plus index.html only when cutover)
  run "stage gh-pages changes" -- sh -c "cd '$GHPAGES_REPO' && git add '$SLUG' $( [ "$CUTOVER" -eq 1 ] && echo index.html )"
  run "commit gh-pages" -- sh -c "cd '$GHPAGES_REPO' && (git diff --cached --quiet || git commit -m 'deploy: $SLUG --base /slides/$SLUG/')"
  run "push gh-pages" -- sh -c "cd '$GHPAGES_REPO' && git push origin gh-pages"
  if [ "$DRYRUN" -eq 0 ]; then
    PUSHED="$(git -C "$GHPAGES_REPO" rev-parse HEAD)"
    note_rollback "revert gh-pages: (cd '$GHPAGES_REPO' && git revert --no-edit $PUSHED && git push origin gh-pages)"
    log "gh-pages published @ ${PUSHED:0:9}"
  fi
}

step_bump_submodule() {
  CURRENT_STEP="bump-submodule"
  [ "$DRYRUN" -eq 1 ] && { printf '  [dry-run] submodule: fetch + checkout %s + drag-gate\n' "${PUSHED:-<pushed>}"; return 0; }
  run "fetch gh-pages in submodule" -- git -C "$SUBMODULE" fetch origin gh-pages
  run "checkout pushed SHA in submodule" -- git -C "$SUBMODULE" checkout --quiet "$PUSHED"
  # drag-detection GATE — only our slug (+ allowed root files) may differ vs OLDPIN
  # Drag-gate: the diff baseline is OLDPIN (the LAST pinned submodule SHA), not gh-pages-pre-push.
  # So if a co-tenant deck (slurm/dkt) was pushed to gh-pages since the last pin bump, this
  # correctly ABORTS — we only want OUR slug (+ cutover index.html) in the pointer bump. A legit
  # abort here means: bump the pin deliberately. Do NOT widen this filter to "fix" it.
  if git -C "$SUBMODULE" cat-file -e "$OLDPIN" 2>/dev/null; then
    local drag
    drag="$(git -C "$SUBMODULE" diff --name-only "$OLDPIN" "$PUSHED" | grep -vE "^$SLUG/|^(CNAME|404\.html|index\.html)\$" || true)"
    [ -z "$drag" ] || die "submodule bump would drag co-tenant changes:"$'\n'"$drag"
  else
    warn "oldpin $OLDPIN not in submodule history (force-push?) — skipping drag check"
  fi
  run "stage submodule pointer" -- git -C "$SITE_REPO" add slidev
  local staged; staged="$(git -C "$SITE_REPO" rev-parse :slidev)"
  [ "$staged" = "$PUSHED" ] || die "staged gitlink ($staged) != pushed gh-pages ($PUSHED)"
  note_rollback "reset submodule pointer: (cd '$SITE_REPO' && git restore --staged slidev && git -C slidev checkout $OLDPIN)"
  log "submodule bumped → ${PUSHED:0:9}"
}

step_whitelist() {
  CURRENT_STEP="whitelist"
  local yml="$SITE_REPO/.github/workflows/deploy.yml"
  if whitelist_has "$yml" "$SLUG"; then log "whitelist already has $SLUG (idempotent)"; return 0; fi
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] whitelist: add %s to %s\n' "$SLUG" "$yml"; return 0; fi
  run "add $SLUG to CI whitelist" -- sh -c ". '$HERE/lib/deploy-lib.sh'; whitelist_add '$yml' '$SLUG'"
  whitelist_has "$yml" "$SLUG" || die "whitelist_add did not take"
  uv run --with pyyaml python3 -c "import yaml; yaml.safe_load(open('$yml'))" || die "deploy.yml no longer parses after whitelist edit"
  log "whitelist updated"
}

step_undraft() {
  CURRENT_STEP="undraft"
  if [ "$NO_UNDRAFT" -eq 1 ]; then log "step 5 skipped (--no-undraft): no homepage card for $SLUG"; return 0; fi
  local en="$SITE_REPO/src/content/presentations/en/$SLUG.md"
  local ru="$SITE_REPO/src/content/presentations/ru/$SLUG.md"
  # bilingual parity PRECONDITION: both must exist and both be draft:true (CREATE path is out of
  # autopilot scope — author the cards manually first, then re-run; see slides-onboarding.md Step 5)
  { [ -f "$en" ] && [ -f "$ru" ]; } || die "missing MDX card(s) for $SLUG (en/ru). Create both (draft:true) first, or pass --no-undraft."
  grep -q '^draft: true' "$en" && grep -q '^draft: true' "$ru" \
    || { log "both cards already published (idempotent)"; return 0; }
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] un-draft + strip slides: in en/ru %s.md\n' "$SLUG"; return 0; fi
  local t
  for f in "$en" "$ru"; do
    t="$(mktemp)"
    sed -E '/^draft: true$/s/true/false/; /^slides:[[:space:]]*"https:\/\/s\.vedmich\.dev\//d' "$f" > "$t"
    grep -q '^draft: false' "$t" || die "un-draft failed for $f"
    mv -- "$t" "$f"
  done
  note_rollback "re-draft cards: git -C '$SITE_REPO' checkout -- src/content/presentations/{en,ru}/$SLUG.md"
  log "un-drafted en/ru $SLUG (slides: override stripped)"
}

main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  preflight
  step_build
  step_publish_ghpages
  step_bump_submodule
  step_whitelist
  step_undraft
}
main "$@"
