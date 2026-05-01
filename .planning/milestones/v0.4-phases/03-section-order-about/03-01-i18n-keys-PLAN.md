---
phase: 03-section-order-about
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/i18n/en.json
  - src/i18n/ru.json
autonomous: true
requirements:
  - REQ-008
objective: >-
  Split the single-string `about.bio` key into three keys (`about.bio_before`,
  `about.bio_accent`, `about.bio_after`) and remove the now-obsolete
  `about.certs_title` key in both EN and RU locale files, so the new About
  component (Plan 03-03) can render the bio paragraph with the book title
  wrapped in a teal accent span without `set:html` or in-component string
  parsing. The accent string `«Cracking the Kubernetes Interview»` stays
  verbatim in both locales per D-07.

must_haves:
  truths:
    - Both en.json and ru.json contain a populated `about.bio_before` string key.
    - Both en.json and ru.json contain `about.bio_accent` with the exact value `«Cracking the Kubernetes Interview»` (book title unchanged in RU per D-07).
    - Both en.json and ru.json contain a populated `about.bio_after` string key.
    - The old `about.bio` key is removed from both files.
    - The old `about.certs_title` key is removed from both files.
    - `npm run build` still exits 0 — TypeScript typed access via `t(locale).about.*` does not break existing consumers (Phase 3 About rewrite lands in Plan 03-03; as of this plan, About.astro still references `i.about.bio` and `i.about.certs_title`, so we leave those consumers alone — they land in 03-03 in the same wave sequence).
  artifacts:
    - path: src/i18n/en.json
      provides: EN copy for new bio split + removed certs_title key
      contains: '"bio_before"'
    - path: src/i18n/ru.json
      provides: RU copy for new bio split + removed certs_title key
      contains: '"bio_before"'
  key_links:
    - from: src/i18n/en.json
      to: src/components/About.astro
      via: typed t(locale).about.bio_before access (wired in Plan 03-03)
      pattern: 'i\.about\.bio_(before|accent|after)'
    - from: src/i18n/ru.json
      to: src/components/About.astro
      via: typed t(locale).about.bio_before access (wired in Plan 03-03)
      pattern: 'i\.about\.bio_(before|accent|after)'
---

<objective>
Split `about.bio` into three keys (`bio_before`, `bio_accent`, `bio_after`) and
remove `about.certs_title` from both `src/i18n/en.json` and `src/i18n/ru.json`.
This unblocks Plan 03-03 (About rewrite) in Wave 2 without requiring HTML in
JSON values or `set:html` in the component.

Purpose: Implement D-01 and D-07 from CONTEXT.md — translator-friendly three-key
split with the book title preserved as a verbatim English string in both locales.

Output: Two mutated JSON files with the new key shape in the `about` object.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/03-section-order-about/03-CONTEXT.md

<interfaces>
<!-- Existing `about` key shape in both files (the source-of-truth before this plan) -->

From src/i18n/en.json (current):
```json
"about": {
  "title": "About Me",
  "bio": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of \"Cracking the Kubernetes Interview\".",
  "skills_title": "Expertise",
  "certs_title": "Certifications"
}
```

From src/i18n/ru.json (current):
```json
"about": {
  "title": "Обо мне",
  "bio": "Solutions Architect и AI Engineer с 15+ годами опыта в проектировании распределённых систем. Работаю в AWS, веду сквозную архитектуру для enterprise-клиентов: hybrid cloud, Kubernetes, GenAI и agentic-платформы. CNCF Kubernaut и автор книги «Cracking the Kubernetes Interview».",
  "skills_title": "Экспертиза",
  "certs_title": "Сертификации"
}
```

Target shape (both files) after this plan:
```json
"about": {
  "title": "...",
  "bio_before": "<text that precedes the book title>",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": "<text that follows the book title, including final period>",
  "skills_title": "..."
}
```

