---
phase: 03-section-order-about
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/en/index.astro
  - src/pages/ru/index.astro
  - src/components/Header.astro
autonomous: true
requirements:
  - REQ-009
  - REQ-010
objective: >-
  Reorder the homepage section render order in both `src/pages/en/index.astro`
  and `src/pages/ru/index.astro` so that `<Book />` renders before `<Speaking />`,
  matching the reference (`app.jsx:670-684`). Mirror the same order in the
  desktop + mobile navigation by reordering the `navItems` array in
  `src/components/Header.astro` (`about → podcasts → book → speaking → presentations
  → blog → contact`). All three files land the same logical change (Book up one
  slot) and stay in sync.

must_haves:
  truths:
    - Homepage section order on /en/ is Hero → About → Podcasts → Book → Speaking → Presentations → BlogPreview → Contact.
    - Homepage section order on /ru/ is Hero → About → Podcasts → Book → Speaking → Presentations → BlogPreview → Contact (identical to /en/).
    - Header desktop nav link order is `About · Podcasts · Book · Speaking · Slides · Blog · Contact`.
    - Header mobile menu link order matches desktop (same `navItems` array source).
    - `npm run build` exits 0; Astro build emits 7 pages (2 index pages + 2 blog index + 2 blog listing + possibly a 404 or similar — whatever the project emitted before this plan, same count).
  artifacts:
    - path: src/pages/en/index.astro
      provides: EN homepage with Book before Speaking
      contains: '<Book locale={locale} />'
    - path: src/pages/ru/index.astro
      provides: RU homepage with Book before Speaking
      contains: '<Book locale={locale} />'
    - path: src/components/Header.astro
      provides: navItems array in the new order
      contains: "'#book'"
  key_links:
    - from: src/components/Header.astro
      to: src/pages/{en,ru}/index.astro
      via: anchor href matches section id (#about, #podcasts, #book, #speaking, #presentations, #blog, #contact)
      pattern: "href=\"#(about|podcasts|book|speaking|presentations|blog|contact)\""
---

<objective>
Reorder `<Book />` above `<Speaking />` in both locale index pages, and reorder
the `navItems` array in `Header.astro` to match. This is REQ-009 (section order)
and REQ-010 (Book before Speaking) from the roadmap.

Purpose: Implement D-04 (nav reorder) and the section-order change per CONTEXT.md
§domain. The reference composition is `Hero → About → Podcasts → Book → Speaking
→ Presentations → Blog → Contact` (app.jsx:670-684). The reference nav is
`about · podcasts · book · speaking · presentations · blog · contact`
(app.jsx:308).

Output: Three mutated files in sync. No new files, no new i18n keys (all `nav.*`
keys already exist), no new components.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/phases/03-section-order-about/03-CONTEXT.md

<interfaces>
<!-- Current navItems array shape (Header.astro:12-20) -->

From src/components/Header.astro (current):
```astro
const navItems = [
  { href: '#about', label: i.nav.about },
  { href: '#podcasts', label: i.nav.podcasts },
  { href: '#speaking', label: i.nav.speaking },
  { href: '#book', label: i.nav.book },
  { href: '#presentations', label: i.nav.presentations },
  { href: '#blog', label: i.nav.blog },
  { href: '#contact', label: i.nav.contact },
];
```

Target shape:
```astro
const navItems = [
  { href: '#about', label: i.nav.about },
  { href: '#podcasts', label: i.nav.podcasts },
  { href: '#book', label: i.nav.book },
  { href: '#speaking', label: i.nav.speaking },
  { href: '#presentations', label: i.nav.presentations },
  { href: '#blog', label: i.nav.blog },
  { href: '#contact', label: i.nav.contact },
];
```

<!-- Current index.astro section render order (lines 15-24 in both /en and /ru) -->

Current:
```astro
<Hero locale={locale} />
<About locale={locale} />
<Podcasts locale={locale} />
<Speaking locale={locale} />
<Book locale={locale} />
<Presentations locale={locale} />
<BlogPreview locale={locale} />
<Contact locale={locale} />
```

Target:
```astro
<Hero locale={locale} />
<About locale={locale} />
<Podcasts locale={locale} />
<Book locale={locale} />
<Speaking locale={locale} />
<Presentations locale={locale} />
<BlogPreview locale={locale} />
<Contact locale={locale} />
```

Import statements at the top of each file stay as-is — they can stay in their
current alphabetical-ish order; only the JSX render order matters.

Reference anchor (app.jsx:670-684):
```jsx
<Header .../>
<Hero .../>
<About/>
<Podcasts/>
<Book/>
<Speaking/>
<Presentations/>
<Blog/>
<Contact .../>
<Footer/>
```

Reference nav (app.jsx:307-311):
```jsx
const nav = [
  ['about','About'], ['podcasts','Podcasts'], ['book','Book'],
  ['speaking','Speaking'], ['presentations','Slides'],
  ['blog','Blog'], ['contact','Contact']
];
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reorder Header navItems array (Book before Speaking)</name>
  <files>src/components/Header.astro</files>
  <read_first>
    - src/components/Header.astro (current state — especially lines 12-20 where navItems is declared)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (D-04 — nav reorder spec)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 307-311 — canonical nav order in the reference)
  </read_first>
  <action>
    In `src/components/Header.astro`, replace the `navItems` array declaration (the seven-element array currently at lines 12-20) with this exact array, in this exact order:

    ```astro
    const navItems = [
      { href: '#about', label: i.nav.about },
      { href: '#podcasts', label: i.nav.podcasts },
      { href: '#book', label: i.nav.book },
      { href: '#speaking', label: i.nav.speaking },
      { href: '#presentations', label: i.nav.presentations },
      { href: '#blog', label: i.nav.blog },
      { href: '#contact', label: i.nav.contact },
    ];
    ```

    Concretely: the existing lines
    `{ href: '#speaking', label: i.nav.speaking },`
    and
    `{ href: '#book', label: i.nav.book },`
    swap positions. All other lines in the array stay unchanged.

    Do NOT touch:
    - Any import statement at the top of the frontmatter
    - The `<header>`, `<nav>`, `<ul>`, desktop-nav, mobile-nav markup (they loop over `navItems` and automatically pick up the new order)
    - The search pill, locale switcher, or mobile menu toggle logic
    - The `<script>` at the bottom of the file

    The mobile menu (lines 91-99) iterates over the same `navItems` array, so it gets the new order automatically — no separate edit needed.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('src/components/Header.astro','utf8'); const m=s.match(/const navItems = \[[\s\S]*?\];/); if(!m) process.exit(1); const order=[...m[0].matchAll(/href: '#(\w+)'/g)].map(x=>x[1]); const expected=['about','podcasts','book','speaking','presentations','blog','contact']; if(JSON.stringify(order)!==JSON.stringify(expected)){console.error('Got:',order,'Expected:',expected);process.exit(2);} console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "href: '#" src/components/Header.astro` returns a number >= 7 (the seven nav items are still there; may be higher if other href links use `#` elsewhere).
    - Running the verify script above exits 0, confirming nav order is exactly `about, podcasts, book, speaking, presentations, blog, contact`.
    - `grep -n "href: '#book'" src/components/Header.astro | head -1` reports a line number that is LESS than `grep -n "href: '#speaking'" src/components/Header.astro | head -1`.
    - `grep -n "href: '#podcasts'" src/components/Header.astro | head -1` is LESS than the line for `#book`.
    - `grep -n "href: '#speaking'" src/components/Header.astro | head -1` is LESS than the line for `#presentations`.
    - The file is otherwise byte-identical outside the `navItems` array (spot check: `grep -q 'search-trigger-desktop' src/components/Header.astro` still exits 0, `grep -q 'lang-switch' src/components/Header.astro` still exits 0).
  </acceptance_criteria>
  <done>The seven-element `navItems` array in Header.astro has Book in slot 3 (0-indexed 2) and Speaking in slot 4 (0-indexed 3); all other entries unchanged; the rest of the file is untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Reorder EN homepage — Book before Speaking</name>
  <files>src/pages/en/index.astro</files>
  <read_first>
    - src/pages/en/index.astro (current state — lines 15-24 are the render block)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (§domain — section order spec)
    - /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 670-684 — canonical composition)
  </read_first>
  <action>
    In `src/pages/en/index.astro`, swap the rendering order of `<Speaking>` and `<Book>` inside the `<BaseLayout>` block. The final render order inside `<BaseLayout>` MUST be exactly:

    ```astro
    <BaseLayout title="Viktor Vedmich — Solutions Architect, Author, Speaker" locale={locale} path="/">
      <Hero locale={locale} />
      <About locale={locale} />
      <Podcasts locale={locale} />
      <Book locale={locale} />
      <Speaking locale={locale} />
      <Presentations locale={locale} />
      <BlogPreview locale={locale} />
      <Contact locale={locale} />
    </BaseLayout>
    ```

    Concretely: move the `<Book locale={locale} />` line from BELOW `<Speaking locale={locale} />` to ABOVE it. All other lines (including imports at the top of the frontmatter, the `const locale = 'en';` line, the `<BaseLayout>` opening tag with its title attribute, and the closing tag) stay unchanged.

    Do NOT:
    - Reorder the import statements at the top — they can stay in alphabetical order (imports don't control render order).
    - Rename, remove, or change any component or its `locale={locale}` prop.
    - Change the `<BaseLayout>` title string.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('src/pages/en/index.astro','utf8'); const book=s.indexOf('<Book '); const spk=s.indexOf('<Speaking '); const podc=s.indexOf('<Podcasts '); const pres=s.indexOf('<Presentations '); if(book<0||spk<0||podc<0||pres<0) process.exit(1); if(!(podc<book && book<spk && spk<pres)){console.error('Order wrong. Book:',book,'Speaking:',spk,'Podcasts:',podc,'Presentations:',pres);process.exit(2);} console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - The line number of `<Book locale={locale} />` in `src/pages/en/index.astro` is LESS than the line number of `<Speaking locale={locale} />` (verifiable via `grep -n '<Book ' src/pages/en/index.astro | head -1` vs `grep -n '<Speaking ' src/pages/en/index.astro | head -1`).
    - The line number of `<Podcasts locale={locale} />` is less than `<Book locale={locale} />` (Podcasts still precedes Book).
    - The line number of `<Speaking locale={locale} />` is less than `<Presentations locale={locale} />` (Speaking still precedes Presentations).
    - The file still contains exactly one occurrence of each: `<Hero`, `<About`, `<Podcasts`, `<Book`, `<Speaking`, `<Presentations`, `<BlogPreview`, `<Contact` (no accidental duplication or deletion). Confirm via `grep -c '<Book ' src/pages/en/index.astro` returning 1, same for each other component.
    - Import block at top is unchanged (spot check: `grep -q 'import About from' src/pages/en/index.astro` exits 0, `grep -q 'import Book from' src/pages/en/index.astro` exits 0).
  </acceptance_criteria>
  <done>Book renders before Speaking in the EN index page; all other imports and renders unchanged; file still parses as valid Astro.</done>
</task>

<task type="auto">
  <name>Task 3: Reorder RU homepage — Book before Speaking (mirror EN)</name>
  <files>src/pages/ru/index.astro</files>
  <read_first>
    - src/pages/ru/index.astro (current state)
    - src/pages/en/index.astro (for structural parity — RU MUST mirror EN's component order exactly)
    - .planning/phases/03-section-order-about/03-CONTEXT.md (§domain — bilingual parity requirement)
  </read_first>
  <action>
    In `src/pages/ru/index.astro`, swap the rendering order of `<Speaking>` and `<Book>` inside the `<BaseLayout>` block. The final render order inside `<BaseLayout>` MUST be EXACTLY the same as EN, only the BaseLayout title string differs (Russian title):

    ```astro
    <BaseLayout title="Виктор Ведмич — Solutions Architect, Автор, Спикер" locale={locale} path="/">
      <Hero locale={locale} />
      <About locale={locale} />
      <Podcasts locale={locale} />
      <Book locale={locale} />
      <Speaking locale={locale} />
      <Presentations locale={locale} />
      <BlogPreview locale={locale} />
      <Contact locale={locale} />
    </BaseLayout>
    ```

    Concretely: move `<Book locale={locale} />` from BELOW `<Speaking locale={locale} />` to ABOVE it. Everything else (imports, `const locale = 'ru';`, the Russian page title) stays unchanged.

    Verify parity: after your edit, the sequence of component tags inside `<BaseLayout>` must be byte-equal between EN and RU (only the BaseLayout title attribute differs).
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('src/pages/ru/index.astro','utf8'); const book=s.indexOf('<Book '); const spk=s.indexOf('<Speaking '); const podc=s.indexOf('<Podcasts '); const pres=s.indexOf('<Presentations '); if(book<0||spk<0||podc<0||pres<0) process.exit(1); if(!(podc<book && book<spk && spk<pres)){console.error('Order wrong.');process.exit(2);} /* parity check with EN */ const en=fs.readFileSync('src/pages/en/index.astro','utf8'); const extract=x=>(x.match(/<(Hero|About|Podcasts|Book|Speaking|Presentations|BlogPreview|Contact) locale=\{locale\} \/>/g)||[]).join('|'); if(extract(s)!==extract(en)){console.error('EN/RU order diverges');process.exit(3);} console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - Line number of `<Book locale={locale} />` in `src/pages/ru/index.astro` is LESS than line number of `<Speaking locale={locale} />`.
    - `<Podcasts locale={locale} />` precedes `<Book locale={locale} />`; `<Speaking locale={locale} />` precedes `<Presentations locale={locale} />`.
    - The component tag sequence inside `<BaseLayout>` in `src/pages/ru/index.astro` is IDENTICAL to `src/pages/en/index.astro` (verified by the parity check in the verify script).
    - `grep -c '<Book ' src/pages/ru/index.astro` returns 1 (no duplication).
    - `grep -q 'Виктор Ведмич' src/pages/ru/index.astro` exits 0 OR `grep -q '\\u0412\\u0438\\u043a\\u0442\\u043e\\u0440' src/pages/ru/index.astro` exits 0 — RU title preserved in whatever form it existed before.
    - `grep -q "const locale = 'ru'" src/pages/ru/index.astro` exits 0 (locale constant intact).
  </acceptance_criteria>
  <done>Book renders before Speaking in the RU index page; component sequence is byte-equal to EN; RU BaseLayout title unchanged; file parses as valid Astro.</done>
</task>

<task type="auto">
  <name>Task 4: Build gate — confirm Astro build passes with reordered sections + nav</name>
  <files></files>
  <read_first>
    - src/pages/en/index.astro (should be in new order after Tasks 2)
    - src/pages/ru/index.astro (should be in new order after Task 3)
    - src/components/Header.astro (should be in new order after Task 1)
  </read_first>
  <action>
    Run `npm run build` from the repo root. The build MUST exit 0 and MUST emit the site to `dist/`.

    No code changes in this task — it is a gate. If build fails, diagnose the root cause:
    - Syntax error in Header.astro → fix the navItems array formatting.
    - Syntax error in either index.astro → fix the JSX structure.
    - If the About component references `i.about.bio` and 03-01 has landed removing that key, this task may surface a TypeScript complaint. That is expected — it is the REASON Plan 03-03 exists in Wave 2. If the build hard-fails (not just warns) on this, ESCAPE from this plan, note it in SUMMARY.md as "03-01 → 03-03 ordering forced into strict sequence", and let the orchestrator decide. Astro typically tolerates the missing-key at build time (defers to runtime), so this is unlikely to block.

    Do NOT commit yet — the atomic phase commit happens after Plan 03-03 completes per CLAUDE.md §Publishing Workflow (one commit per phase, not per plan).
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20 | tee /tmp/gsd-03-02-build.log; grep -E "(Complete!|page\(s\) built|error|Error)" /tmp/gsd-03-02-build.log | head -10; test "${PIPESTATUS[0]:-0}" -eq 0 || exit 1</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits with code 0.
    - Build output contains "Complete!" OR "built" indicating successful page emission (Astro's typical success line).
    - `dist/en/index.html` exists (`test -f dist/en/index.html`).
    - `dist/ru/index.html` exists (`test -f dist/ru/index.html`).
    - `grep -c '<section id="book"' dist/en/index.html` >= 1 AND `grep -c '<section id="speaking"' dist/en/index.html` >= 1 (both sections rendered).
    - In `dist/en/index.html`, the byte offset of `<section id="book"` is LESS than the byte offset of `<section id="speaking"`. Same for `dist/ru/index.html`.
  </acceptance_criteria>
  <done>`npm run build` exits 0; both `dist/en/index.html` and `dist/ru/index.html` contain the Book section before the Speaking section in DOM order.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundary. Changes are pure JSX render-order edits.

## STRIDE Threat Register

| Threat ID  | Category       | Component           | Disposition | Mitigation Plan                                                    |
|------------|----------------|---------------------|-------------|--------------------------------------------------------------------|
| T-03-03    | Tampering      | Header.astro navItems | accept    | Static build-time. Repo access already trust-bounded.              |
| T-03-04    | Info disclosure | Reordered sections  | accept    | No new information exposed; same content, different visual order. |

No new attack surface introduced.
</threat_model>

<verification>
- All four tasks' automated checks pass.
- Built HTML in `dist/en/index.html` and `dist/ru/index.html` shows Book section before Speaking section in document order.
- Nav in `Header.astro` renders in the new order when opened in a browser (validated visually in the phase-level gate after 03-03 ships).
- No regression: search pill, locale switcher, mobile menu toggle — all still present and functional.
</verification>

<success_criteria>
- Section order in both locale pages: `Hero → About → Podcasts → Book → Speaking → Presentations → BlogPreview → Contact`.
- Header `navItems` order: `about → podcasts → book → speaking → presentations → blog → contact`.
- `npm run build` exits 0.
- `dist/en/index.html` and `dist/ru/index.html` confirm the new DOM order.
</success_criteria>

<output>
After completion, create `.planning/phases/03-section-order-about/03-02-SUMMARY.md` recording:
- Diff summary (swapped two lines in each of 3 files).
- Build result (`npm run build` exit code + pages built count).
- Grep confirmations for new order in built HTML.
- Note: commit + push happens as part of the phase-level atomic commit after 03-03.
</output>
</content>
</invoke>