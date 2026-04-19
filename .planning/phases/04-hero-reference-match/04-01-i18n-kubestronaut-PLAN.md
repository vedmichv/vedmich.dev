---
phase: 04-hero-reference-match
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/i18n/en.json
  - src/i18n/ru.json
autonomous: true
requirements:
  - REQ-011
  - REQ-013
threat_refs: []
tags:
  - i18n
  - astro
  - hero
  - kubestronaut-rename
objective: >-
  Mutate both i18n JSON files in a single wave: (1) split the single-key
  `hero.tagline` into the 3-key pattern (`tagline_before`, `tagline_accent`,
  `tagline_after`) mirroring Phase 3 `about.bio_*` structure so Plan 04-02 can
  render the tagline with `AI Engineer` wrapped in a `<span class="text-text-primary">`
  accent without `set:html`, and (2) correct the factology misspelling
  `CNCF Kubernaut` → `CNCF Kubestronaut` inside the existing `about.bio_before`
  copy in both locales. Per D-04, D-15, D-16. Bundles all JSON mutations into a
  single atomic plan per RESEARCH.md §Open Question 4 recommendation.

must_haves:
  truths:
    - Both en.json and ru.json contain a populated `hero.tagline_before` string key.
    - Both en.json and ru.json contain `hero.tagline_accent` with the exact value `AI Engineer` (locale-invariant term-of-art per D-15).
    - Both en.json and ru.json contain `hero.tagline_after` with the exact empty-string value `""` (reserve for future punctuation per D-15).
    - The old `hero.tagline` single-key is removed from both files.
    - `about.bio_before` in both files contains `CNCF Kubestronaut` (not `CNCF Kubernaut`) — factology fix per D-04.
    - No occurrence of the string `Kubernaut` (without the `-estr-` infix) remains in either JSON file.
    - Both files parse as valid JSON (`JSON.parse()` succeeds).
    - `npm run build` may fail mid-wave with `Property 'tagline' does not exist` because `Hero.astro` still references `i.hero.tagline` — this is EXPECTED and resolved when Plan 04-02 lands in Wave 2. Phase 3 03-01 established this cadence.
  artifacts:
    - path: src/i18n/en.json
      provides: EN copy for new hero 3-key tagline split + Kubestronaut spelling fix in about.bio_before
      contains: '"tagline_accent": "AI Engineer"'
    - path: src/i18n/ru.json
      provides: RU copy for new hero 3-key tagline split + Kubestronaut spelling fix in about.bio_before
      contains: '"tagline_accent": "AI Engineer"'
  key_links:
    - from: src/i18n/en.json
      to: src/components/Hero.astro
      via: typed t(locale).hero.tagline_before / _accent / _after access (wired in Plan 04-02)
      pattern: 'i\.hero\.tagline_(before|accent|after)'
    - from: src/i18n/ru.json
      to: src/components/Hero.astro
      via: typed t(locale).hero.tagline_before / _accent / _after access (wired in Plan 04-02)
      pattern: 'i\.hero\.tagline_(before|accent|after)'
    - from: src/i18n/en.json
      to: src/components/About.astro
      via: existing typed i.about.bio_before reference (already wired in Phase 3 Plan 03-03)
      pattern: 'i\.about\.bio_before'
---

<objective>
Split `hero.tagline` into three keys (`tagline_before`, `tagline_accent`,
`tagline_after`) AND correct the misspelling `CNCF Kubernaut` → `CNCF Kubestronaut`
inside the existing `about.bio_before` copy, in both `src/i18n/en.json` and
`src/i18n/ru.json`. This is Wave 1 foundation for Phase 4 — Plan 04-02 (Hero
rewrite) and Plan 04-03 (cross-file rename + observer) depend on these JSON
shape changes landing first.

Purpose: Implement D-15, D-16 (tagline split) and the JSON portion of D-04
(Kubestronaut factology fix) from CONTEXT.md. Mirrors the Phase 3 03-01 pattern
of "land i18n mutations in Wave 1, consume in Wave 2". Translator-friendly
3-key split with accent preserved as verbatim English term-of-art across both
locales (matches Phase 3 D-07 `bio_accent` book-title rule).

