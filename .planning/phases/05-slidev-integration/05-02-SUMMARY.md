---
phase: 05-slidev-integration
plan: 02
subsystem: slidev-url-surface-i18n-drafts
tags: [slidev, url-rewrite, i18n, draft, empty-state, phase-5, wave-1]
requirements-covered: [SLIDES-04]
dependency-graph:
  requires: []
  provides:
    - presentationcard-data.slides-precedence
    - search-index-data.slides-precedence
    - i18n-presentations.subtitle-drops-s.vedmich.dev
    - 12-mdx-draft=true-skeleton-preserved
    - presentations.astro-bilingual-empty-state
  affects:
    - 05-04-PLAN.md (phase-close traceability — SLIDES-04 now shippable, D-14 narrow-scope grep passes)
tech-stack:
  added: []
  patterns:
    - "`data.slides ?? \\`/slides/${slug}/\\`` nullish-coalescing precedence (symmetric across PresentationCard + search-index)"
    - "BlogPreview-analog empty-state ternary — {totalCount > 0 ? <>happy-path</> : <p>empty</p>}"
    - "Fragment wrapping multi-sibling happy-path branch in ternary"
    - "Bilingual inline-hardcoded empty-state copy (matches BlogPreview pattern)"
    - "D-03 skeleton preservation — draft MDX retains legacy `slides:` URLs for future un-drafting; D-14 grep scoped to exclude src/content/"
key-files:
  created: []
  modified:
    - src/components/PresentationCard.astro (deckUrl + displayUrl rewrite, 2 line changes)
    - src/components/Presentations.astro (empty-state ternary — 21 deletions + 32 insertions, net +11 lines)
    - src/data/search-index.ts (slideItems URL — 1 line change)
    - src/i18n/en.json (presentations.subtitle — 1 line change)
    - src/i18n/ru.json (presentations.subtitle — 1 line change)
    - src/content/presentations/en/dkt-workflow.md (draft flip, 1 line)
    - src/content/presentations/en/eks-multi-az.md (draft flip, 1 line)
    - src/content/presentations/en/karpenter-prod.md (draft flip, 1 line)
    - src/content/presentations/en/mcp-platform.md (draft flip, 1 line)
    - src/content/presentations/en/slurm-ai-demo.md (draft flip, 1 line)
    - src/content/presentations/en/slurm-prompt-engineering.md (draft flip, 1 line)
    - src/content/presentations/ru/dkt-workflow.md (draft flip, 1 line)
    - src/content/presentations/ru/eks-multi-az.md (draft flip, 1 line)
    - src/content/presentations/ru/karpenter-prod.md (draft flip, 1 line)
    - src/content/presentations/ru/mcp-platform.md (draft flip, 1 line)
    - src/content/presentations/ru/slurm-ai-demo.md (draft flip, 1 line)
    - src/content/presentations/ru/slurm-prompt-engineering.md (draft flip, 1 line)
decisions:
  - "Nullish-coalescing (`??`) chosen over logical-OR (`||`) in both URL builders — empty string `slides: \"\"` would still fall through `||` but correctly pass-through under `??`, preserving the frontmatter override semantics per D-04/D-16"
  - "Plan Task 1 grep acceptance check used template-literal syntax (`${slug}`) which bash expands before grep sees it — switched to `grep -F` (fixed-string mode) for reliable verification. All 3 acceptance patterns then returned exactly 1 as expected (plan quirk, not code issue)"
  - "Task 3 batched 12 independent Edit calls in parallel since each file is isolated (different title/event/description) — the shared `draft: false` string is unique within each file so replace_all was unnecessary. Edit tool ran 12 successful flips with zero collateral"
  - "Task 4 Fragment `<>...</>` wrapping needed for multi-sibling happy-path branch of the ternary — matches BlogPreview analog at `src/components/BlogPreview.astro:36-57` verbatim"
  - "D-14 narrow-scope grep validated against `src/i18n/ src/components/ src/data/` — zero hits. D-03 skeleton preservation validated — 12 MDX still contain legacy `s.vedmich.dev` URLs (expected, out of scope for Plan 04 phase gate)"
metrics:
  duration: "3m44s"
  tasks: 4
  files-changed: 17
  commits: 4
  completed: 2026-05-07
