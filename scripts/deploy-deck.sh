#!/bin/bash
# deploy-deck.sh — fail-closed autopilot: publish a slidev-theme-vv deck to vedmich.dev/slides/<slug>/.
# macOS/BSD/bash-3.2 safe: no `sed -i`, no `timeout`, no bash-4 features. See
# docs/superpowers/specs/2026-06-01-vedmich-dev-skill-slides-deploy-design.md and docs/slides-onboarding.md.
#
# SHEBANG IS /bin/bash ON PURPOSE (not /usr/bin/env bash). This script is macOS-local (its repo paths
# are hard-coded under ~/Documents/GitHub) and the "bash-3.2 safe" contract is real: /bin/bash on
# macOS is genuine 3.2.57. Pinning it here ENFORCES that contract — any accidental bash-4ism breaks
# loudly at the certification target instead of silently passing under a Homebrew bash 5 that
# `env bash` would pick up. The test harness (scripts/tests/run.sh) keeps `#!/usr/bin/env bash` so the
# unit suite runs under whatever bash the dev has; both bashes are exercised in CI-local verification.
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

# Advisory single-instance lock. Two concurrent runs share the gh-pages clone, the submodule, and
# the site working tree — interleaving them can corrupt a slot mid-swap or push a half-built tree.
# bash 3.2 / macOS has no flock(1), so use the atomic `mkdir` idiom (mkdir fails if the dir exists).
# Global (not per-slug): the shared state is shared regardless of slug. Stale-lock safe: the holder
# writes its PID; a lock whose PID is dead is reclaimed (covers SIGKILL/reboot leaving a dir behind).
LOCKDIR="${TMPDIR:-/tmp}/deploy-deck.lock"
LOCK_HELD=0
acquire_lock() {
  if mkdir "$LOCKDIR" 2>/dev/null; then
    LOCK_HELD=1; echo $$ > "$LOCKDIR/pid"; return 0
  fi
  local opid; opid="$(cat "$LOCKDIR/pid" 2>/dev/null || echo '')"
  if [ -n "$opid" ] && kill -0 "$opid" 2>/dev/null; then
    die "another deploy-deck.sh is running (pid $opid). If you are certain it is not, run: rm -rf '$LOCKDIR'"
  fi
  warn "reclaiming stale lock (holder pid ${opid:-unknown} not alive)"
  rm -rf "$LOCKDIR"
  mkdir "$LOCKDIR" 2>/dev/null || die "could not acquire lock at $LOCKDIR"
  LOCK_HELD=1; echo $$ > "$LOCKDIR/pid"
}
# Only the holder removes the lock — a process that failed to acquire must NOT delete the live one.
release_lock() { [ "$LOCK_HELD" -eq 1 ] && rm -rf "$LOCKDIR"; return 0; }

