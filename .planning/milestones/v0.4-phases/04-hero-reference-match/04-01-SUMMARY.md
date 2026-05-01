---
phase: 04-hero-reference-match
plan: 01
subsystem: i18n
tags:
  - i18n
  - astro
  - hero
  - json-mutation
  - kubestronaut-rename

# Dependency graph
requires:
  - phase: 03-section-order-about
    provides: bio_before/bio_accent/bio_after 3-key pattern for span-accent rendering without set:html
provides:
  - hero.tagline_before/_accent/_after 3-key structure in en.json and ru.json (consumed by Plan 04-02 Hero.astro rewrite)
  - Corrected "CNCF Kubestronaut" spelling in about.bio_before in both locales (first half of D-04 cross-file rename)
  - Bilingual parity invariant — tagline_accent byte-identical across locales
affects:
  - 04-02 (Hero.astro rewrite consumes these keys)
  - 04-03 (cross-file Kubestronaut rename — social.ts, BaseLayout.astro, CLAUDE.md still to fix)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Three-key i18n split (*_before / _accent / _after) extended from Phase 3 about.bio_* to Phase 4 hero.tagline_*
    - Locale-invariant term-of-art for _accent position (AI Engineer stays English in both EN and RU, mirrors Phase 3 D-07 book-title rule)
    - Load-bearing trailing space convention on _before key (prevents word-join in rendered <span>)

key-files:
  created: []
  modified:
    - src/i18n/en.json
    - src/i18n/ru.json

key-decisions:
  - "Applied D-15/D-16: split hero.tagline into 3 keys; accent = 'AI Engineer' locale-invariant; after = '' reserve"
  - "Applied D-04: corrected CNCF Kubernaut -> CNCF Kubestronaut in about.bio_before in both locales (i18n portion only; cross-file rename in social.ts/BaseLayout/CLAUDE.md is Plan 04-03 scope)"
  - "Preserved Unicode-escape style (\\u00b7, Cyrillic \\u04XX) to match existing file convention and minimize diff noise"
  - "Ordered keys: greeting -> name -> role -> tagline_before -> tagline_accent -> tagline_after -> cta -> cta_secondary in both files"

patterns-established:
  - "Wave 1 JSON-mutation cadence: land bilingual i18n changes first; build-pass deferred to Wave 2 (consistent with Phase 3 03-01 precedent)"
  - "Bilingual parity check via Node one-liner: en.hero.tagline_accent === ru.hero.tagline_accent"

requirements-completed:
  - REQ-011
  - REQ-013

# Metrics
duration: 3min
completed: 2026-04-19
---

# Phase 4 Plan 01: i18n Kubestronaut Summary

**Bilingual hero.tagline split into 3-key structure (tagline_before/_accent/_after) + CNCF Kubestronaut spelling fix in about.bio_before for both en.json and ru.json — Wave 1 foundation for Plan 04-02 Hero rewrite.**

## Performance

- **Duration:** 3 min (2m 15s wall-clock)
- **Started:** 2026-04-19T21:01:58Z
- **Completed:** 2026-04-19T21:04:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Split EN `hero.tagline` into `tagline_before` / `tagline_accent` / `tagline_after` 3-key structure with trailing-space convention on `_before` and locale-invariant `AI Engineer` accent.
- Mirrored the same 3-key split in RU with RU-translated `tagline_before` (`Распределённые системы · Kubernetes · `) and byte-identical English `tagline_accent`.
- Corrected the factology misspelling `CNCF Kubernaut` → `CNCF Kubestronaut` inside `about.bio_before` in both locales (first half of D-04 rename — cross-file portion lands in Plan 04-03).
- Confirmed bilingual parity: `en.hero.tagline_accent === ru.hero.tagline_accent === "AI Engineer"` and `en.hero.tagline_after === ru.hero.tagline_after === ""`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Mutate EN hero block (3-key split) + about.bio_before (Kubestronaut fix)** — `7940732` (feat)
2. **Task 2: Mutate RU hero block (3-key split, RU before + English accent) + about.bio_before (Kubestronaut fix)** — `4a20f01` (feat)

