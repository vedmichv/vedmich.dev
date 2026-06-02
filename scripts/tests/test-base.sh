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
test_base_regex_special_is_escaped() {
  # base /slides/a.b/ — the '.' MUST be escaped. dot-index.html has an asset at /slides/aXb/ which
  # would FALSELY match an unescaped '.' (wildcard) and be treated as "under base" → not flagged.
  # With proper escaping, /slides/aXb/ is NOT under /slides/a.b/ → flagged. (Defense-in-depth: a
  # '.' slug can't pass validate_slug, but a future refactor dropping the escape must fail here.)
  assert_nonempty "$(base_violations "$FX/dot-index.html" /slides/a.b/)"
  # the genuinely-based asset (/slides/a.b/…) is NOT a violation on its own (sanity on the fixture)
  assert_empty "$(base_violations "$FX/dot-only-index.html" /slides/a.b/)"
}
test_count_unreadable_fails_closed() {
  # present-but-unreadable (not just missing) must also fail closed → 0 / NO_INDEX. Skip if root
  # (where -r always succeeds). chmod 000, assert, restore.
  [ "$(id -u)" -eq 0 ] && return 0
  local f; f="$(mktemp)"; printf '<script src="/x/a.js"></script>\n' > "$f"; chmod 000 "$f"
  assert_eq "$(count_root_assets "$f")" 0
  assert_eq "$(base_violations "$f" /slides/x/)" NO_INDEX
  chmod 644 "$f"; rm -f "$f"
}
