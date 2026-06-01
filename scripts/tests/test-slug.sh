# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
test_slug_valid() {
  assert_ok   validate_slug vv-demo
  assert_ok   validate_slug karpenter-prod
  assert_ok   validate_slug a1
}
test_slug_invalid() {
  assert_fail validate_slug ""
  assert_fail validate_slug -lead
  assert_fail validate_slug trail-
  assert_fail validate_slug "has space"
  assert_fail validate_slug ../etc
  assert_fail validate_slug a/b
  assert_fail validate_slug .
  assert_fail validate_slug UPPER
  assert_fail validate_slug "$(printf 'ab\ncd')"
  assert_fail validate_slug "$(printf 'ab\tcd')"
}