Output: Two mutated JSON files with the new `hero.tagline_*` keys, the old
`hero.tagline` key removed, and `about.bio_before` corrected from `CNCF Kubernaut`
to `CNCF Kubestronaut` in both locales.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-hero-reference-match/04-CONTEXT.md
@.planning/phases/04-hero-reference-match/04-PATTERNS.md
@.planning/phases/03-section-order-about/03-01-i18n-keys-PLAN.md

<interfaces>
<!-- Existing `hero` + `about` key shape in both files (source-of-truth before this plan). -->

From src/i18n/en.json (current §hero, lines 22-29):
```json
"hero": {
  "greeting": "Hi, I'm",
  "name": "Viktor Vedmich",
  "role": "Senior Solutions Architect @ AWS",
  "tagline": "Distributed Systems \u00b7 Kubernetes \u00b7 AI Engineer",
  "cta": "Get in touch",
  "cta_secondary": "Read more"
},
```

From src/i18n/en.json (current §about, lines 30-36):
```json
"about": {
  "title": "About Me",
  "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Expertise"
},
```

From src/i18n/ru.json (current §hero, lines 22-29):
```json
"hero": {
  "greeting": "\u041f\u0440\u0438\u0432\u0435\u0442, \u044f",
  "name": "\u0412\u0438\u043a\u0442\u043e\u0440 \u0412\u0435\u0434\u043c\u0438\u0447",
  "role": "Senior Solutions Architect @ AWS",
  "tagline": "\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0435 \u0441\u0438\u0441\u0442\u0435\u043c\u044b \u00b7 Kubernetes \u00b7 AI Engineer",
  "cta": "\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f",
  "cta_secondary": "\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435"
},
```

From src/i18n/ru.json (current §about, line 32 excerpted):
```json
"bio_before": "Solutions Architect \u0438 AI Engineer ... CNCF Kubernaut \u0438 \u0430\u0432\u0442\u043e\u0440 \u043a\u043d\u0438\u0433\u0438 ",
```

Target shape AFTER this plan (both files, `hero` and `about` blocks mutated):

EN `hero` block:
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

EN `about` block (only `bio_before` string changes — one word):
```json
"about": {
  "title": "About Me",
  "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubestronaut and author of ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Expertise"
},
```

RU `hero` block:
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

RU `about` block (only `bio_before` string changes — one word inside a Cyrillic sentence):
```json
"about": {
  "title": "\u041e\u0431\u043e \u043c\u043d\u0435",
  "bio_before": "Solutions Architect \u0438 AI Engineer \u0441 15+ \u0433\u043e\u0434\u0430\u043c\u0438 \u043e\u043f\u044b\u0442\u0430 \u0432 \u043f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0445 \u0441\u0438\u0441\u0442\u0435\u043c. \u0420\u0430\u0431\u043e\u0442\u0430\u044e \u0432 AWS, \u0432\u0435\u0434\u0443 \u0441\u043a\u0432\u043e\u0437\u043d\u0443\u044e \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0443 \u0434\u043b\u044f enterprise-\u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432: hybrid cloud, Kubernetes, GenAI \u0438 agentic-\u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b. CNCF Kubestronaut \u0438 \u0430\u0432\u0442\u043e\u0440 \u043a\u043d\u0438\u0433\u0438 ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "\u042d\u043a\u0441\u043f\u0435\u0440\u0442\u0438\u0437\u0430"
},
```

