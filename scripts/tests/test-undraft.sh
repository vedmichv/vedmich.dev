# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/deploy-lib.sh"

# Helper: write a card body to a temp file and echo its path.
_card() { local t; t="$(mktemp)"; printf '%s' "$1" > "$t"; echo "$t"; }

test_draft_state_lowercase_true() {
  local f; f="$(_card 'title: x
draft: true
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}
test_draft_state_yaml_truthy_True() {
  # THE original bug: `draft: True` was mis-read as published → card never un-drafted.
  local f; f="$(_card 'draft: True
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}
test_draft_state_TRUE_uppercase() {
  local f; f="$(_card 'draft: TRUE
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}
test_draft_state_trailing_comment() {
  local f; f="$(_card 'draft: true   # keep hidden for now
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}
test_draft_state_multispace() {
  local f; f="$(_card 'draft:    true
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}
test_draft_state_false() {
  local f; f="$(_card 'draft: false
')"
  assert_eq "$(draft_state "$f")" published
  rm -f "$f"
}
test_draft_state_false_caps() {
  local f; f="$(_card 'draft: False
')"
  assert_eq "$(draft_state "$f")" published
  rm -f "$f"
}
test_draft_state_no_key() {
  local f; f="$(_card 'title: x
event: y
')"
  assert_eq "$(draft_state "$f")" none
  rm -f "$f"
}
test_draft_state_ambiguous() {
  local f; f="$(_card 'draft: maybe
')"
  assert_eq "$(draft_state "$f")" ambiguous
  rm -f "$f"
}
test_draft_state_unreadable() {
  assert_eq "$(draft_state /no/such/file.md)" unreadable
}
test_draft_state_not_fooled_by_other_keys() {
  # a `draft` substring in another field's value must not be picked
  local f; f="$(_card 'title: "first draft"
description: "true story"
draft: true
')"
  assert_eq "$(draft_state "$f")" draft
  rm -f "$f"
}

test_undraft_content_flips_true() {
  local f; f="$(_card 'title: x
slides: "https://s.vedmich.dev/karp/"
draft: true
')"
  local out; out="$(undraft_content "$f")"
  # draft flipped
  printf '%s' "$out" | grep -qE '^draft: false$'        && assert_ok true  || assert_ok false
  # legacy slides override stripped
  printf '%s' "$out" | grep -q 's.vedmich.dev'          && assert_ok false || assert_ok true
  # title preserved
  printf '%s' "$out" | grep -q 'title: x'               && assert_ok true  || assert_ok false
  rm -f "$f"
}
test_undraft_content_flips_True_to_lowercase_false() {
  local f; f="$(_card 'draft: True
')"
  assert_eq "$(undraft_content "$f")" "draft: false"
  rm -f "$f"
}
test_undraft_content_preserves_trailing_comment() {
  local f; f="$(_card 'draft: true   # hidden
')"
  # value flips but the comment survives (we only replace the true token)
  printf '%s' "$(undraft_content "$f")" | grep -qE '^draft: false   # hidden$' && assert_ok true || assert_ok false
  rm -f "$f"
}
test_undraft_content_roundtrips_to_published() {
  local f; f="$(_card 'draft: True
slides: "https://s.vedmich.dev/x/"
')"
  local t; t="$(mktemp)"; undraft_content "$f" > "$t"
  assert_eq "$(draft_state "$t")" published
  rm -f "$f" "$t"
}
test_undraft_content_unreadable_returns_1() {
  undraft_content /no/such/file.md; assert_eq "$?" 1
}
