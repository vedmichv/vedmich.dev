#!/usr/bin/env bash
# Tiny assertion harness — no bats dependency. Each test-*.sh defines test_* functions.
set -uo pipefail

# Pin a UTF-8 locale so the validate_slug LC_ALL=C regression test can actually fire. validate_slug
# forces `local LC_ALL=C` internally; if that line is ever removed, the function inherits the ambient
# locale, and ONLY under a UTF-8 locale does the case-glob [!a-z0-9-] collate such that uppercase /
# non-ASCII slugs are wrongly ACCEPTED (the original bug). Under C they're rejected either way — so a
# C-locale runner would pass the suite green even with the fix deleted. Abort if no UTF-8 locale
# exists (can't certify the regression otherwise); a silent fallback to C would re-hide the bug.
_utf8=""
# Capture `locale -a` ONCE into a var and grep the var via here-string. A piped `locale -a | grep -q`
# would, under this file's `set -o pipefail`, report the pipeline as failed (141): grep -q exits on
# first match → SIGPIPE to locale -a → nonzero upstream → pipefail propagates it, hiding the match.
_locales="$(locale -a 2>/dev/null)"
for _L in en_US.UTF-8 C.UTF-8 en_US.utf8 C.utf8; do
  if grep -qixF "$_L" <<<"$_locales"; then _utf8="$_L"; break; fi
done
[ -n "$_utf8" ] || { echo "── FATAL: no UTF-8 locale available; cannot certify the validate_slug locale regression" >&2; exit 96; }
export LC_ALL="$_utf8" LANG="$_utf8"

PASS=0 FAIL=0
assert_ok()   { if "$@"; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(ok):  $*"; fi; }
assert_fail() { if "$@"; then FAIL=$((FAIL+1)); echo "  FAIL(exp-fail): $*"; else PASS=$((PASS+1)); fi; }
assert_eq()   { if [ "$1" = "$2" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(eq): got[$1] want[$2]"; fi; }
assert_empty(){ if [ -z "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(empty): got[$1]"; fi; }
assert_nonempty(){ if [ -n "$1" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "  FAIL(nonempty)"; fi; }
DIR="$(cd "$(dirname "$0")" && pwd)"

# Typo-guard (portable, bash-3.2 safe — command_not_found_handle is bash-4+ so unusable here).
# The harness is not `set -e`, so a test calling a misspelled assertion (`assert_equal` vs
# `assert_eq`) would print "command not found", CONTINUE, and silently skip the check while the test
# still counts as passed. Statically scan every assert_* token used across the test files and abort
# if any is not a defined helper. KNOWN must list exactly the assertions defined above.
KNOWN=" assert_ok assert_fail assert_eq assert_empty assert_nonempty "
_used="$(grep -hoE 'assert_[a-zA-Z_]+' "$DIR"/test-*.sh | sort -u)"
for _a in $_used; do
  case "$KNOWN" in *" $_a "*) : ;; *)
    echo "── FATAL: test files call undefined assertion '$_a' (typo? add it to KNOWN + define it) — failing suite" >&2
    exit 95 ;;
  esac
done

# set -u / a sourced error would kill the runner before the summary prints, hiding all
# later tests behind one typo. This trap guarantees the abort is always visible.
trap 'echo "── ABORTED before completion (set -u/sourced error)"' EXIT
for f in "$DIR"/test-*.sh; do
  echo "── $(basename "$f")"
  # shellcheck disable=SC1090
  . "$f"
  for fn in $(declare -F | awk '{print $3}' | grep '^test_'); do "$fn"; unset -f "$fn"; done
done
trap - EXIT
echo "── total: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