Notes on the split:
- EN `tagline_before` = `"Distributed Systems · Kubernetes · "` — **trailing space is load-bearing** (matches Phase 3 `bio_before` convention). Without it, the `<span>` accent in Hero.astro renders as `Kubernetes ·AI Engineer` (word-joined).
- RU `tagline_before` = `"Распределённые системы · Kubernetes · "` — same trailing-space rule.
- `tagline_accent` is byte-identical `AI Engineer` in both locales — locale-invariant per D-15 (same rule as Phase 3 03-01 `bio_accent` book-title English-verbatim rule).
- `tagline_after` is `""` (empty string) in both locales — reserved for future punctuation per D-15 (e.g. a period, or an exclamation mark if copy changes).
- `·` is stored as `\u00b7` (U+00B7 MIDDLE DOT) in the existing file. Keep the escape form to minimize diff noise OR switch to literal `·` — Astro + Node JSON.parse handles both. Prefer escape form for bit-identical match with existing file style.
- The `·` characters in current `hero.tagline` are U+00B7. The split preserves BOTH `·` characters in `tagline_before` (one between "Systems" and "Kubernetes", one between "Kubernetes" and the start of the accent span). Do NOT drop either.
- All other top-level keys (`nav`, `search`, `podcasts`, `speaking`, `book`, `presentations`, `blog`, `contact`, `footer`) stay byte-identical in both files.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Mutate EN hero block (3-key tagline split) + about.bio_before (Kubestronaut fix)</name>
  <files>src/i18n/en.json</files>
  <read_first>
    - src/i18n/en.json (current state — read ENTIRE file to preserve JSON validity, existing escape style, and non-phase-4 blocks)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-04, D-15, D-16 — the specifications for this mutation)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/i18n/en.json` (the target JSON shape verbatim)
    - .planning/phases/03-section-order-about/03-01-i18n-keys-PLAN.md (reference cadence for bilingual JSON mutation — grep acceptance patterns, JSON.parse check)
  </read_first>
  <action>
    Replace the `hero` object and patch the `about.bio_before` string in `src/i18n/en.json`. Final state of the two affected blocks MUST be exactly (order preserved, non-phase-4 keys untouched):

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
    "about": {
      "title": "About Me",
      "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubestronaut and author of ",
      "bio_accent": "«Cracking the Kubernetes Interview»",
      "bio_after": ".",
      "skills_title": "Expertise"
    },
    ```

    Rules (mandatory):
    - `tagline_before` MUST end with a trailing SPACE character (load-bearing — the `<span>` in Hero.astro renders immediately after). Verify by inspecting the literal JSON string ends with `· ` (middle-dot, space, close-quote).
    - `tagline_before` MUST contain exactly two U+00B7 middle-dot characters, stored as `\u00b7` escape sequences (matches existing file style). Do NOT substitute `·` (literal) or `.` or `*` — must be the mid-dot.
    - `tagline_accent` MUST be the EXACT string `AI Engineer` (capital A, capital E, space between, no trailing punctuation). Locale-invariant per D-15.
    - `tagline_after` MUST be the empty string `""` — NOT null, NOT absent, NOT a space. Future punctuation reserve per D-15.
    - Remove the OLD `"tagline": "..."` single-key line entirely — do NOT leave a dangling key or trailing comma.
    - Preserve key order: `greeting → name → role → tagline_before → tagline_accent → tagline_after → cta → cta_secondary`. Order matters for diff review (matches Phase 3 03-01 cadence).
    - In the `about` block: change the EXACT substring `CNCF Kubernaut and author of ` to `CNCF Kubestronaut and author of ` inside `bio_before`. The string should end with a trailing space (unchanged, already present from Phase 3). No other edit inside `bio_before`.
    - Do NOT touch any other top-level key (`nav`, `search`, `podcasts`, `speaking`, `book`, `presentations`, `blog`, `contact`, `footer`). These stay byte-identical.
    - Final file MUST be valid JSON (no trailing commas, balanced braces, UTF-8 encoding preserved).
    - File MUST end with a trailing newline (POSIX convention — current file has this).
  </action>
  <verify>
    <automated>node -e "const j=require('./src/i18n/en.json'); if(!j.hero.tagline_before || !j.hero.tagline_before.endsWith(' ')) process.exit(1); if(j.hero.tagline_accent !== 'AI Engineer') process.exit(2); if(j.hero.tagline_after !== '') process.exit(3); if('tagline' in j.hero) process.exit(4); if(!j.about.bio_before.includes('CNCF Kubestronaut')) process.exit(5); if(j.about.bio_before.includes('CNCF Kubernaut ')) process.exit(6); if(j.about.bio_accent !== '«Cracking the Kubernetes Interview»') process.exit(7); const midDotCount = (j.hero.tagline_before.match(/\u00b7/g)||[]).length; if(midDotCount !== 2) process.exit(8); console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    Presence checks (must exit 0):
    - `grep -q '"tagline_before"' src/i18n/en.json`
    - `grep -q '"tagline_accent": "AI Engineer"' src/i18n/en.json`
    - `grep -q '"tagline_after": ""' src/i18n/en.json`
    - `grep -q '"bio_before".*CNCF Kubestronaut' src/i18n/en.json`
    - `grep -q '"greeting": "Hi, I'"'"'m"' src/i18n/en.json` (greeting untouched)
    - `grep -q '"cta": "Get in touch"' src/i18n/en.json` (cta untouched)
    - `grep -q '"cta_secondary": "Read more"' src/i18n/en.json` (cta_secondary untouched)

    Absence checks (must exit 1 = no match):
    - `grep -q '"tagline":' src/i18n/en.json` — old single-key removed
    - `grep -q 'CNCF Kubernaut' src/i18n/en.json` — misspelling gone (note: this greps for "Kubernaut" followed by space/word-boundary; "Kubestronaut" contains the substring "Kuber" but NOT "Kubernaut")
    - `grep -Eq 'Kubernaut[^e]' src/i18n/en.json` — even more strict: no "Kubernaut" that isn't followed by an "e" (Kubestronaut has -estr- infix, never matches)

    JSON validity:
    - `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"` exits 0.

    Structural:
    - Running `node -e "const j=require('./src/i18n/en.json'); console.log(JSON.stringify(Object.keys(j.hero)))"` prints `["greeting","name","role","tagline_before","tagline_accent","tagline_after","cta","cta_secondary"]` (exact order).
  </acceptance_criteria>
  <done>en.json has the three-key hero tagline split with AI Engineer accent + Kubestronaut-corrected bio_before; old `hero.tagline` key is gone; file parses as valid JSON; no unintended edits to other blocks.</done>