---

# Phase 05 Plan 02: URL Surface + i18n + Draft Flips + Empty State Summary

**Plan 05-02** closes SLIDES-04 by rewriting the presentation URL surface to the Phase 5 contract (`data.slides ?? \`/slides/<slug>/\``), dropping `s.vedmich.dev` from the EN + RU homepage subtitle, flipping all 12 presentation MDX files to `draft: true` with frontmatter skeleton preserved, and adding a bilingual `Decks coming soon...` / `Слайды появятся скоро...` empty-state to `Presentations.astro` so the homepage renders cleanly with zero decks. Runs in parallel with Plan 01 (no shared files) and delivers the whole user-facing surface change in a single plan.

## Commits

| Task | Commit    | Type        | Description                                                                           |
| ---- | --------- | ----------- | ------------------------------------------------------------------------------------- |
| 1    | `f1da3eb` | `feat(05-02)` | Rewrite deck URLs to /slides/<slug>/ with data.slides override (PresentationCard + search-index) |
| 2    | `8e8dd26` | `feat(05-02)` | Drop s.vedmich.dev from presentations.subtitle (EN + RU)                              |
| 3    | `6725c38` | `feat(05-02)` | Flip all 12 presentation MDX to draft: true (D-11)                                    |
| 4    | `97de04c` | `feat(05-02)` | Add bilingual empty-state to Presentations.astro                                      |

## What shipped

### URL rewrites (Task 1)

- **`src/components/PresentationCard.astro`** line 12: `deckUrl = \`https://s.vedmich.dev/${slug}/\`` → `deckUrl = data.slides ?? \`/slides/${slug}/\``. External frontmatter URL wins (enables SpeakerDeck/Notist/legacy overrides via MDX); internal `/slides/<slug>/` is the fallback.
- **`src/components/PresentationCard.astro`** line 13: `displayUrl = \`s.vedmich.dev/${slug}\`` → `displayUrl = \`vedmich.dev/slides/${slug}\``. Visual continuity with the previous path-only display pattern (no protocol).
- **`src/data/search-index.ts`** line 37: `url: \`https://s.vedmich.dev/${slug}\`` → `url: entry.data.slides ?? \`/slides/${slug}/\``. Symmetric with PresentationCard, trailing slash added for GH Pages directory-serving parity.
- **Invariants preserved:** template (lines 14-57 in PresentationCard) byte-identical — same `target="_blank" rel="noopener noreferrer"`, same hover states, same `card-glow` + `animate-on-scroll`. `!data.draft` filter in search-index (line 27) unchanged. `postItems` block (lines 48-60) unchanged.

### i18n subtitle (Task 2)

- **`src/i18n/en.json`** line 65: `"{N} talks · all slides at s.vedmich.dev"` → `"{N} talks · all on vedmich.dev/slides"`
- **`src/i18n/ru.json`** line 65: `"{N} докладов · все слайды на s.vedmich.dev"` → `"{N} докладов · все на vedmich.dev/slides"`
- **Pitfall 1 guard honored:** `speaking.subtitle` at line 51 in both files (`30+ technical deep-dives per year` / `30+ технических докладов в год`) left byte-identical — it does NOT contain `s.vedmich.dev` despite D-15's wording.
- `{N}` placeholder preserved in both locales — still consumed by `Presentations.astro:21` via `.replace('{N}', String(totalCount))`.
- Both files remain 101 LOC each; JSON parsing validated via Node.

### 12 MDX draft flips (Task 3)

- All 6 EN + 6 RU MDX files flipped from `draft: false` → `draft: true` on line 9.
- **D-03 skeleton preservation:** each file retains `title`, `event`, `city`, `date`, `description`, `tags`, and the legacy `slides: "https://s.vedmich.dev/<slug>/"` field — byte-identical except for the one-char flip on line 9.
- Each of the 12 files remains at 11 lines (10 frontmatter + 1 trailing blank).
- All 4 consumers of `getCollection('presentations')` already filter `!data.draft` (Presentations.astro:14, /{en,ru}/presentations/index.astro:11, search-index.ts:27) — zero consumer code change needed. The draft flip alone hides all 12 decks from homepage + index + search.

### Presentations.astro empty-state (Task 4)