trap 'die "aborted during: $CURRENT_STEP"' ERR
trap 'release_lock' EXIT

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
GHPAGES_BEHIND=0   # set by preflight (GAP2): #commits the gh-pages clone is behind origin; ff'd in publish

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
  #    GAP1: site repo must be on main. The deploy commits land on the CURRENT branch, but
  #    step_finalize runs `git push origin main` — pushing the local main REF. From a feature
  #    branch that pushes a STALE main (empty whitelist) → 404, while the real commit rots on feat.
  [ "$(git -C "$SITE_REPO" symbolic-ref --short HEAD 2>/dev/null)" = "main" ] \
    || die "site repo must be on 'main' (deploy commits + 'git push origin main' assume it). Current: $(git -C "$SITE_REPO" symbolic-ref --short HEAD 2>/dev/null || echo detached). Run: git -C \"$SITE_REPO\" checkout main"
  #    GAP4a: the SPA-fallback that makes deep-links (/slides/<slug>/N) work. If removed, deep-links
  #    silently 404 (Pages serves its built-in page instead of our deck-shell injector).
  [ -f "$SITE_REPO/src/pages/404.astro" ] \
    || die "missing src/pages/404.astro — deep-links (/slides/<slug>/N) will 404. See docs/slides-onboarding.md / the deep-link fix."
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
  # 5b. GAP2: the push-target clone is SHARED with the slurm pipeline (other machine pushes here).
  # If it's behind origin, `git push origin gh-pages` mid-deploy is rejected. Fetch updates only the
  # remote-tracking ref, never the working tree, so it's safe to run even in --dry-run (keeps the
  # dry-run honest — surfaces a behind/diverged clone). The actual fast-forward is gated to the real
  # run (top of step_publish_ghpages, via run()). ahead = our local-only commits.
  log "fetch gh-pages clone (freshness check)"
  git -C "$GHPAGES_REPO" fetch --quiet origin gh-pages || die "cannot fetch origin gh-pages in $GHPAGES_REPO"
  GHPAGES_BEHIND="$(git -C "$GHPAGES_REPO" rev-list --count HEAD..origin/gh-pages 2>/dev/null || echo 0)"
  local ghpages_ahead; ghpages_ahead="$(git -C "$GHPAGES_REPO" rev-list --count origin/gh-pages..HEAD 2>/dev/null || echo 0)"
  if [ "$GHPAGES_BEHIND" -gt 0 ] && [ "$ghpages_ahead" -gt 0 ]; then
    die "gh-pages clone has diverged (ahead=$ghpages_ahead, behind=$GHPAGES_BEHIND) — resolve manually in $GHPAGES_REPO"
  elif [ "$GHPAGES_BEHIND" -gt 0 ]; then
    warn "gh-pages clone is $GHPAGES_BEHIND commit(s) behind origin — will fast-forward at the top of the publish step"
  fi
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
  # GAP2: if preflight found the shared clone behind origin (and NOT diverged — that already died),
  # fast-forward it before snapshotting/committing so the subsequent push is a clean fast-forward.
  # Safe: gh-pages here is a pure artifact target, never hand-edited, so --ff-only can't lose work.
  # Gated via run() → dry-run only prints it (no working-tree mutation in dry-run).
  if [ "$GHPAGES_BEHIND" -gt 0 ]; then
    run "fast-forward gh-pages clone to origin ($GHPAGES_BEHIND behind)" -- \
      git -C "$GHPAGES_REPO" merge --ff-only origin/gh-pages
  fi
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
  # drag-detection GATE (GAP3) — whitelisted-only semantics.
  # The diff baseline is OLDPIN (the LAST pinned submodule SHA), not gh-pages-pre-push. So the
  # OLDPIN..PUSHED diff may touch co-tenant decks (slurm-ai-agents/, dkt/) pushed to the SHARED
  # gh-pages since the last pin bump. But vedmich.dev's CI only COPIES WHITELISTED slugs into
  # dist/slides/ — a co-tenant deck NOT in the whitelist is never served by this site, so dragging
  # its bytes through the pointer bump is HARMLESS. The bump is unsafe ONLY if it changes a
  # DIFFERENT *whitelisted* (served) slug — that would silently re-deploy someone else's deck.
  # Our own $SLUG (expected) + root files (CNAME/404.html/index.html) are always allowed.
  # NOTE on ordering: step_whitelist runs AFTER this in main(), so $SLUG may not yet be in the
  # committed whitelist at gate time — fine, we `continue` on $SLUG explicitly regardless.
  if git -C "$SUBMODULE" cat-file -e "$OLDPIN" 2>/dev/null; then
    local wl; wl=" $(whitelist_get "$SITE_REPO/.github/workflows/deploy.yml") "
    local changed_top dragged="" d
    changed_top="$(git -C "$SUBMODULE" diff --name-only "$OLDPIN" "$PUSHED" | awk -F/ 'NF>1{print $1}' | sort -u)"
    set -f   # noglob: $changed_top is unquoted in the for-loop; a dir name with */?/[ must not glob cwd
    for d in $changed_top; do
      [ "$d" = "$SLUG" ] && continue
      case "$wl" in *" $d "*) dragged="$dragged $d" ;; esac   # a DIFFERENT whitelisted (served) slug changed
    done
    set +f
    [ -z "$dragged" ] || die "submodule bump would change other SERVED (whitelisted) deck(s):$dragged — bump deliberately"
    # non-whitelisted co-tenant dirs (slurm-ai-agents etc.) are not served by vedmich.dev — allowed
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
  # three-way parity gate (I1), now via the tested lib fn draft_state (case-insensitive, comment-
  # tolerant — `draft: True` is correctly a draft, not silently "published"): both-published →
  # idempotent no-op; MIXED → die; both-draft → proceed. `none`/`ambiguous`/`unreadable` from either
  # locale → die (never guess at a malformed/missing draft: key).
  local en_state ru_state
  en_state="$(draft_state "$en")"; ru_state="$(draft_state "$ru")"
  case "$en_state" in draft|published) ;; *) die "cannot read draft state of $en (got '$en_state') — fix the draft: frontmatter";; esac
  case "$ru_state" in draft|published) ;; *) die "cannot read draft state of $ru (got '$ru_state') — fix the draft: frontmatter";; esac
  if [ "$en_state" = published ] && [ "$ru_state" = published ]; then
    log "both cards already published (idempotent)"; return 0
  fi
  [ "$en_state" = draft ] && [ "$ru_state" = draft ] \
    || die "MIXED draft state for $SLUG (en=$en_state, ru=$ru_state) — set both to draft:true (or both false) before deploying"
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] un-draft + strip slides: in en/ru %s.md\n' "$SLUG"; return 0; fi
  # all-or-nothing (C1): record rollback BEFORE any mv, transform BOTH to temps, validate BOTH, then
  # mv BOTH. A mid-loop failure can no longer leave en=false / ru=true with no recovery hint.
  note_rollback "re-draft cards: git -C '$SITE_REPO' checkout -- src/content/presentations/en/$SLUG.md src/content/presentations/ru/$SLUG.md"
  local ten tru
  ten="$(mktemp)"; tru="$(mktemp)"
  undraft_content "$en" > "$ten" || { rm -f "$ten" "$tru"; die "un-draft transform failed for $en"; }
  undraft_content "$ru" > "$tru" || { rm -f "$ten" "$tru"; die "un-draft transform failed for $ru"; }
  # post-check via the same lib fn: both temps must now read as published; anything else → false-die
  # before any mv (so the live files are untouched).
  [ "$(draft_state "$ten")" = published ] || { rm -f "$ten" "$tru"; die "un-draft failed for $en (still $(draft_state "$ten"))"; }
  [ "$(draft_state "$tru")" = published ] || { rm -f "$ten" "$tru"; die "un-draft failed for $ru (still $(draft_state "$tru"))"; }
  mv -- "$ten" "$en"
  mv -- "$tru" "$ru"
  log "un-drafted en/ru $SLUG (slides: override stripped)"
}

