---
phase: 2
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - src/i18n/en.json
  - src/i18n/ru.json
autonomous: true
requirements: [REQ-001]
must_haves:
  truths:
    - "`t('en').search.placeholder` returns the English search input placeholder"
    - "`t('ru').search.placeholder` returns the Russian search input placeholder"
    - "Both locales expose the same 7 keys under `search.*`"
  artifacts:
    - path: "src/i18n/en.json"
      provides: "search.* keys (EN)"
      contains: "\"search\":"
    - path: "src/i18n/ru.json"
      provides: "search.* keys (RU)"
      contains: "\"search\":"
  key_links:
    - from: "src/i18n/{en,ru}.json → search.*"
      to: "src/components/SearchPalette.astro (Plan 03)"
      via: "t(locale).search.{placeholder, empty_hint, no_results, footer_move, footer_open, kind_slides, kind_post}"
---

# Plan 02: i18n keys for search palette

<objective>
Add a new `search` block of seven keys to both `src/i18n/en.json` and `src/i18n/ru.json` so the palette UI (Plan 03) has no hardcoded strings. Keys cover the input placeholder, empty-state hint, no-results message, footer hints (move/open), and the two kind badge labels (Slides/Post). This is the only locale-dependent surface the palette needs — the `⌘K`, `Esc`, `↑ ↓ ↵` glyphs stay as literals in the component.
</objective>

<tasks>

<task id="2.1" type="execute">
<action>
In `src/i18n/en.json`, add a new top-level `"search"` block immediately after the existing `"nav"` block (so alphabetical/logical order is preserved — search belongs with nav). Insert these exact key/value pairs:

```json
"search": {
  "placeholder": "Search slides, posts, tags…",
  "empty_hint": "Start typing to search. Try: “karpenter”, “mcp”, “kubernetes”.",
  "no_results": "No matches for",
  "footer_move": "move",
  "footer_open": "open",
  "kind_slides": "Slides",
  "kind_post": "Post"
}
```

Notes:
- `no_results` is a prefix; the palette appends the quoted query on render (e.g. `No matches for "karp".`).
- `footer_move` / `footer_open` are short verbs that follow the `↑ ↓` and `↵` kbd glyphs respectively.
- `kind_slides` / `kind_post` are the UPPERCASE-styled labels in the kind badge; the CSS (`text-transform: uppercase`) handles casing.
- Keep the existing JSON structure intact — do NOT touch `nav`, `hero`, `about`, or any other block. Valid JSON syntax, trailing commas NOT allowed.
- Match the file's existing indentation (2 spaces).
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/en.json (full file — must insert `search` block cleanly after `nav`)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/02-search-palette/02-CONTEXT.md (canonical refs list of required search keys at L66)
</read_first>
<acceptance_criteria>
- `rg "\"search\"" src/i18n/en.json` returns a match
- `rg "\"placeholder\": \"Search slides, posts, tags" src/i18n/en.json` matches (ellipsis optional in grep — fixed string)
- `rg "\"empty_hint\"" src/i18n/en.json` matches
- `rg "\"no_results\"" src/i18n/en.json` matches
- `rg "\"footer_move\"" src/i18n/en.json` matches
- `rg "\"footer_open\"" src/i18n/en.json` matches
- `rg "\"kind_slides\": \"Slides\"" src/i18n/en.json` matches
- `rg "\"kind_post\": \"Post\"" src/i18n/en.json` matches
- `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"` exits 0 (valid JSON)
</acceptance_criteria>
</task>

<task id="2.2" type="execute">
<action>
In `src/i18n/ru.json`, add the mirrored `"search"` block in the same position (right after `"nav"`). Use these Russian translations:

```json
"search": {
  "placeholder": "Поиск по слайдам, постам, тегам…",
  "empty_hint": "Начните вводить запрос. Попробуйте: «karpenter», «mcp», «kubernetes».",
  "no_results": "Ничего не найдено для",
  "footer_move": "навигация",
  "footer_open": "открыть",
  "kind_slides": "Слайды",
  "kind_post": "Пост"
}
```

Notes:
- `\u` escape form is fine if tooling normalises it automatically; plain Cyrillic is also fine (the file already uses `\u` escapes — write plain Cyrillic and let the editor handle serialization, OR match the existing style with `\u` escapes). Prefer plain Cyrillic — Astro/tsc both handle UTF-8 JSON. The build step is the only source of truth.
- `«»` guillemets match the existing JSON convention seen in other `ru.json` blocks.
- Keep existing content intact; only INSERT the new block.
- Valid JSON. Two-space indent to match file.
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/ru.json (full file — verify style/encoding conventions before inserting)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/en.json (parallel structure — insert at same depth)
</read_first>
<acceptance_criteria>
- `rg "\"search\"" src/i18n/ru.json` returns a match
- `rg "\"placeholder\"" src/i18n/ru.json` returns a match inside the `search` block (existing `nav.search_placeholder` will also match — verify by presence of 2 matches AFTER this task, 1 match before)
- `rg "\"kind_slides\"" src/i18n/ru.json` matches
- `rg "\"kind_post\"" src/i18n/ru.json` matches
- `rg "\"footer_move\"" src/i18n/ru.json` matches
- `rg "\"footer_open\"" src/i18n/ru.json` matches
- `rg "\"empty_hint\"" src/i18n/ru.json` matches
- `rg "\"no_results\"" src/i18n/ru.json` matches
- `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json','utf8'))"` exits 0 (valid JSON)
- `npm run build` exits 0 — `t('en').search.placeholder` and `t('ru').search.placeholder` both resolve without TS narrowing errors (both JSON files expose identical top-level key sets, so the union-type inferred by `translations[locale]` is consistent).
</acceptance_criteria>
</task>

</tasks>

<verification>
- Both JSON files parse.
- `npm run build` passes with no new TypeScript errors (the `t(locale)` return type is inferred from both files' union; adding the same keys to both keeps the type shape balanced).
- Plan 03 can reference `t(locale).search.placeholder` and 6 other new keys without adding any string literals to the component.
- Covers **REQ-001 (upgraded)**: the palette can render in both locales, Phase 1's visual pill (which already uses `nav.search_placeholder`) is unchanged.
</verification>
