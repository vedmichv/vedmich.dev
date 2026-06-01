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
