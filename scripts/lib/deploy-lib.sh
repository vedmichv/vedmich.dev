#!/usr/bin/env bash
# deploy-lib.sh — pure, sourceable helpers for deploy-deck.sh. No side effects, no I/O
# beyond reading the file args passed in. Unit-tested by scripts/tests/.

# validate_slug <slug> → 0 if a safe deck slug, else 1. Guards every path/rm built from it.
# Pure case-based: no subprocess, so no line-by-line `grep` multiline bypass. ASCII charset
# (not [:alnum:], which is locale-aware) keeps the reject deterministic across locales.
validate_slug() {
  local slug="${1:-}"
  case "$slug" in
    ''|.|..|/*|*/*) return 1 ;;
    *[!a-z0-9-]*)   return 1 ;;   # any char outside [a-z0-9-] (covers space, newline, tab, uppercase, dot, slash, unicode)
  esac
  # still require it doesn't start/end with a dash
  case "$slug" in -*|*-) return 1 ;; esac
  return 0
}
