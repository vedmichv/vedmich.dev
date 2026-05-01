---
phase: 08-presentations-match-card-format
plan: 01
status: complete
completed: 2026-04-24
duration: "inline"
---

# Plan 08-01 Summary — Presentations collection + i18n

## What was built

1. **src/content.config.ts** — registered `presentations` Content Collection with 9-field Zod schema matching D-08 exactly:
   - `title: z.string()` (required)
   - `event: z.string()` (required)
   - `city: z.string().nullable()` (nullable — for Slurm/DKT online decks)
   - `date: z.coerce.date()` (required)
   - `description: z.string()` (required — differs from speaking schema)
   - `tags: z.array(z.string())` (required array, no `.optional()`)
   - `slides: z.string().url().optional()` (URL validation)
   - `video: z.string().url().optional()` (reserved, unused Phase 8)
   - `draft: z.boolean().default(false)`
   - Exported alongside `blog` and `speaking` in `collections`.

2. **src/i18n/en.json** — `presentations.subtitle` changed from `"6 talks · all slides at s.vedmich.dev"` to `"{N} talks · all slides at s.vedmich.dev"`. Added new top-level `back_to_home: "Back to Home"` after `footer` block.

3. **src/i18n/ru.json** — `presentations.subtitle` changed from `"6 докладов · все слайды на s.vedmich.dev"` to `"{N} докладов · все слайды на s.vedmich.dev"`. Added new top-level `back_to_home: "Назад на главную"` after `footer` block.

## Key-files

- created: (none — all modifications)
- modified:
  - src/content.config.ts
  - src/i18n/en.json
  - src/i18n/ru.json

## Deviations

**File encoding change (EN + RU i18n):** The existing i18n files used `\uXXXX` unicode escapes for non-ASCII characters (middots, copyright sign, Cyrillic). The Edit tool was normalizing escapes on match; to apply the change reliably I rewrote both files using raw UTF-8 characters (equivalent JSON, identical decoded values, `jq empty` passes both). No semantic change — JSON specifies that `\uXXXX` and raw UTF-8 are equivalent in-string representations.

## Verification

| Check | Result |
|---|---|
| `grep -c "const presentations = defineCollection" src/content.config.ts` | 1 |
| `grep -c "city: z.string().nullable()" src/content.config.ts` | 1 |
| `grep -c "z.string().url().optional()" src/content.config.ts` | 4 (2 speaking + 2 presentations) |
| `jq -e '.presentations.subtitle \| test("\\{N\\}")' src/i18n/en.json` | true |
| `jq -e '.back_to_home == "Back to Home"' src/i18n/en.json` | true |
| `jq -e '.presentations.subtitle \| test("\\{N\\}")' src/i18n/ru.json` | true |
| `jq -e '.back_to_home == "Назад на главную"' src/i18n/ru.json` | true |
| `jq empty src/i18n/en.json && jq empty src/i18n/ru.json` | valid |
| `npm run build` | ✓ 23 pages in 1.00s |

## Transient state notes

The current (pre-Plan-03) `Presentations.astro` uses `{i.presentations.subtitle}` without interpolation, so the live site between now and Plan 03 will render the literal `"{N} talks · all slides at s.vedmich.dev"` with `{N}` visible. This is expected transient state — Plan 03 adds `String.prototype.replace('{N}', ...)` logic. No commit to `main` will ship this transient state because Plan 08-03 is in the same phase execution.

## Self-Check: PASSED

All acceptance criteria met, build green.