ci_equiv_gate() {
  CURRENT_STEP="ci-gate"
  log "CI-equivalent gate (Astro build + replicate whitelist cp + base grep)…"
  # Clean dist/ AND .astro/ before building. CI runs on a FRESH checkout where neither exists;
  # a truly CI-equivalent local build must replicate that clean state. A leftover dist/ from a
  # prior build can carry stale Vite/Astro chunk hashes → `npm run build` dies with
  # "Cannot find module .../dist/chunks/content-assets_*.mjs", fail-closing a LEGIT deploy
  # (hit once during T17 verify). .astro/ holds the content-layer cache + generated types and is
  # regenerated by the build. Both are gitignored (.gitignore:2,4) so this rm is safe + reversible.
  # NOT gated behind run(): like step_build's `rm -rf "$DIST"`, the build below runs for real even
  # in --dry-run (it's the cheap catch of the expensive mistake), so its clean must run too — else a
  # dry-run (always run first) would still build on a stale cache and could hit the flake we fix here.
  log "clean Astro build caches (CI-equivalence): dist/ + .astro/"
  rm -rf -- "$SITE_REPO/dist" "$SITE_REPO/.astro"
  ( cd "$SITE_REPO" && npm run build ) || die "astro build failed — NOT pushing"
  local sd="$SITE_REPO/dist/slides/$SLUG" src
  if [ -d "$SUBMODULE/$SLUG" ]; then
    src="$SUBMODULE/$SLUG"            # real run: the pinned artifact CI will actually serve
  else
    src="$DIST"                       # dry-run / pre-bump: the freshly-built, same-base deck
    warn "ci-gate: submodule lacks $SLUG (not bumped yet) — validating freshly-built dist instead"
  fi
  rm -rf -- "$sd"; mkdir -p "$sd"; cp -R "$src/." "$sd/"
  [ -f "$sd/index.html" ] && [ -f "$sd/404.html" ] || die "deck copy missing index/404 for $SLUG (src=$src)"
  assert_base "$sd/index.html"
  # Full-whitelist existence check. CI runs `for slug in $SLIDES_WHITELIST; do cp slidev/$slug …`;
  # a whitelisted slug MISSING from the pinned submodule makes that cp fail and takes down the WHOLE
  # Pages build (not just one deck). The single-$SLUG cp above can't catch a co-tenant gone stale.
  # CRITICAL: `local IFS=' '` — the script's global IFS=$'\n\t' has no space, so a space-separated
  # whitelist would iterate as ONE token (the exact trap the reviewer warned the obvious fix hits).
  # Our own $SLUG is validated separately above (it may not be in the committed whitelist yet, and in
  # dry-run isn't bumped into the submodule), so skip it here. Missing co-tenant → die (real) / warn
  # (dry-run, where the submodule may legitimately lag the whitelist).
  local wl_all wl_slug
  wl_all="$(whitelist_get "$SITE_REPO/.github/workflows/deploy.yml")"
  if [ -n "$wl_all" ]; then
    local IFS=' '
    for wl_slug in $wl_all; do
      [ "$wl_slug" = "$SLUG" ] && continue
      [ -d "$SUBMODULE/$wl_slug" ] && continue
      if [ "$DRYRUN" -eq 1 ]; then
        warn "ci-gate: whitelisted '$wl_slug' missing from submodule (dry-run; may not be pinned yet)"
      else
        die "whitelisted deck '$wl_slug' is missing from the pinned submodule ($SUBMODULE/$wl_slug) — CI's cp would fail and break the ENTIRE Pages build. Remove it from the whitelist or bump the submodule to a SHA that includes it."
      fi
    done
  fi
  # the uncommented whitelist for-loop must still be valid bash
  local wlf; wlf="$(mktemp)"
  uv run --with pyyaml python3 - "$SITE_REPO/.github/workflows/deploy.yml" > "$wlf" <<'PY' || { rm -f "$wlf"; die "cannot extract whitelist run block"; }
import yaml,sys
d=yaml.safe_load(open(sys.argv[1]))
s=[x for x in d['jobs']['build']['steps'] if x.get('name','').startswith('Copy Slidev')][0]
sys.stdout.write(s['run'])
PY
  bash -n "$wlf" || { rm -f "$wlf"; die "whitelist run-block is not valid bash"; }
  rm -f "$wlf"
  log "CI-equivalent gate OK"
}

