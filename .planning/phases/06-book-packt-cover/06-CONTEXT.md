# Phase 6: Book — PACKT cover + V. Vedmich emboss — Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite `src/components/Book.astro` so the Book section matches the reference UI kit (`app.jsx:488-519`) structurally while deviating on two user-driven points (real JPG cover asset, full-bleed amber band). Four changes land in this phase:

1. **Full-bleed amber band** wrapper — section `bg-brand-accent-soft` + `border-y border-brand-accent/30`, full browser width (not gated by `max-w-6xl` container). Inner content uses `max-w-[1120px]` container. Makes the Book section visually distinct from neighbouring sections and matches user preference "полная полоса".
2. **Real 3D cover asset retained** — keep `/images/book-cover-3d.jpg` (already a 3D render of the physical Packt book with `PACKT` and `V. Vedmich` baked in). DO NOT build a CSS faux cover. DO NOT overlay additional PACKT/V.Vedmich labels — they are already on the scan. This preserves REQ-005 "3D perspective" acceptance criterion without duplication.
3. **3-col grid layout (desktop)** — `grid-cols-[140px_1fr_auto]` with cover · text column · Amazon CTA, per ref `app.jsx:492`. Mobile (< 640px): `flex-col` stack (cover top, text middle, button bottom).
4. **Amazon rating row** — NEW addition (not in REQ-005): `★★★★★ 4.8 · Amazon` under the h3 title. 5 filled amber stars + numeric rating + source. Hardcoded `const rating = 4.8` in frontmatter. Visual social proof, analogous to Podcasts stats.

**Out of scope:**
- CSS faux cover (rejected per D-01 — real JPG retained).
- Overlaying additional PACKT / V. Vedmich text labels on the cover or alongside it — already on the JPG.
- Changing Amazon URL, cover image asset, or book title / description copy.
- Extracting a Stars primitive component (single consumer, inline markup per CLAUDE.md "No premature abstraction").
- Dynamic rating — `4.8` is hardcoded; rating source, review count wiring to Amazon API, or data-layer refactor is deferred.
- Updating REQ-005 text — "3D perspective" clause still holds because the JPG asset provides it.
- Any work beyond `src/components/Book.astro` (no token additions, no i18n text edits, no social.ts changes).

</domain>

<decisions>
## Implementation Decisions

### Cover rendering (hybrid: real JPG, no text duplication)
- **D-01:** Keep `/images/book-cover-3d.jpg` as the cover asset. Do NOT implement the CSS faux cover from `app.jsx:493-505`. Reason: the JPG is an authentic 3D render of the physical Packt book with PACKT and V. Vedmich already printed on the cover — duplicating those labels alongside would be redundant (same reasoning as Phase 5 D-01 DKT logo over text badge). Preserves REQ-005 "3D perspective" without visual noise.
- **D-02:** Slot dimensions: `width="200" height="247"` preserved (current Book.astro values), Tailwind render class `w-40 sm:w-48` preserved. `140×200` ref values apply to the CSS faux cover approach (rejected), not to the real JPG whose native aspect ratio is `200:247` (≈ Packt standard). Executor MAY switch to `w-[140px]` or `w-36` if visual verify shows the cover too large next to text column on 1440px, but current sizing is expected to match the grid cell.
- **D-03:** Existing `.book-cover` CSS (drop-shadow, hover lift, prefers-reduced-motion guard) stays as-is. Already in `src/components/Book.astro` lines 16-38. No JS added, no motion behaviour changed.

### Full-bleed amber band (NEW, not in reference)
- **D-04:** Section wrapper is full-bleed (not gated by `max-w-6xl`). Pattern:
  ```astro
  <section id="book" class="py-20 sm:py-28 bg-brand-accent-soft border-y border-brand-accent/30">
    <div class="max-w-[1120px] mx-auto px-4 sm:px-6">
      <!-- content -->
    </div>
  </section>
  ```
  `bg-brand-accent-soft` = `#451A03` (CSS token, already in design-tokens.css). `border-brand-accent/30` = `rgba(245,158,11,0.3)` arbitrary opacity. Full-bleed bg extends edge-to-edge; inner `max-w-[1120px]` holds content width consistent with Hero/other sections.
