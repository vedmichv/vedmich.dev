---
phase: 03-section-order-about
plan: 02
status: complete
completed: 2026-04-19
files_changed:
  - src/components/Header.astro
  - src/pages/en/index.astro
  - src/pages/ru/index.astro
---

# Plan 03-02 — Section order + nav reorder — SUMMARY

## What changed

Swapped `<Book>` above `<Speaking>` in both locale index pages and mirrored the
move in `Header.astro`'s `navItems` array. Three files, three tiny edits; no
new components, no new i18n keys.

## Diff summary

- `src/components/Header.astro` — swapped positions of `{ href: '#book', ... }`
  and `{ href: '#speaking', ... }` inside the `navItems` array. Order is now
  `about · podcasts · book · speaking · presentations · blog · contact`.
  Mobile menu inherits the change via the shared array.
- `src/pages/en/index.astro` — moved `<Book locale={locale} />` above
  `<Speaking locale={locale} />` inside `<BaseLayout>`.
- `src/pages/ru/index.astro` — same move; EN/RU component sequence is now
  byte-equal (verified).

## Build result

```
[build] 7 page(s) built in 841ms
[build] Complete!
```

- `dist/en/index.html` — `<section id="book"` at offset 21953; `<section id="speaking"` at offset 23840 (book first ✓).
- `dist/ru/index.html` — `<section id="book"` at offset 21936; `<section id="speaking"` at offset 23808 (book first ✓).
- No warnings or errors referencing Header.astro or either index page.

## Notes

- About.astro still references `i.about.bio` and `i.about.certs_title` — these
  keys no longer exist after 03-01, so the bio paragraph currently renders as
  `undefined` text. Astro does not hard-fail on missing JSON keys at build
  time; the user-visible breakage is contained to the About section and will
  be resolved when 03-03 rewrites that component. Expected per plan ordering.
- Commit + push deferred to phase-level atomic commit after 03-03 user
  visual-verify checkpoint.
