# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"
FXSRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fixtures/deploy.fixture.yml"
test_whitelist_add_then_has() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  assert_fail whitelist_has "$tmp" vv-demo
  whitelist_add "$tmp" vv-demo
  assert_ok   whitelist_has "$tmp" vv-demo
  # second slug appends, preserves first
  whitelist_add "$tmp" karpenter-prod
  assert_ok   whitelist_has "$tmp" vv-demo
  assert_ok   whitelist_has "$tmp" karpenter-prod
  rm -f "$tmp"
}
test_whitelist_idempotent() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  whitelist_add "$tmp" vv-demo   # repeat — must NOT duplicate
  assert_eq "$(grep -c 'DEPLOY_DECK_SENTINEL' "$tmp")" 1
  assert_eq "$(grep -oE 'vv-demo' "$tmp" | grep -c .)" 1
  rm -f "$tmp"
}
test_whitelist_yaml_still_parses() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  assert_ok uv run --with pyyaml python3 -c "import yaml,sys; yaml.safe_load(open('$tmp'))"
  rm -f "$tmp"
}
test_whitelist_add_no_sentinel_returns_2() {
  local tmp; tmp=$(mktemp); printf 'no sentinel\n' > "$tmp"
  whitelist_add "$tmp" vv-demo; assert_eq "$?" 2
  rm -f "$tmp"
}
test_whitelist_token_boundary() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  assert_fail whitelist_has "$tmp" vv-demo-evil
  assert_fail whitelist_has "$tmp" vv-dem
  rm -f "$tmp"
}
test_whitelist_get() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  assert_eq "$(whitelist_get "$tmp")" ""          # empty initially
  whitelist_add "$tmp" vv-demo
  whitelist_add "$tmp" karpenter-prod
  assert_eq "$(whitelist_get "$tmp")" "vv-demo karpenter-prod"
  rm -f "$tmp"
}
