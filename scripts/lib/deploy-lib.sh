#!/usr/bin/env bash
# deploy-lib.sh — pure, sourceable helpers for deploy-deck.sh. No side effects, no I/O
# beyond reading the file args passed in. Unit-tested by scripts/tests/.

# validate_slug <slug> → 0 if a safe deck slug, else 1. Guards every path/rm built from it.
validate_slug() {
  local slug="${1:-}"
  [ -n "$slug" ] || return 1
  case "$slug" in
    ''|.|..|/*|*/*|*' '*) return 1 ;;
  esac
  printf '%s' "$slug" | grep -qE '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' || return 1
  return 0
}
