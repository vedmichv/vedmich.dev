# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
FX="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fixtures"
test_good_has_no_violations() {
  assert_empty "$(base_violations "$FX/good-index.html" /slides/vv-demo/)"
}
test_good_counts_root_assets() {
  # 2 slug-based + 2 public-dir = 4 root-absolute (external https excluded by pattern)
  assert_eq "$(count_root_assets "$FX/good-index.html")" 4
}
test_bad_reports_legacy_base() {
  assert_nonempty "$(base_violations "$FX/bad-index.html" /slides/vv-demo/)"
}
test_sibling_prefix_is_flagged() {
  assert_nonempty "$(base_violations "$FX/sibling-index.html" /slides/vv-demo/)"
}
test_minified_single_line() {
  # 3 good (2 slug + 1 aws-icons) + 1 legacy bad = 4 root assets; legacy must be flagged
  assert_eq "$(count_root_assets "$FX/min-index.html")" 4
  assert_nonempty "$(base_violations "$FX/min-index.html" /slides/vv-demo/)"
}
test_missing_index_fails_closed() {
  assert_eq "$(count_root_assets "$FX/nope.html")" 0
  assert_eq "$(base_violations "$FX/nope.html" /slides/vv-demo/)" NO_INDEX
}
