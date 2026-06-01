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

main() {
  parse_args "$@"
  log "deploy-deck: slug=$SLUG theme=$THEME dry-run=$DRYRUN no-undraft=$NO_UNDRAFT cutover=$CUTOVER"
  # preflight + steps wired in later tasks
}
main "$@"