</task>

<task type="auto">
  <name>Task 2: Mutate RU hero block (3-key tagline split, RU before + English accent) + about.bio_before (Kubestronaut fix)</name>
  <files>src/i18n/ru.json</files>
  <read_first>
    - src/i18n/ru.json (current state — read ENTIRE file to preserve JSON validity, Unicode escape style, and non-phase-4 blocks)
    - .planning/phases/04-hero-reference-match/04-CONTEXT.md (D-04, D-15, D-16 — especially the note that `tagline_accent` stays English-verbatim in BOTH locales)
    - .planning/phases/04-hero-reference-match/04-PATTERNS.md §`src/i18n/ru.json` (target JSON shape verbatim)
    - .planning/phases/03-section-order-about/03-01-i18n-keys-PLAN.md (reference cadence for Task 2 RU mirror — bilingual parity rule)
  </read_first>
  <action>
    Replace the `hero` object and patch the `about.bio_before` string in `src/i18n/ru.json`. Final state of the two affected blocks MUST be exactly:

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
    "about": {
      "title": "\u041e\u0431\u043e \u043c\u043d\u0435",
      "bio_before": "Solutions Architect \u0438 AI Engineer \u0441 15+ \u0433\u043e\u0434\u0430\u043c\u0438 \u043e\u043f\u044b\u0442\u0430 \u0432 \u043f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0438 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u044b\u0445 \u0441\u0438\u0441\u0442\u0435\u043c. \u0420\u0430\u0431\u043e\u0442\u0430\u044e \u0432 AWS, \u0432\u0435\u0434\u0443 \u0441\u043a\u0432\u043e\u0437\u043d\u0443\u044e \u0430\u0440\u0445\u0438\u0442\u0435\u043a\u0442\u0443\u0440\u0443 \u0434\u043b\u044f enterprise-\u043a\u043b\u0438\u0435\u043d\u0442\u043e\u0432: hybrid cloud, Kubernetes, GenAI \u0438 agentic-\u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b. CNCF Kubestronaut \u0438 \u0430\u0432\u0442\u043e\u0440 \u043a\u043d\u0438\u0433\u0438 ",
      "bio_accent": "«Cracking the Kubernetes Interview»",
      "bio_after": ".",
      "skills_title": "\u042d\u043a\u0441\u043f\u0435\u0440\u0442\u0438\u0437\u0430"
    },
    ```

    Rules (mandatory):
    - `tagline_before` MUST end with a trailing SPACE character, same as EN.
    - `tagline_before` decodes to `"Распределённые системы · Kubernetes · "` (space-terminated).
    - `tagline_before` MUST contain exactly two U+00B7 middle-dot characters as `\u00b7` escapes.
    - `tagline_accent` MUST be byte-identical to EN: `"AI Engineer"` (term-of-art stays English per D-15 + Phase 3 D-07 pattern).
    - `tagline_after` MUST be empty string `""`.
    - Remove the old `"tagline": "..."` line entirely.
    - Preserve key order: `greeting → name → role → tagline_before → tagline_accent → tagline_after → cta → cta_secondary` (matches EN order).
    - In the `about` block: change the substring `CNCF Kubernaut и автор книги ` (encoded `CNCF Kubernaut \u0438 \u0430\u0432\u0442\u043e\u0440 \u043a\u043d\u0438\u0433\u0438 `) to `CNCF Kubestronaut и автор книги ` — one-word fix inside a Cyrillic-heavy string. Trailing space unchanged.
    - The existing `bio_before` uses a mix of Unicode escapes and ASCII substrings (`Solutions Architect и AI Engineer с 15+ годами опыта в ...`). Preserve the mixed style; do NOT re-encode Cyrillic to literal or Unicode escape uniformly — just change the one word `Kubernaut` → `Kubestronaut`.
    - Do NOT touch any other top-level key (`nav`, `search`, `podcasts`, `speaking`, `book`, `presentations`, `blog`, `contact`, `footer`). These stay byte-identical.
    - Final file MUST be valid JSON.
    - File MUST end with a trailing newline.
  </action>
  <verify>
    <automated>node -e "const j=require('./src/i18n/ru.json'); if(!j.hero.tagline_before || !j.hero.tagline_before.endsWith(' ')) process.exit(1); if(j.hero.tagline_accent !== 'AI Engineer') process.exit(2); if(j.hero.tagline_after !== '') process.exit(3); if('tagline' in j.hero) process.exit(4); if(!j.about.bio_before.includes('CNCF Kubestronaut')) process.exit(5); if(j.about.bio_before.match(/CNCF Kubernaut[^e]/)) process.exit(6); if(j.about.bio_accent !== '«Cracking the Kubernetes Interview»') process.exit(7); const midDotCount = (j.hero.tagline_before.match(/\u00b7/g)||[]).length; if(midDotCount !== 2) process.exit(8); if(!j.hero.tagline_before.includes('Kubernetes')) process.exit(9); if(!j.hero.tagline_before.match(/[\u0400-\u04FF]/)) process.exit(10); console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    Presence checks (must exit 0):
    - `grep -q '"tagline_before"' src/i18n/ru.json`
    - `grep -q '"tagline_accent": "AI Engineer"' src/i18n/ru.json`
    - `grep -q '"tagline_after": ""' src/i18n/ru.json`
    - `grep -q 'CNCF Kubestronaut' src/i18n/ru.json`
    - `grep -q '"greeting"' src/i18n/ru.json` (greeting untouched)

    Absence checks (must exit 1 = no match):
    - `grep -q '"tagline":' src/i18n/ru.json` — old single-key removed
    - `grep -Eq 'Kubernaut[^e]' src/i18n/ru.json` — misspelling gone

    JSON validity + structural:
    - `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json','utf8'))"` exits 0.
    - `node -e "const j=require('./src/i18n/ru.json'); console.log(JSON.stringify(Object.keys(j.hero)))"` prints `["greeting","name","role","tagline_before","tagline_accent","tagline_after","cta","cta_secondary"]`.

    Bilingual parity:
    - `node -e "const en=require('./src/i18n/en.json'); const ru=require('./src/i18n/ru.json'); if(en.hero.tagline_accent !== ru.hero.tagline_accent) process.exit(1);"` exits 0 (accent byte-identical across locales).
    - `node -e "const en=require('./src/i18n/en.json'); const ru=require('./src/i18n/ru.json'); if(en.hero.tagline_after !== ru.hero.tagline_after) process.exit(1);"` exits 0 (after byte-identical).
  </acceptance_criteria>
  <done>ru.json has the three-key hero tagline split with RU `tagline_before` + English `AI Engineer` accent + empty `tagline_after` + Kubestronaut-corrected bio_before; old `hero.tagline` key is gone; file parses as valid JSON; bilingual parity confirmed against en.json.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundary. Changes are to static JSON files bundled at build time.
