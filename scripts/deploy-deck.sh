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
  OLDPIN="$(git -C "$SITE_REPO" rev-parse :slidev)"
  # 5. gh-pages repo really on gh-pages
  [ "$(git -C "$GHPAGES_REPO" symbolic-ref --short HEAD)" = "gh-pages" ] \
    || die "$GHPAGES_REPO is not on the gh-pages branch"
  # 6. base-collision guard (B1): slug already on gh-pages at a different base?
  local existing="$GHPAGES_REPO/$SLUG/index.html"
  if [ -f "$existing" ]; then
    if [ -n "$(base_violations "$existing" "/slides/$SLUG/")" ]; then
      [ "$CUTOVER" -eq 1 ] || die "gh-pages /$SLUG/ is built for a DIFFERENT base (legacy s.vedmich.dev). Re-run with --cutover to migrate it to /slides/$SLUG/ (this overwrites the legacy surface)."
      warn "--cutover: will overwrite legacy /$SLUG/ surface and remove its root-index card"
    fi
  fi
  log "preflight OK (oldpin=${OLDPIN:0:9})"
}

main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  preflight
}
main "$@"