step_finalize() {
  CURRENT_STEP="finalize"
  ci_equiv_gate
  if [ "$DRYRUN" -eq 1 ]; then printf '  [dry-run] commit+push main, poll Pages, curl /slides/%s/\n' "$SLUG"; return 0; fi
  # The un-drafted cards (step_undraft) MUST land in the SAME commit as the submodule bump + whitelist.
  # If they don't: (a) the homepage card never publishes — CI builds origin/main where it's still
  # draft:true; and (b) the orphaned working-tree edit makes the NEXT run's preflight die on a dirty
  # tree, bricking all future deploys. Atomic single commit also means the auto-revert below
  # (git revert $sha) re-drafts the card too — a failed deploy can't leave a published card pointing
  # at a reverted deck. NO_UNDRAFT=1 (theme demos like vv-demo) skips step_undraft, so no card paths.
  local cards=""
  if [ "$NO_UNDRAFT" -eq 0 ]; then
    cards="src/content/presentations/en/$SLUG.md src/content/presentations/ru/$SLUG.md"
  fi
  run "commit site (submodule bump + whitelist$([ -n "$cards" ] && echo ' + cards')" -- \
    sh -c "cd '$SITE_REPO' && git add slidev .github/workflows/deploy.yml $cards && (git diff --cached --quiet || git commit -m 'deploy(slides): $SLUG → /slides/$SLUG/')"
  local sha; sha="$(git -C "$SITE_REPO" rev-parse HEAD)"
  run "push main" -- git -C "$SITE_REPO" push origin main
  note_rollback "revert site commit: (cd '$SITE_REPO' && git revert --no-edit $sha && git push origin main)"
  # poll Pages keyed on THIS sha (no `timeout`; bounded loop)
  log "waiting for Pages build of ${sha}…"
  local i=0 st=""
  while [ "$i" -lt 60 ]; do
    st="$(gh run list --repo vedmichv/vedmich.dev --commit "$sha" --json status --jq '.[0].status' 2>/dev/null || echo '')"
    [ "$st" = "completed" ] && break
    i=$((i+1)); sleep 10
  done
  [ "$st" = "completed" ] || warn "Pages run not 'completed' after ~10min (status='$st') — verifying live anyway"
  # status=completed includes failure/cancelled — read the conclusion too (I2): a FAILED build can
  # leave the OLD deploy live → root 200 → false "LIVE OK". The live curl is still the real test,
  # but warn loudly so a green-looking run with a stale surface isn't mistaken for success.
  local concl; concl="$(gh run list --repo vedmichv/vedmich.dev --commit "$sha" --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo '')"
  [ "$concl" = "success" ] || warn "Pages run conclusion='$concl' (not success) — the live curl below is the real test; a 200 may be the PREVIOUS deploy if the build failed"
  # live verification. The root-200 check is the HARD gate (auto-revert on miss); the asset/404
  # checks below are intentionally SOFT (warn-only) — best-effort deep-link confirmation, not gates.
  # CDN-lag grace (I1): poll the edge for ~90s before treating a non-200 as a real failure, so a
  # transient 404/503 at the edge can't auto-revert a GOOD deploy. M1: `|| echo '000'` keeps a curl
  # connection-failure in-band (no generic ERR-trap abort mid-verification).
  local code="000" tries=0
  while [ "$tries" -lt 6 ]; do
    code="$(curl -s -o /dev/null -w '%{http_code}' "https://vedmich.dev/slides/$SLUG/" || echo '000')"
    [ "$code" = "200" ] && break
    tries=$((tries+1)); log "live root $code (try $tries/6) — waiting for CDN…"; sleep 15
  done
  if [ "$code" != "200" ]; then
    warn "live root returned $code after grace window — auto-reverting $sha"
    if ! git -C "$SITE_REPO" revert --no-edit "$sha"; then
      die "AUTO-REVERT FAILED: 'git revert $sha' did not apply (tree not clean / not revertible). The BAD deploy is STILL LIVE at https://vedmich.dev/slides/$SLUG/. Manual fix: resolve the revert, then 'git -C $SITE_REPO push origin main'."
    fi
    if ! git -C "$SITE_REPO" push origin main; then
      die "AUTO-REVERT HALF-DONE: revert commit created LOCALLY but 'git push origin main' FAILED. The BAD deploy is STILL LIVE. Run: 'git -C $SITE_REPO push origin main' (revert already committed — do NOT revert again)."
    fi
    die "deploy verification FAILED (root $code); reverted $sha and pushed — recovery deploy QUEUED (expect 2-5 min per concurrency: pages)."
  fi
  local asset; asset="$(curl -s "https://vedmich.dev/slides/$SLUG/" | grep -oE '/slides/'"$SLUG"'/assets/[^"]+\.(js|css)' | head -1)"
  [ -n "$asset" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "https://vedmich.dev$asset")" = "200" ] \
    || warn "could not confirm a hashed asset 200 (asset='$asset')"
  curl -s "https://vedmich.dev/slides/$SLUG/404.html" | grep -q "/slides/$SLUG/" \
    || warn "deck 404.html base not confirmed (deep-link fallback)"
  # GAP4b (SOFT): actually fetch a deep-link and confirm Pages serves OUR SPA-fallback shell, not
  # GitHub's built-in 404. A deep-link is HTTP 404 BY DESIGN (no file on disk); the BODY is the test.
  # Our dist/404.html (built from src/pages/404.astro) is <title>Redirecting…</title> + an injector
  # that does fetch('/slides/'+slug+'/index.html') — so the literal "slides/$SLUG" is NOT in the raw
  # HTML (slug is a JS var), but "redirect" (from the title) is. GitHub's default 404 has neither.
  local dl; dl="$(curl -s "https://vedmich.dev/slides/$SLUG/10" || echo '')"
  printf '%s' "$dl" | grep -q "slides/$SLUG" || printf '%s' "$dl" | grep -qi 'redirect' \
    || warn "deep-link /slides/$SLUG/10 did not return the SPA-fallback (got $(printf '%s' "$dl" | grep -qi 'there isn.t a github pages site\|page not found . github' && echo 'GitHub default 404' || echo 'unknown')) — deep-links may be broken; check src/pages/404.astro"
  log "LIVE OK → https://vedmich.dev/slides/$SLUG/"
}

main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  # Lock even in --dry-run: the dry-run does a real slidev build + a real Astro build, both of which
  # write shared dist/ dirs a concurrent real run also touches.
  acquire_lock
  preflight
  step_build
  step_publish_ghpages
  step_bump_submodule
  step_whitelist
  step_undraft
  step_finalize
  log "done."
}
main "$@"
