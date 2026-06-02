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
test_whitelist_idempotent_returns_zero() {
  # the "already present" branch must return 0 (idempotent no-op), not just avoid duplicating.
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" vv-demo
  whitelist_add "$tmp" vv-demo; assert_eq "$?" 0
  rm -f "$tmp"
}
test_whitelist_has_missing_file_fails_closed() {
  # a missing file must read as "absent" (nonzero), never as present.
  assert_fail whitelist_has /no/such/deploy.yml vv-demo
}
test_whitelist_get_missing_file_empty() {
  assert_eq "$(whitelist_get /no/such/deploy.yml)" ""
}
test_whitelist_add_missing_file_returns_2() {
  # no sentinel line (because no file) → return 2, never silently "succeed".
  whitelist_add /no/such/deploy.yml vv-demo; assert_eq "$?" 2
}
test_whitelist_get_no_sentinel_empty() {
  local tmp; tmp=$(mktemp); printf 'jobs:\n  build:\n    steps: []\n' > "$tmp"
  assert_eq "$(whitelist_get "$tmp")" ""
  rm -f "$tmp"
}
test_whitelist_stray_comment_not_picked() {
  # a decoy comment mentioning the sentinel must NOT be picked over the real assignment.
  local tmp; tmp=$(mktemp)
  printf '%s\n' \
    '          # historical note: SLIDES_WHITELIST="ghost"  # DEPLOY_DECK_SENTINEL (do not use)' \
    '          SLIDES_WHITELIST="vv-demo karpenter-prod"  # DEPLOY_DECK_SENTINEL' > "$tmp"
  # whitelist_get/has anchor on a line STARTING with optional-space + SLIDES_WHITELIST= (the comment
  # line starts with '#', so it is skipped). The real list must win.
  assert_eq "$(whitelist_get "$tmp")" "vv-demo karpenter-prod"
  assert_ok   whitelist_has "$tmp" karpenter-prod
  assert_fail whitelist_has "$tmp" ghost
  rm -f "$tmp"
}
test_whitelist_has_middle_and_last_token() {
  local tmp; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" aa; whitelist_add "$tmp" bb; whitelist_add "$tmp" cc
  assert_ok whitelist_has "$tmp" aa   # first
  assert_ok whitelist_has "$tmp" bb   # middle
  assert_ok whitelist_has "$tmp" cc   # last
  rm -f "$tmp"
}
test_whitelist_add_atomic_on_awk_failure() {
  # Atomicity guard: if the rewrite produces nothing usable, whitelist_add must return 1 and leave
  # the live file BYTE-IDENTICAL (never clobber it with empty output). Force the failure by shadowing
  # `awk` with a stub that exits 1, via a PATH prepend in a SUBSHELL (doesn't leak to other tests).
  local tmp stub before after rc; tmp=$(mktemp); cp "$FXSRC" "$tmp"
  whitelist_add "$tmp" realdeck            # seed one entry so the file has content to preserve
  before="$(cat "$tmp")"
  stub="$(mktemp -d)"; printf '#!/bin/sh\nexit 1\n' > "$stub/awk"; chmod +x "$stub/awk"
  ( PATH="$stub:$PATH"; whitelist_add "$tmp" newdeck ); rc=$?
  after="$(cat "$tmp")"
  assert_eq "$rc" 1                        # signalled failure
  assert_eq "$after" "$before"             # live file untouched (byte-identical)
  rm -rf "$stub"; rm -f "$tmp"
}
