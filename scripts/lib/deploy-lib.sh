#!/usr/bin/env bash
# deploy-lib.sh — pure, sourceable helpers for deploy-deck.sh. No side effects, no I/O
# beyond reading the file args passed in. Unit-tested by scripts/tests/.

# validate_slug <slug> → 0 if a safe deck slug, else 1. Guards every path/rm built from it.
# Pure case-based: no subprocess, so no line-by-line `grep` multiline bypass. ASCII charset
# (not [:alnum:], which is locale-aware) keeps the reject deterministic across locales.
validate_slug() {
  local slug="${1:-}"
  local LC_ALL=C                  # byte-wise ranges; without this, bash 3.2 + UTF-8 lets A-Z/unicode through [a-z0-9-]
  case "$slug" in
    ''|.|..|/*|*/*) return 1 ;;
    *[!a-z0-9-]*)   return 1 ;;   # any char outside [a-z0-9-] (covers space, newline, tab, uppercase, dot, slash, unicode)
  esac
  # still require it doesn't start/end with a dash
  case "$slug" in -*|*-) return 1 ;; esac
  return 0
}

# count_root_assets <index_html> → integer count of root-absolute src/href URLs
# (protocol-relative // excluded). Used to ABORT on an empty/broken build.
# Fail-closed: missing OR unreadable index ([ -r ]) → 0 (caller aborts the deploy).
# Only DOUBLE-quoted attrs are matched — Vite/Slidev always emit double quotes.
# Every "nothing to count" outcome (no file, no matches, all protocol-relative) collapses to 0 by design.
count_root_assets() {
  local index="$1"
  [ -r "$index" ] || { echo 0; return 0; }
  grep -oE '(src|href)="/[^"]*"' "$index" \
    | grep -vE '="//' \
    | grep -c . | tr -d ' '
}

# base_violations <index_html> <expected_base> → prints each root-absolute asset URL that
# does NOT sit under <expected_base>, excluding protocol-relative and the two deck-root public
# dirs (/aws-icons/, /modules/) that legitimately live at deck root even when correctly based.
# Empty output = OK. Always exits 0 (caller inspects the output).
# Fail-closed: missing OR unreadable index ([ -r ]) → "NO_INDEX" (non-empty → caller treats as a violation).
# Only DOUBLE-quoted attrs are matched — Vite/Slidev always emit double quotes.
# PRECONDITION: <expected_base> must end in '/'. It is regex-escaped below, but callers derive it from a validate_slug'd slug.
base_violations() {
  local index="$1" base="$2"
  [ -r "$index" ] || { echo "NO_INDEX"; return 0; }
  local esc; esc=$(printf '%s' "$base" | sed -E 's/[][(){}.^$*+?|\\/]/\\&/g')
  grep -oE '(src|href)="/[^"]*"' "$index" \
    | sed -E 's/^(src|href)="//; s/"$//' \
    | grep -vE '^//' \
    | grep -vE '^/(aws-icons|modules)/' \
    | grep -vE "^${esc}" || true
}

# whitelist_has <deploy_yml> <slug> → 0 if slug present in the sentinel SLIDES_WHITELIST line.
# Match is anchored on the actual SLIDES_WHITELIST="..." assignment (not the bare
# DEPLOY_DECK_SENTINEL comment) so a stray comment mentioning the sentinel can't be picked.
# slug is validate_slug'd by callers.
whitelist_has() {
  local file="$1" slug="$2" cur
  cur=$(grep -E '^[[:space:]]*SLIDES_WHITELIST="[^"]*"[[:space:]]*# DEPLOY_DECK_SENTINEL' "$file" \
        | sed -E 's/^[[:space:]]*SLIDES_WHITELIST="([^"]*)".*/\1/')
  case " $cur " in *" $slug "*) return 0 ;; *) return 1 ;; esac
}

# whitelist_add <deploy_yml> <slug> → idempotently append slug to the sentinel SLIDES_WHITELIST
# line, preserving leading indentation. Returns 2 if the sentinel line is missing, 1 on rewrite
# failure (leaves the live file untouched). slug is validate_slug'd by callers.
# Match is anchored on the actual SLIDES_WHITELIST="..." assignment (not the bare
# DEPLOY_DECK_SENTINEL comment) so a stray comment mentioning the sentinel can't be rewritten.
whitelist_add() {
  local file="$1" slug="$2" line cur newval tmp
  line=$(grep -nE '^[[:space:]]*SLIDES_WHITELIST="[^"]*"[[:space:]]*# DEPLOY_DECK_SENTINEL' "$file" | head -1 | cut -d: -f1)
  [ -n "$line" ] || return 2
  cur=$(sed -n "${line}p" "$file" | sed -E 's/^[[:space:]]*SLIDES_WHITELIST="([^"]*)".*/\1/')
  case " $cur " in *" $slug "*) return 0 ;; esac
  if [ -z "$cur" ]; then newval="$slug"; else newval="$cur $slug"; fi
  tmp=$(mktemp) || return 1
  if awk -v ln="$line" -v val="$newval" '
      NR==ln { match($0,/^[[:space:]]*/);
               printf "%sSLIDES_WHITELIST=\"%s\"  # DEPLOY_DECK_SENTINEL\n", substr($0,1,RLENGTH), val; next }
      { print }' "$file" > "$tmp" && [ -s "$tmp" ]; then
    mv -- "$tmp" "$file"
  else
    rm -f "$tmp"; return 1
  fi
}
