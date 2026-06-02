# shellcheck disable=SC1091
# Portability contract: the deploy script + lib MUST parse under genuine macOS /bin/bash (3.2.57),
# and the script's shebang MUST stay pinned to /bin/bash so the contract is enforced at runtime.
_SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

test_deploy_script_parses_under_bash32() {
  # /bin/bash on macOS is 3.2.57 — the certification target. If absent (non-macOS CI), skip.
  if [ ! -x /bin/bash ]; then assert_ok true; return 0; fi
  /bin/bash -n "$_SCRIPTS/deploy-deck.sh"; assert_eq "$?" 0
}
test_lib_parses_under_bash32() {
  if [ ! -x /bin/bash ]; then assert_ok true; return 0; fi
  /bin/bash -n "$_SCRIPTS/lib/deploy-lib.sh"; assert_eq "$?" 0
}
test_deploy_script_shebang_pinned() {
  # First line must be exactly #!/bin/bash (NOT /usr/bin/env bash) so the 3.2 contract is enforced.
  local first; first="$(head -1 "$_SCRIPTS/deploy-deck.sh")"
  assert_eq "$first" '#!/bin/bash'
}
test_no_bash4_constructs() {
  # Cheap grep for the bash-4+ features the contract forbids: `mapfile`/`readarray`, `${v^^}`/`${v,,}`
  # case-mod expansions, `declare -A` assoc arrays, and `&>>` (3.2 lacks it). A hit fails the suite.
  # (declare -F in run.sh is fine — that's -F, not -A.) Matches are reported for debugging.
  local hits
  hits="$(grep -nE 'mapfile|readarray|\$\{[A-Za-z_][A-Za-z0-9_]*\^\^|\$\{[A-Za-z_][A-Za-z0-9_]*,,|declare[[:space:]]+-A|&>>' \
          "$_SCRIPTS/deploy-deck.sh" "$_SCRIPTS/lib/deploy-lib.sh" || true)"
  [ -z "$hits" ] || echo "  bash-4 construct(s) found:"$'\n'"$hits"
  assert_empty "$hits"
}