Notes on splitting:
- EN current ends `... CNCF Kubernaut and author of "Cracking the Kubernetes Interview".` — the book title uses ASCII straight quotes in current copy. New `bio_accent` uses guillemets `«»` per D-07 for visual parity with the reference and RU convention. That means the split sentence must NOT leave a dangling straight quote on either side — the quotes move from the text into the accent string.
- RU current already uses `«»` around the title, so the split is cleaner there.
- `bio_after` must carry the trailing period (`.`) so the sentence terminates correctly after the `</span>`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Mutate EN about block — add three-key bio split, drop certs_title</name>
  <files>src/i18n/en.json</files>
  <read_first>
    - src/i18n/en.json (current state — read ENTIRE file, not just about block, to preserve trailing commas and overall JSON validity)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (D-01, D-07 — the specification for this split)
  </read_first>
  <action>
    Replace the `about` object in `src/i18n/en.json` with exactly this shape (order preserved, `title` and `skills_title` unchanged, `bio` replaced by the 3-key split, `certs_title` removed):

    ```json
    "about": {
      "title": "About Me",
      "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of ",
      "bio_accent": "«Cracking the Kubernetes Interview»",
      "bio_after": ".",
      "skills_title": "Expertise"
    },
    ```

    Rules:
    - `bio_before` MUST end with a trailing space so the accent span follows naturally ("... author of <span>«…»</span>.").
    - `bio_accent` MUST be the EXACT string `«Cracking the Kubernetes Interview»` — guillemets `«»` are Unicode chars U+00AB / U+00BB (NOT ASCII `<<` or `>>`).
    - `bio_after` MUST be exactly `.` (just the period, no leading space — the `</span>` sits flush against the period in the rendered paragraph).
    - Remove the `"certs_title"` line entirely (don't leave a dangling key or trailing comma).
    - Remove the old `"bio"` line entirely.
    - Keep the surrounding JSON structure intact — this mutation affects only the `about` block; all other top-level keys (`nav`, `search`, `hero`, `podcasts`, `speaking`, `book`, `presentations`, `blog`, `contact`, `footer`) stay byte-identical.
    - Final file MUST be valid JSON (no trailing commas, balanced braces).
  </action>
  <verify>
    <automated>node -e "const j=require('./src/i18n/en.json'); if(!j.about.bio_before) process.exit(1); if(j.about.bio_accent!=='«Cracking the Kubernetes Interview»') process.exit(2); if(j.about.bio_after!=='.') process.exit(3); if('bio' in j.about) process.exit(4); if('certs_title' in j.about) process.exit(5); console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q '"bio_before"' src/i18n/en.json` exits 0.
    - `grep -q '"bio_accent": "«Cracking the Kubernetes Interview»"' src/i18n/en.json` exits 0 (literal guillemet chars).
    - `grep -q '"bio_after": "."' src/i18n/en.json` exits 0.
    - `grep -q '"bio":' src/i18n/en.json` exits 1 (old key removed).
    - `grep -q '"certs_title"' src/i18n/en.json` exits 1 (key removed).
    - `grep -q '"skills_title": "Expertise"' src/i18n/en.json` exits 0 (untouched).
    - `grep -q '"title": "About Me"' src/i18n/en.json` exits 0 (untouched).
    - `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"` exits 0 (still valid JSON).
  </acceptance_criteria>
  <done>en.json contains the three-key bio split with the correct accent string and trailing period; old `bio` and `certs_title` keys are gone; file parses as valid JSON.</done>
</task>

<task type="auto">
  <name>Task 2: Mutate RU about block — add three-key bio split, drop certs_title</name>
  <files>src/i18n/ru.json</files>
  <read_first>
    - src/i18n/ru.json (current state — read ENTIRE file to preserve JSON validity and existing UTF-8 escaping)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (D-01, D-07 — especially the note that the book title is English-verbatim in BOTH locales)
  </read_first>
  <action>
    Replace the `about` object in `src/i18n/ru.json` with exactly this shape (title and skills_title unchanged; bio replaced by the 3-key split; certs_title removed):

    ```json
    "about": {
      "title": "Обо мне",
      "bio_before": "Solutions Architect и AI Engineer с 15+ годами опыта в проектировании распределённых систем. Работаю в AWS, веду сквозную архитектуру для enterprise-клиентов: hybrid cloud, Kubernetes, GenAI и agentic-платформы. CNCF Kubernaut и автор книги ",
      "bio_accent": "«Cracking the Kubernetes Interview»",
      "bio_after": ".",
      "skills_title": "Экспертиза"
    },
    ```

    Rules:
    - `bio_before` MUST end with a trailing space (the sentence reads "... автор книги <span>«…»</span>.").
    - `bio_accent` MUST match EN byte-for-byte (`«Cracking the Kubernetes Interview»`) per D-07 — the book title is NOT translated, even in Russian. Guillemets here are already standard Russian quoting, so the choice is doubly correct.
    - `bio_after` MUST be exactly `.` (bare period).
    - Remove `"bio"` and `"certs_title"` keys entirely.
    - All other top-level blocks stay byte-identical.
    - The existing file uses Unicode escape sequences (e.g. `\u041e\u0431\u043e`) for Cyrillic — it is fine to write literal Cyrillic characters OR keep escape sequences; valid JSON either way. Prefer literal Cyrillic for new text (easier to read in diffs) — Astro reads either form transparently.
    - Final file MUST be valid JSON.
  </action>
  <verify>
    <automated>node -e "const j=require('./src/i18n/ru.json'); if(!j.about.bio_before || !j.about.bio_before.includes('CNCF Kubernaut')) process.exit(1); if(j.about.bio_accent!=='«Cracking the Kubernetes Interview»') process.exit(2); if(j.about.bio_after!=='.') process.exit(3); if('bio' in j.about) process.exit(4); if('certs_title' in j.about) process.exit(5); if(j.about.skills_title!=='Экспертиза' && j.about.skills_title!=='\u042d\u043a\u0441\u043f\u0435\u0440\u0442\u0438\u0437\u0430') process.exit(6); console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q '"bio_before"' src/i18n/ru.json` exits 0.
    - `grep -q '"bio_accent": "«Cracking the Kubernetes Interview»"' src/i18n/ru.json` exits 0 (literal guillemets, literal English book title).
    - `grep -q '"bio_after": "."' src/i18n/ru.json` exits 0.
    - `grep -q '"bio":' src/i18n/ru.json` exits 1 (old key removed).
    - `grep -q '"certs_title"' src/i18n/ru.json` exits 1.
    - `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json','utf8'))"` exits 0 (still valid JSON).
    - `node -e "const j=require('./src/i18n/ru.json'); if(j.about.skills_title.length < 3) process.exit(1);"` exits 0 (skills_title preserved, regardless of escape form).
  </acceptance_criteria>
  <done>ru.json contains the three-key bio split with the book title verbatim English and surrounded by guillemets; old `bio` and `certs_title` keys are gone; `skills_title` preserved; file parses as valid JSON.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundary. Changes are to static JSON files bundled at build time.
No user input, no auth, no data handling.

## STRIDE Threat Register

| Threat ID  | Category       | Component           | Disposition | Mitigation Plan                                                                       |
|------------|----------------|---------------------|-------------|---------------------------------------------------------------------------------------|
| T-03-01    | Tampering      | src/i18n/{en,ru}.json | accept    | Build-time static asset. Tampering requires repo write access (already trust-bounded). |
| T-03-02    | Info disclosure | bio_before/after text | accept    | Public bio text, intentionally published. No PII beyond what's already on the site.   |

No new attack surface introduced — pure content mutation.
</threat_model>

<verification>
- Both JSON files parse as valid JSON (`node -e "JSON.parse(fs.readFileSync(...))"` exits 0 for each).
- `grep` assertions in each task's acceptance_criteria all pass.
- The full sentence, reconstructed as `bio_before + bio_accent + bio_after`, reads naturally in each locale.
  - EN: "...CNCF Kubernaut and author of «Cracking the Kubernetes Interview»."
  - RU: "...CNCF Kubernaut и автор книги «Cracking the Kubernetes Interview»."
- `npm run build` exit 0 is NOT a gate for this plan (About.astro will reference the old `i.about.bio` key until Plan 03-03 lands; TypeScript may warn but build won't break because `.json` imports are untyped at the leaf level in Astro's default setup). If build breaks unexpectedly, that is a blocker for Plan 03-03 to pick up — leave the note in SUMMARY.
</verification>

<success_criteria>
- Both `en.json` and `ru.json` contain `about.bio_before`, `about.bio_accent`, `about.bio_after` with the exact values specified in Tasks 1 and 2.
- Neither file contains `about.bio` or `about.certs_title`.
- Both files parse as valid JSON.
- `skills_title` and `title` in `about` are unchanged in both files.
</success_criteria>

<output>
After completion, create `.planning/phases/03-section-order-about/03-01-SUMMARY.md` recording:
- Final EN and RU bio strings (before/accent/after) quoted verbatim.
- Confirmation that `about.bio` and `about.certs_title` keys are removed.
- Note whether `npm run build` was run (it's optional for this plan — 03-03 is the real gate).
</output>
</content>
</invoke>