- Replaced the unconditional 0-card grid with a BlogPreview-analog ternary:
  - Top-right `All decks →` link wrapped in `{totalCount > 0 && (...)}` guard.
  - Grid + subtitle + bottom `All decks →` link wrapped in `{totalCount > 0 ? <>happy-path</> : <p>empty-state</p>}` ternary. Fragment `<>...</>` needed for the multi-sibling happy-path branch.
  - Empty-state `<p>` renders `{locale === 'ru' ? 'Слайды появятся скоро...' : 'Decks coming soon...'}` — inline bilingual copy matching BlogPreview verbatim.
- Subtitle moves INTO the happy-path branch (no longer unconditionally rendered above the grid) — matches BlogPreview's pattern of hiding the subtitle entirely when empty.
- Token-only styling preserved: `text-text-muted`, `animate-on-scroll` on the `<p>` — zero hex literals.
- Frontmatter script (lines 1-22) byte-identical to HEAD — same getCollection, sort, slice, subtitle derivation.

## Verification (plan's success criteria + overall `<verification>` block)

| Criterion                                                                                                | Result                          |
| -------------------------------------------------------------------------------------------------------- | ------------------------------- |
| SLIDES-04: PresentationCard `data.slides ?? \`/slides/${slug}/\`` precedence (deckUrl)                   | ✓ PASS (1 grep hit)             |
| SLIDES-04: PresentationCard `vedmich.dev/slides/${slug}` displayUrl                                      | ✓ PASS (1 grep hit)             |
| SLIDES-04: search-index.ts symmetric precedence (`entry.data.slides ?? \`/slides/${slug}/\``)            | ✓ PASS (1 grep hit)             |
| SLIDES-04: i18n presentations.subtitle EN = "{N} talks · all on vedmich.dev/slides"                      | ✓ PASS (1 grep hit)             |
| SLIDES-04: i18n presentations.subtitle RU = "{N} докладов · все на vedmich.dev/slides"                   | ✓ PASS (1 grep hit)             |
| SLIDES-04: All 12 MDX flipped to `draft: true`                                                           | ✓ PASS (6 EN + 6 RU = 12)       |
| SLIDES-04: D-03 skeleton preserved — 12 MDX retain legacy `slides:` URLs                                 | ✓ PASS (12 files)               |
| D-14 narrow-scope grep: zero `s.vedmich.dev` in `src/i18n/ src/components/ src/data/`                    | ✓ PASS (0 hits)                 |
| Presentations.astro bilingual empty-state (`Decks coming soon...` / `Слайды появятся скоро...`)          | ✓ PASS (1 hit each)             |
| Zero hex literals in Presentations.astro (token-only styling)                                            | ✓ PASS                          |
| `npm run build` exits 0                                                                                  | ✓ PASS (32 pages, 2.37s)        |
| Rendered `dist/en/index.html` + `dist/ru/index.html` contain empty-state copy                            | ✓ PASS (both localized)         |
| Rendered `dist/en/index.html` + `dist/ru/index.html` free of `s.vedmich.dev`                             | ✓ PASS                          |
| Speaking.subtitle Pitfall 1 guard: `30+ technical deep-dives per year` preserved in EN                   | ✓ PASS                          |
| Speaking.subtitle Pitfall 1 guard: `30+ технических докладов в год` preserved in RU                      | ✓ PASS                          |
| JSON parse validity on en.json + ru.json                                                                 | ✓ PASS                          |
| Unit tests: all 69 still green                                                                           | ✓ PASS (69/69, 17.4s)           |
| Regression: package.json free of Slidev deps                                                             | ✓ PASS (Pitfall 3 guard clean)  |

## Line-count deltas per file

| File                                                            | HEAD lines | New lines | Net    |
| --------------------------------------------------------------- | ---------- | --------- | ------ |
| `src/components/PresentationCard.astro`                         | 57         | 57        | 0      |
| `src/components/Presentations.astro`                            | 52         | 63        | +11    |
| `src/data/search-index.ts`                                      | 63         | 63        | 0      |
| `src/i18n/en.json`                                              | 101        | 101       | 0      |
| `src/i18n/ru.json`                                              | 101        | 101       | 0      |
| `src/content/presentations/en/*.md` (6 files)                   | 11 each    | 11 each   | 0 each |
| `src/content/presentations/ru/*.md` (6 files)                   | 11 each    | 11 each   | 0 each |

