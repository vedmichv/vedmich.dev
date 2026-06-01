#!/usr/bin/env bash
# Tiny assertion harness — no bats dependency. Each test-*.sh defines test_* functions.
set -uo pipefail
PASS=0 FAIL=0
assert_ok()   { if "$@"; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(ok):  $*"; fi; }
assert_fail() { if "$@"; then FAIL=$((FAIL+1)); echo "  FAIL(exp-fail): $*"; else PASS=$((PASS+1)); fi; }
assert_eq()   { if [ "$1" = "$2" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(eq): got[$1] want[$2]"; fi; }
assert_empty(){ if [ -z "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(empty): got[$1]"; fi; }
assert_nonempty(){ if [ -n "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(nonempty)"; fi; }
DIR="$(cd "$(dirname "$0")" && pwd)"
for f in "$DIR"/test-*.sh; do
  echo "── $(basename "$f")"
  # shellcheck disable=SC1090
  . "$f"
  for fn in $(declare -F | awk '{print $3}' | grep '^test_'); do "$fn"; unset -f "$fn"; done
done
echo "── total: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