No user input, no auth, no data handling, no network calls.

## STRIDE Threat Register

| Threat ID  | Category       | Component               | Disposition | Mitigation Plan                                                                       |
|------------|----------------|-------------------------|-------------|---------------------------------------------------------------------------------------|
| T-04-i18n-01 | Tampering    | src/i18n/{en,ru}.json   | accept      | Build-time static asset. Tampering requires repo write access (already trust-bounded). |
| T-04-i18n-02 | Info disclosure | tagline/bio strings  | accept      | Public-facing bio copy, intentionally published. No PII.                              |
| T-04-i18n-03 | Injection (XSS) | tagline_accent rendering | mitigate | Plan 04-02 MUST use `<span>{i.hero.tagline_accent}</span>` (text content), NEVER `set:html`. Enforces no-HTML-in-JSON invariant from Phase 3 D-01. |

No new attack surface introduced by this plan — pure content mutation. XSS
mitigation is forward-looking for Plan 04-02's consumer.
</threat_model>

<verification>
- Both JSON files parse as valid JSON.
- Each task's `<verify><automated>` Node one-liner exits 0.
- All grep assertions in `<acceptance_criteria>` pass.
- Reconstructed tagline reads naturally in each locale when
  `tagline_before + tagline_accent + tagline_after` is concatenated:
  - EN: `"Distributed Systems · Kubernetes · AI Engineer"`
  - RU: `"Распределённые системы · Kubernetes · AI Engineer"`