**Total:** 17 files changed, 49 insertions, 38 deletions (net +11 lines from Presentations.astro empty-state).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Plan verify command bash-expansion quirk] Task 1 automated grep**

- **Found during:** Task 1 verification
- **Issue:** Plan's automated verify command uses unquoted template-literal patterns like `'const deckUrl = data\.slides \?\? \`/slides/\${slug}/\`;'` inside bash single-quote context. The `${slug}` portion gets expanded by bash to an empty string before grep sees the pattern, returning 0 hits even when the edit is correct.
- **Fix:** Used `grep -F` (fixed-string mode) instead of basic regex grep — the exact literal `const deckUrl = data.slides ?? \`/slides/${slug}/\`;` matches correctly. All 3 acceptance patterns (deckUrl, displayUrl, search-index url) then returned exactly 1 each as expected.
- **Classification:** Plan specification quirk — the intended semantics (pattern lands exactly once per file) is fully met; the plan's regex form just can't be copy-pasted into zsh without escaping `${...}`. No code change needed.
- **Commit:** N/A (observation only — applied to verification methodology, not code)

### Auth Gates

None — no authentication required for any step. All edits are local file operations.

### Architecture Changes

None — plan executed exactly as written. D-03 (skeleton preservation) + D-04/D-16 (URL precedence) + D-11 (draft flip) + D-15 (i18n Pitfall 1 correction) all honored verbatim.

## Metrics

- **Duration:** 3m44s (224 s wall clock)
- **Tasks completed:** 4 / 4
- **Files changed:** 17 (5 source/config + 12 MDX, all modified — zero created, zero deleted)
- **Commits:** 4 (one per task, all `feat(05-02):` conventional-commit format)
- **Build:** 32 pages in 2.37s (within baseline); unit tests 69/69 green
- **D-14 scope validation:** `grep -rn 's\.vedmich\.dev' src/i18n/ src/components/ src/data/` returns zero hits (phase gate satisfied)
- **D-03 scope validation:** `grep -rl 's\.vedmich\.dev' src/content/presentations/` returns 12 hits (expected skeleton preservation — 12 draft MDX retain legacy URLs for future un-drafting)

## Next

- **Plan 03** (Wave 2, sequential after Plans 01+02): creates `docs/slides-onboarding.md` + `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` + vault mirror. CLAUDE.md's Plan 01 pointer block forward-references these files — Plan 03 materializes them. Plan 02's surface changes (the `/slides/<slug>/` URL pattern, the empty-state behaviour) are the contract Plan 03's runbook documents.
- **Plan 04** (Wave 3, after Plans 01+02+03): requirements + traceability close for Phase 5. Will run the phase-wide D-14 grep (already passing as of this plan) + close SLIDES-04 checkbox in REQUIREMENTS.md + mark Phase 5 shipped in ROADMAP.md.

## Self-Check: PASSED

- [x] `src/components/PresentationCard.astro` edit landed — FOUND via `grep -F`
- [x] `src/data/search-index.ts` edit landed — FOUND
- [x] `src/i18n/en.json` subtitle flipped — FOUND
- [x] `src/i18n/ru.json` subtitle flipped — FOUND
- [x] All 12 MDX files have `draft: true` — FOUND (6 EN + 6 RU)
- [x] `src/components/Presentations.astro` has bilingual empty-state — FOUND
- [x] Commit `f1da3eb` exists — FOUND
- [x] Commit `8e8dd26` exists — FOUND
- [x] Commit `6725c38` exists — FOUND
- [x] Commit `97de04c` exists — FOUND
- [x] `npm run build` green, 32 pages, 2.37s — FOUND
- [x] `npm run test:unit` green, 69/69 — FOUND
- [x] D-14 narrow-scope grep: zero hits in `src/i18n/ src/components/ src/data/` — FOUND
- [x] D-03 skeleton preservation: 12 `s.vedmich.dev` URLs retained in draft MDX — FOUND
- [x] Rendered static HTML: EN + RU homepages contain empty-state copy + are free of `s.vedmich.dev` — FOUND