- **D-05:** Section `h2` "Book" stays `font-display text-3xl font-bold mb-12 animate-on-scroll` — matches the other sections' h2 pattern. Color inherits `text-text-primary` (visible on amber-soft bg — contrast sufficient at `#451A03` vs `#E2E8F0`).
- **D-06:** REMOVE current `bg-surface/30` from `<section>` wrapper. Replaced entirely by amber band.
- **D-07:** No noise-overlay on amber band (keep it clean — noise-overlay is Hero's signature, not a repeated pattern).

### Card structure (3-col grid desktop, stack mobile)
- **D-08:** Desktop (≥ 640px): `grid grid-cols-[140px_1fr_auto] gap-7 items-center`. Ref `app.jsx:492` uses `gridTemplateColumns: '140px 1fr auto', gap: 28, alignItems: 'center'`. `gap-7` = 28px.
- **D-09:** Mobile (< 640px): `flex flex-col items-center gap-6`. Order: cover → text → button (Amazon CTA at bottom, full-width or auto-width). Current Book.astro already does `flex flex-col sm:flex-row`. Extend to 3-col grid at `sm:`.
- **D-10:** Inner card wrapper keeps `group block p-6 sm:p-8 rounded-xl bg-bg border border-border card-glow max-w-3xl` — EXCEPT drop `max-w-3xl` so the card stretches full width of the `max-w-[1120px]` container. Addresses user's "полная полоса" request — the amber band is full-bleed, the card inside uses the full container width.

### Click interaction (preserve whole-card link)
- **D-11:** `<a href={amazonUrl} target="_blank" rel="noopener noreferrer">` wraps entire card (current behaviour, consistent with Podcasts D-10, BlogPreview, Presentations cards). Fitts's law: big click target beats small button.
- **D-12:** Amazon CTA stays a styled `<span>` (visual affordance, NOT a second `<a>` — invalid nested anchors). Current implementation is correct: `<span class="inline-flex items-center gap-2 text-sm font-medium text-accent">` + arrow icon. Keep as-is, but verify contrast on amber band.
- **D-13:** CTA visual style: match ref Button `variant="accent"` (amber bg, bg-color text). Tailwind: `inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors`. NOTE: `bg-brand-accent` on `bg-brand-accent-soft` band — amber button on amber-soft band. Contrast-wise: `#F59E0B` button vs `#451A03` band = ~11:1 contrast ratio, readable. Executor must visual-verify; fallback: `bg-bg border border-brand-accent text-brand-accent` (ghost variant) if solid amber button reads as washing out on amber band.
- **D-14:** Arrow icon stays — current inline SVG (external-link or chevron). Do not change animation pattern.

### Amazon rating row (NEW)
- **D-15:** Rating row sits **under the h3 title, before the description paragraph**. Structure:
  ```astro
  <div class="flex items-center gap-2 mt-2 mb-4" aria-label="4.8 out of 5 on Amazon">
    <span class="text-brand-accent text-base" aria-hidden="true">★★★★★</span>
    <span class="font-mono text-sm text-text-secondary">4.8</span>
    <span class="text-text-muted" aria-hidden="true">·</span>
    <span class="font-body text-sm text-text-muted">Amazon</span>
  </div>
  ```
- **D-16:** 5 filled amber stars (★★★★★, Unicode U+2605). 4.8 rounds UP to 5 visually — simpler CSS, single Unicode string, no half-star complexity. Numeric `4.8` communicates the exact value.
- **D-17:** Rating source is hardcoded in `Book.astro` frontmatter:
  ```ts
  const rating = 4.8;
  // If reviews count is sourced later (currently unknown): const reviews = null;
  ```
  Single file edit to update. No i18n, no social.ts. Data layer extraction (`src/data/social.ts → export const book = {...}`) is deferred until 2nd consumer exists.
- **D-18:** Rating row is locale-invariant — "Amazon" is a brand name (Phase 4 D-03 precedent). No i18n key added.
- **D-19:** Accessibility: `aria-label="4.8 out of 5 on Amazon"` on the container; individual `aria-hidden="true"` on the `★★★★★` string and the `·` separator to prevent screen-reader noise. The numeric `4.8` and `Amazon` text are read normally.

### Copy (i18n-neutral — no changes)
- **D-20:** `i18n.book.desc` is NOT touched. Current EN/RU descriptions match ref semantically. Preserves the spirit of "no copy changes" the user signalled with "оставить текущий".
- **D-21:** `i18n.book.cta` is NOT touched. "Get on Amazon" / "Купить на Amazon" stays.
- **D-22:** `i18n.book.title` ("Book" / "Книга") and `i18n.book.name` (full book title, EN-only) stay.

### Code organization & patterns
- **D-23:** No new Astro component file. No Stars primitive, no BookCover sub-component. Inline all markup in `Book.astro`. Matches Phase 5 D-07 rationale: single consumer in v0.4.
- **D-24:** `.card-glow` utility stays — teal hover glow on the wrapping `<a>`. Hover interaction: card gets teal ring + shadow (already working in current Book.astro).
- **D-25:** `.animate-on-scroll` utility stays on the h2 and card wrapper. IntersectionObserver entrance preserved, no JS change.

### Claude's Discretion
- Exact Tailwind class for the rating number font size — `text-sm` vs `text-base` (both valid; executor picks during visual verify).
- Exact star font size — `text-base` (16px) vs `text-lg` (18px). Depends on visual balance with `4.8` numeric. Keep them visually balanced.
- Whether the CTA button is solid amber (`bg-brand-accent`) or ghost outline (`border-brand-accent text-brand-accent`). Solid is the default per ref Button `variant="accent"`; switch to ghost if contrast reads washed out on amber-soft band during execute.
- Exact padding on card wrapper (`p-6` vs `p-8`). Ref uses 24 (`p-6`). Keep current `p-6 sm:p-8`.
- Whether `gap-7` (28px, ref exact) or `gap-6` (24px) reads better between cover and text at 1440px — ref-faithful default is `gap-7`.
- Whether the amber band gets any subtle inner texture (noise at very low opacity, or faint diagonal lines). Default: no texture — keep clean.

### Folded Todos
None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference design (source of truth)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §488-519 — `Book` component: `<Section id="book" title="Book">`, `<Card hoverable={false}>` with 3-col grid `140px | 1fr | auto`, gap 28. Faux cover (rejected per D-01), h3 22/600, body 15/mute, Button variant=accent.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §100-113 — `Section` primitive: padding 80px 24px, inner `max-w-1120` container pattern.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §131-155 — `Button` primitive: accent variant (`bg: amber, fg: bg, bd: amber`, hover: `amberHover`, padding `10px 20px`, radius 8). This informs D-13.
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §157-168 — `Card` primitive: `background: surface, border: 1px, borderRadius: 12, padding: 24`. Note: ref uses `hoverable={false}` for the Book card, we keep `.card-glow` per D-24 (user-facing hover affordance takes precedence over ref since the card is clickable).
- `reference-1440-full.png` (project root) — visual reference screenshot.

### Roadmap & Requirements
- `.planning/ROADMAP.md` §"Phase 6 — Book: PACKT cover + V. Vedmich emboss" — phase goal, 30min effort estimate, verification criterion "Book card matches reference visually".
- `.planning/REQUIREMENTS.md` §REQ-005 — Book PACKT label + V. Vedmich emboss acceptance criteria. NOTE: satisfied by the JPG asset (already has both labels printed on the 3D render) + the amber band layout. "Book cover still renders in 3D perspective" is preserved because we keep the JPG asset (rejected CSS faux cover).
- `.planning/PROJECT.md` §Constraints — no hardcoded hex, tokens only; self-hosted fonts; both locales must render.
- `.planning/STATE.md` — phase 5 complete, phase 6 next.

### Design system (tokens & patterns)
- `src/styles/design-tokens.css` §"Brand" — `--brand-accent` (#F59E0B), `--brand-accent-soft` (#451A03), `--brand-accent-hover` (#FBBF24). Used for amber band bg, border, stars, CTA button.
- `src/styles/design-tokens.css` §"Text" — `--text-primary` (#E2E8F0), `--text-secondary` (#94A3B8), `--text-muted` (#78909C). Used for title, rating number, separator.
- `src/styles/global.css` §`@theme` — Tailwind utility mapping: `bg-brand-accent-soft`, `text-brand-accent`, `border-brand-accent`, `bg-brand-accent`, etc. Both canonical and shim names valid.
- `CLAUDE.md` §"Deep Signal Design System — LIVE" §"Anti-Patterns" — never hardcoded hex, never deprecated cyan, AWS orange employer-only.
- `CLAUDE.md` §"Architecture" §"Key Design Decisions" — Zero-JS default, i18n via JSON, tokens never hex.

### Prior phase context (carry-forward decisions)
- `.planning/phases/05-podcasts-badges/05-CONTEXT.md` §D-01 — real brand asset over text badge when asset exists (same reasoning applies to JPG cover over CSS faux). §D-07 — no premature abstraction for single-use primitives (applies to Stars inline). §D-10 — whole-card `<a>` pattern + Fitts's law.
- `.planning/phases/04-hero-reference-match/04-CONTEXT.md` §D-03 — brand-name locale invariance ("Amazon", "Packt", "V. Vedmich" stay English in both locales). §D-06 — inline primitives vs extracted component.
- `.planning/phases/03-section-order-about/03-CONTEXT.md` — Book section order position (after Podcasts, before Speaking per REQ-009; order unchanged in Phase 6).

### Vault cross-reference (for future rating data layer, deferred)
- `~/Documents/ViktorVedmich/30-Projects/33-Book-Kubernetes/` — book project notes (128 files, 17 chapters). NOT read during Phase 6; noted for a future milestone if dynamic rating / review count sourcing is wired up.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`/images/book-cover-3d.jpg`** (`public/images/book-cover-3d.jpg`, 144KB) — 3D render of the physical Packt book with PACKT + V. Vedmich + title printed. Reused in D-01. Already has `loading="lazy"`, `decoding="async"`.
- **`.card-glow` utility** (`src/styles/design-tokens.css`) — teal hover ring + shadow. Reused on the whole-card `<a>` wrapper per D-24.
- **`.animate-on-scroll` utility** + IntersectionObserver — reused for entrance animation on h2 + card per D-25.
- **`.book-cover` CSS block** (`src/components/Book.astro` lines 16-38) — drop-shadow, hover lift (`translateY(-6px)`), teal glow on hover, `prefers-reduced-motion: reduce` guard. Keep as-is per D-03.
- **i18n keys** (`src/i18n/{en,ru}.json` §`book`) — `title`, `name`, `desc`, `cta` — ALL reused unchanged. No i18n edits in Phase 6.

### Established Patterns
- **Section wrapper with full-bleed bg** — not yet established in vedmich.dev; all current sections use `bg-surface/30` or transparent behind a `max-w-6xl` container. Phase 6 introduces the first full-bleed coloured band pattern. Executor should verify no horizontal-scrollbar regression at any viewport (amber band spills to `100vw`, must not exceed it).
- **Whole-card `<a>` links** (Podcasts.astro, Presentations.astro, BlogPreview.astro) — cards are clickable links. Book already follows this pattern; keep it per D-11.
- **Tailwind tokens over hex** (CLAUDE.md, Phase 5 D-04) — every color resolves to a `--brand-*` or `--text-*` token. Enforcement: `grep -E "#[0-9a-fA-F]{3,8}" src/components/Book.astro` must return nothing after execute.
- **Arbitrary opacity with `/N` syntax** (Phase 5 D-06) — `border-brand-accent/30` is valid, consumes `--brand-accent` token with 30% opacity. Precedent set in Phase 5 for amber `/40` border on Badge.
- **Mobile-first Tailwind responsive classes** — current Book.astro already uses `sm:` prefix for desktop variants; extend this pattern (no breakpoint change).

### Integration Points
- **`src/pages/{en,ru}/index.astro`** — imports `<Book locale={locale} />` between Podcasts and Speaking. No change to import or position (REQ-009 section order locked in Phase 3).
- **`src/styles/design-tokens.css`** — ALL tokens needed already exist. No new token additions in Phase 6 (unlike Phase 4 `--grad-hero-flat`). Specifically: `--brand-accent`, `--brand-accent-soft`, `--brand-accent-hover`, `--bg-base`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border` — all present.
- **No JS module additions** — Book remains Zero-JS. No observer changes, no star-rating widget (hardcoded text).
- **No new files** — single file edit: `src/components/Book.astro`.

</code_context>

<specifics>
## Specific Ideas

- **Real JPG over CSS faux cover** — user explicit: ref is a mockup without the real asset; we have `/images/book-cover-3d.jpg` with PACKT + V. Vedmich already printed. Same "brand asset over text reproduction" stance as Phase 5 DKT logo.
- **Full-bleed amber band** — user explicit: "полная полоса". First full-bleed coloured band in the site, uses amber-soft tokens so it clearly reads as "the Book section" without being distracting.
- **Amazon rating ★★★★★ 4.8** — user idea ("была идея может добавить типа аля рейтинг с амазона там сейчас 4.8"). NOT in REQ-005 originally — this is an additive visual. Hardcoded in Book.astro so it's a 1-file update when the real rating changes.
- **Mobile stack, desktop 3-col** — user picked `Stack vertically` for mobile — consistent with current Book.astro flex-col → sm:flex-row behaviour, just promoted from 2-col flex to 3-col grid on desktop.
- **Whole-card `<a>` preserved** — user picked Fitts's law click target over ref-faithful "button-only" interaction. Consistent with other sections.
- **Stars round up to 5 filled** — user picked visual simplicity (1 Unicode string) over accurate 4-filled-plus-half. Numeric `4.8` still communicates the exact rating.

</specifics>

<deferred>
## Deferred Ideas

- **Review count under rating** — adding `(~1200 reviews)` or similar to the rating line. Current Amazon listing rating is tracked at 4.8; review count changes weekly. Deferred until there's a data-layer refactor (src/data/social.ts or wired to Amazon Product API). For v0.4 — rating only, no count.
- **Stars primitive component** — `src/components/Stars.astro` accepting `value` prop and rendering half-star correctly. Deferred until a 2nd consumer exists (testimonials section? speaker ratings on Speaking.astro?). Single consumer → inline markup.
- **Dynamic rating source** — Amazon Product Advertising API, Packt bestseller rank, Goodreads rating. Requires API keys, out of static-site scope. Deferred to a post-v0.4 milestone or a serverless endpoint.
- **"Bestseller" or "Top seller" badge** — if Packt provides, a small amber pill above the title. Deferred — no signal from the user to include; keep this phase focused.
- **Half-star CSS rendering** — accurate `4.8 → 4 full + 1 at 80% fill` via `clip-path` or mask-image. Rejected for simplicity per D-16; revisit if a future consumer (testimonials) needs fractional stars.
- **Noise overlay on amber band** — explored and rejected (D-07). If the flat amber band looks too solid during verify, revisit with low-opacity noise.
- **Review link** — clicking the rating text opens Amazon's review page. Deferred — whole-card `<a>` already goes to the product page, adding a nested review link is invalid HTML (no nested anchors).
- **Publisher info in description** — user option ("17 chapters, 50+ diagrams. Packt Publishing, 2024.") rejected. Copy stays unchanged per D-20.

</deferred>

---

*Phase: 06-book-packt-cover*
*Context gathered: 2026-04-21*
</content>
</invoke>