## Final State (verbatim)

### EN `hero` block (`src/i18n/en.json` lines 22-31)

```json
"hero": {
  "greeting": "Hi, I'm",
  "name": "Viktor Vedmich",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "Distributed Systems \u00b7 Kubernetes \u00b7 ",
  "tagline_accent": "AI Engineer",
  "tagline_after": "",
  "cta": "Get in touch",
  "cta_secondary": "Read more"
},
```

### EN `about.bio_before` (Kubestronaut fix applied, `src/i18n/en.json` line 34)

```json
"bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubestronaut and author of ",
```

### RU `hero` block (`src/i18n/ru.json` lines 22-31)

```json
"hero": {
  "greeting": "\u041f\u0440\u0438\u0432\u0435\u0442, \u044f",
  "name": "\u0412\u0438\u043a\u0442\u043e\u0440 \u0412\u0435\u0434\u043c\u0438\u0447",
  "role": "Senior Solutions Architect @ AWS",
  "tagline_before": "\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0435 \u0441\u0438\u0441\u0442\u0435\u043c\u044b \u00b7 Kubernetes \u00b7 ",
  "tagline_accent": "AI Engineer",
  "tagline_after": "",
  "cta": "\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f",
  "cta_secondary": "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435"
},
```

Decoded (human-readable):
- `tagline_before` = `"Распределённые системы · Kubernetes · "` (trailing space present)
- `tagline_accent` = `"AI Engineer"` (English verbatim)
- `tagline_after` = `""`

### RU `about.bio_before` (Kubestronaut fix applied, `src/i18n/ru.json` line 34)

```json
"bio_before": "Solutions Architect \u0438 AI Engineer \u0441 15+ \u0433\u043e\u0434\u0430\u043c\u0438 \u043e\u043f\u044b\u0442\u0430 \u0432 \u043f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0445 \u0441\u0438\u0441\u0442\u0435\u043c. \u0420\u0430\u0431\u043e\u0442\u0430\u044e \u0432 AWS, \u0432\u0435\u0434\u0443 \u0441\u043a\u0432\u043e\u0437\u043d\u0443\u044e \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0443 \u0434\u043b\u044f enterprise-\u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432: hybrid cloud, Kubernetes, GenAI \u0438 agentic-\u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b. CNCF Kubestronaut \u0438 \u0430\u0432\u0442\u043e\u0440 \u043a\u043d\u0438\u0433\u0438 ",
```

Decoded (tail, human-readable): `"...agentic-платформы. CNCF Kubestronaut и автор книги "`.

### Reconstructed sentences (bio_before + bio_accent + bio_after)

- **EN tagline:** `Distributed Systems · Kubernetes · AI Engineer`
- **RU tagline:** `Распределённые системы · Kubernetes · AI Engineer`
- **EN bio tail:** `... CNCF Kubestronaut and author of «Cracking the Kubernetes Interview».`
- **RU bio tail:** `... CNCF Kubestronaut и автор книги «Cracking the Kubernetes Interview».`

## Confirmations

- **Old `hero.tagline` single-key removed from both files:** confirmed via `grep -q '"tagline":' src/i18n/en.json` (exit 1, no match) and identical grep on ru.json.
- **No `Kubernaut` misspelling remains in either file:** confirmed via `grep -Eq 'Kubernaut[^e]'` returning no matches in both files. The `Kuber` substring is still present (it is the prefix of both `Kubernetes` and `Kubestronaut`), but the bare stem `Kubernaut` followed by a non-`e` boundary does not appear.
- **Both files parse as valid JSON:** `JSON.parse()` via Node exits 0 on both.
- **Key order preserved:** `Object.keys(hero)` prints `["greeting","name","role","tagline_before","tagline_accent","tagline_after","cta","cta_secondary"]` in both files — identical order, EN and RU matched.
- **Bilingual parity:** `en.hero.tagline_accent === ru.hero.tagline_accent === "AI Engineer"` and `en.hero.tagline_after === ru.hero.tagline_after === ""`.
- **Non-phase-4 top-level keys byte-identical to pre-plan state:** `nav`, `search`, `podcasts`, `speaking`, `book`, `presentations`, `blog`, `contact`, `footer` all untouched in both files. Git diff confirms only the `hero` block + `about.bio_before` line changed.
- **Trailing newline preserved in both files.**
- **Mid-dot `·` stored as `\u00b7` escape in both files:** matches existing file style, exactly 2 occurrences per `tagline_before` (between "Distributed Systems"/"Systems" and "Kubernetes", and between "Kubernetes" and the accent span).