- Reconstructed bio reads naturally: `bio_before + bio_accent + bio_after`:
  - EN: `"... CNCF Kubestronaut and author of «Cracking the Kubernetes Interview»."`
  - RU: `"... CNCF Kubestronaut и автор книги «Cracking the Kubernetes Interview»."`
- `npm run build` pass/fail is NOT a gate for this plan (Hero.astro still
  references `i.hero.tagline` which is now removed — build will fail with
  `Property 'tagline' does not exist` until Plan 04-02 lands in Wave 2).
  This matches the Phase 3 03-01 precedent (same mid-wave breakage cadence).
  Plan 04-02 is the build-pass gate for Phase 4.
</verification>

<success_criteria>
- Both `en.json` and `ru.json` contain `hero.tagline_before`, `hero.tagline_accent`,
  `hero.tagline_after` with the exact values specified.
- Neither file contains `hero.tagline` (old single-key).
- Both files contain `CNCF Kubestronaut` in `about.bio_before`; neither contains
  `CNCF Kubernaut` anywhere.
- Both files parse as valid JSON.
- Non-phase-4 top-level keys (`nav`, `search`, `podcasts`, `speaking`, `book`,
  `presentations`, `blog`, `contact`, `footer`) are byte-identical to pre-plan
  state in both files.
- Bilingual parity: `tagline_accent` and `tagline_after` are byte-identical
  across en.json and ru.json.
</success_criteria>

<output>
After completion, create `.planning/phases/04-hero-reference-match/04-01-SUMMARY.md` recording:
- Final EN and RU `hero` block quoted verbatim.
- Final EN and RU `about.bio_before` strings quoted verbatim (showing the
  Kubestronaut fix).
- Confirmation that old `hero.tagline` key is removed from both files.
- Confirmation that `Kubernaut` does not appear in either JSON file after the
  plan.
- Note that `npm run build` was NOT run as a gate (expected to fail mid-wave
  until Plan 04-02 lands — same as Phase 3 03-01 precedent). Orchestrator
  should proceed to Plan 04-02 without a build check between plans.
- Flag for Plan 04-02 executor: the i18n typed accessor `i.hero.tagline_*`
  keys are now available.
</output>
</content>
