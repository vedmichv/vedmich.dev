# Phase 1 — Header: search pill + EN·RU locale switcher

**Requirement:** REQ-001
**Files touched:** `src/components/Header.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Target commit:** atomic, single commit, push to main, auto-deploy

## Goal (one sentence)

Replace the current header right-side layout (nav list + single `RU`/`EN` border-button switcher) with (a) a non-functional `⌕ Search… ⌘K` pill sitting between nav and locale switcher, and (b) an `EN · RU` dot-separator locale switcher where the active locale is bold and the other is dimmed-clickable.

## Target output (what the final header looks like at 1440px)

```
[VV logo] vedmich.dev       About  Podcasts  Speaking  Book  Slides  Blog  Contact   [⌕  Search…  ⌘K]   EN · RU
```

- Search pill: rounded-lg, `bg-bg-elevated`, `border-border`, ~220px wide.
  - `⌕` glyph: `text-brand-primary-hover` (teal-300)
  - `Search…` label: `text-text-muted`
  - `⌘K` kbd: small pill, `bg-bg-base`, `border-border`, `text-text-muted`, font-mono
- Locale switcher: plain text. Active = `font-semibold text-text-primary`; inactive = `text-text-muted hover:text-text-primary`. Dot = `·` in `text-border-strong` with small horizontal margin.

At 375px (mobile): search pill and locale switcher collapse into the mobile menu; hamburger remains.

## Tasks

1. **Edit `src/components/Header.astro`:**
   - In desktop `<ul>` (after the last `navItems.map` item), add BEFORE the locale `<li>`:
     ```astro
     <li class="hidden lg:block">
       <button
         type="button"
         class="search-pill flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-border hover:border-border-strong transition-colors text-sm"
         aria-label={i.nav.search_label}
         disabled
       >
         <svg class="w-3.5 h-3.5 text-brand-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <circle cx="11" cy="11" r="7"/>
           <path d="m20 20-3-3"/>
         </svg>
         <span class="text-text-muted">{i.nav.search_placeholder}</span>
         <kbd class="px-1.5 py-0.5 text-[11px] font-mono rounded bg-bg-base border border-border text-text-muted">⌘K</kbd>
       </button>
     </li>
     ```
   - Replace the current locale `<li>` with a dot-separator layout:
     ```astro
     <li class="flex items-center gap-2 text-sm">
       <a
         href={getLocalizedPath('/', 'en')}
         class={`lang-switch transition-colors ${locale === 'en' ? 'font-semibold text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
         data-lang="en"
       >EN</a>
       <span class="text-border-strong" aria-hidden="true">·</span>
       <a
         href={getLocalizedPath('/', 'ru')}
         class={`lang-switch transition-colors ${locale === 'ru' ? 'font-semibold text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
         data-lang="ru"
       >RU</a>
     </li>
     ```
   - In the mobile menu, add a search placeholder item (just text for now, no pill styling) ABOVE the locale link:
     ```astro
     <li class="border-t border-border/50 pt-3">
       <span class="flex items-center gap-2 text-sm text-text-muted">
         <svg class="w-3.5 h-3.5" .../>
         {i.nav.search_placeholder}
       </span>
     </li>
     ```
   - Replace mobile menu locale `<li>` with the same EN · RU layout (inline, smaller).

2. **Edit `src/i18n/en.json` `nav` block — add:**
   ```json
   "search_label": "Open search",
   "search_placeholder": "Search…"
   ```

3. **Edit `src/i18n/ru.json` `nav` block — add:**
   ```json
   "search_label": "Открыть поиск",
   "search_placeholder": "Поиск…"
   ```

4. **Build verification:** `npm run build` — must produce 7 pages, no errors.

5. **Dev-server sanity:** spot-check `http://localhost:4321/en/` and `/ru/` — confirm search pill visible, EN · RU renders, active locale bold.

6. **Atomic commit:**
   ```
   Phase 1 (REQ-001): Header search pill + EN · RU switcher

   - Add ⌕ Search… ⌘K pill (desktop ≥lg, disabled — visual placeholder only)
   - Replace RU/EN border button with EN · RU dot-separator layout
   - Active locale bold, inactive dimmed-clickable
   - Mobile menu: inline search hint + EN · RU row
   - i18n: nav.search_label + nav.search_placeholder (EN/RU)
   ```

7. **Push:** `git push origin main` → GH Actions deploy ~60-90s.

8. **Update STATE.md:** bump current phase to 2 (Blog), add commit SHA under Phase 1 header in ROADMAP.md task status.

## Non-goals (explicit)

- No real search functionality. The pill is `disabled` and has no onclick. Wiring Pagefind/Algolia is a future milestone.
- No changes to logo, mobile hamburger animation, or scroll-shrink shadow behavior.
- No typography/spacing changes beyond the new pill + switcher.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Tailwind utility `text-border-strong` might not exist in `@theme` | Verify in `global.css`; fallback to `text-text-muted/50` if missing |
| `lang-switch` CSS class targets localStorage write on click — must preserve both links' handlers | Keep existing `data-lang` + `.lang-switch` class on both anchors |
| Active locale redirects to same URL (e.g. `/en/` click while on `/en/`) | Harmless; browser no-ops. Optional: `aria-current="page"` on active. |
| Search pill `disabled` button can still be focused | Add `tabindex="-1"` to remove from tab order until wired |

## Acceptance (self-check before commit)

- [ ] `npm run build` passes (7 pages)
- [ ] Dev server `/en/` shows EN bold + RU dimmed; `/ru/` shows RU bold + EN dimmed
- [ ] Search pill visible at ≥lg breakpoint (`1024px+`)
- [ ] Search pill hidden on mobile; mobile menu has a search hint
- [ ] Hover on inactive locale → turns to `text-text-primary`
- [ ] No console errors
- [ ] No changes to `src/components/*` other than `Header.astro`