## Decisions Made

- **Mirrored existing file Unicode-escape style:** en.json uses ASCII + `\u00b7` for the middle dot; ru.json uses Cyrillic `\u04XX` escapes + `\u00b7`. Preserved both conventions in the new keys to minimize diff noise and keep git blame readable. Alternative (literal Cyrillic / literal middle-dot) would parse identically in Astro but would make the Phase 4 diff larger than necessary.
- **Kept `about.bio_before` as a single-line edit** rather than re-wrapping the long Cyrillic string. The existing Phase 3 03-01 file already had it as a single line; staying consistent.
- **No `npm run build` run:** Per plan `<verification>` section, build is EXPECTED to fail mid-wave because `Hero.astro` still references `i.hero.tagline` which is now removed. This cadence matches the Phase 3 03-01 precedent. Orchestrator should proceed to Plan 04-02 without a build gate between plans; 04-02 is the Phase 4 build-pass gate.

## Deviations from Plan

None - plan executed exactly as written.

Both tasks followed the plan's explicit `<action>` blocks verbatim. Two edits per file: one for the hero block replacement (old single-key `tagline` → 3-key split), one for the `Kubernaut` → `Kubestronaut` substring fix inside `bio_before`. No auto-fixes needed; no architectural deviations encountered.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required. Pure content-file mutation.

## Next Phase Readiness

**Flag for Plan 04-02 executor:** The i18n typed accessor keys `i.hero.tagline_before`, `i.hero.tagline_accent`, `i.hero.tagline_after` are now available in both locales. The old `i.hero.tagline` key is gone — any TypeScript/build check will fail until Hero.astro is rewritten to consume the new keys. This is expected per the plan verification section (same mid-wave breakage cadence as Phase 3 03-01).

**Flag for Plan 04-03 executor:** Half of D-04 Kubestronaut rename is done (i18n portion). Remaining surface to fix: `src/data/social.ts` (certifications[0].name + badge), `src/layouts/BaseLayout.astro` line 15 meta description default, and `CLAUDE.md` §Homepage Sections #2. Plan 04-03 owns these.

**Build gate:** NOT a gate between 04-01 and 04-02. Build resumes passing only after Plan 04-02 lands the Hero.astro rewrite that consumes `tagline_before/_accent/_after`.

## Self-Check: PASSED

Verified claims via automated checks before finalizing:

1. **Files modified exist and contain the new keys:**
   - `src/i18n/en.json` — `"tagline_before"`, `"tagline_accent": "AI Engineer"`, `"tagline_after": ""`, `CNCF Kubestronaut` all present via grep.
   - `src/i18n/ru.json` — `"tagline_before"`, `"tagline_accent": "AI Engineer"`, `"tagline_after": ""`, `CNCF Kubestronaut` all present via grep.
2. **Old keys and misspelling absent:**
   - `grep -q '"tagline":'` exits 1 in both files (old single-key removed).
   - `grep -Eq 'Kubernaut[^e]'` exits 1 in both files (misspelling gone).
3. **Commits exist in git log:**
   - `7940732` — feat(04-01): split EN hero.tagline into 3-key structure + fix Kubestronaut spelling
   - `4a20f01` — feat(04-01): split RU hero.tagline into 3-key structure + fix Kubestronaut spelling
4. **Both files parse as valid JSON:** `JSON.parse()` exits 0 on both.

---

*Phase: 04-hero-reference-match*
*Completed: 2026-04-19*
