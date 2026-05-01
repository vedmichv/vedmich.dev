# ROADMAP.md — v0.4 Reference Design Audit

**Milestone goal:** Align live vedmich.dev with the reference UI-kit (`viktor-vedmich-design` skill → `ui_kits/vedmich-dev/app.jsx`, 687 lines) pixel-by-pixel across all homepage sections. Ship visually complete site even where content is placeholder.

**Reference source of truth:** `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` — full React source with tokens, components, data. Also `ref-content.json` and `reference-1440-full.png`.

**Execution model:** Sequential — one phase at a time, atomic commit, push main, visual verify on live via playwright-cli attached to user's Chrome.

**Phase numbering NOTE:** Phase 1 (Header visual shell) already shipped (`71e38e9`). Phases below continue from Phase 2. **Reordered 2026-04-19: Hero promoted to Phase 4** after visual audit during Phase 3 flagged major Hero drift vs reference (user explicit request).

---

## Phase 2 — Search palette (⌘K modal with fuzzy search) ✅

**Status:** Complete (commits `965eac9`, `6f0fb7b`, `e8361e4`, `4bc642b`, 2026-04-19)
**Requirements:** REQ-001 (upgraded — search must be functional, not placeholder)
**Files:** `src/components/SearchPalette.astro`, `src/components/Header.astro`, `src/data/search-index.ts`, `src/i18n/{en,ru}.json`
**Verification:** Press ⌘K → modal opens, type "karp" → 2 results, Enter opens URL, Esc closes.

---

## Phase 3 — Section order + About: match reference ✅

**Status:** Complete (commits `f21655f`, `381e0d9`, `95e7478`, 2026-04-19). Header tokens also fixed in-scope.
**Requirements:** REQ-008 (upgraded), NEW REQ-009 (section order), NEW REQ-010 (Book before Speaking)
**Files:** `src/pages/en/index.astro`, `src/pages/ru/index.astro`, `src/components/Header.astro`, `src/components/About.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Verification:** Sections in reference order; About layout byte-match tokens; Header pixel-match tokens.

---

## Phase 4 — Hero: match reference pixel-for-pixel ✅

**Requirements:** NEW REQ-011, NEW REQ-013 (Hero typography), NEW REQ-014 (Hero height)
**Files:** `src/components/Hero.astro`, `src/i18n/en.json`, `src/i18n/ru.json`
**Context:** Promoted to Phase 4 during Phase 3 visual audit (2026-04-19). User flagged massive height mismatch and typography drift vs reference. Was originally scheduled as Phase 11 (cosmetic gradient polish) — new scope is a full component rewrite.

**Findings from Phase 3 audit (`app.jsx:357-391`):**

| # | Element | Reference | Current (Hero.astro) | Action |
|---|---|---|---|---|
| 1 | Section height | `padding: '96px 24px 64px'`, content-height | `min-h-[90vh] flex items-center` → stretches to ~810px, centers content | **Remove `min-h-[90vh]` + `flex items-center`**, use `pt-24 pb-16 px-6` (96/64/24) |
| 2 | Container | `maxWidth: 1120` | `max-w-6xl` (1152) + `max-w-3xl` inner | `max-w-[1120px]`, drop inner `max-w-3xl` |
| 3 | Background | flat `linear-gradient(160deg,#0F172A,#134E4A)` | `var(--grad-hero-soft)` (multi-layer radial blobs) | Replace with flat gradient to match reference exactly |
| 4 | Terminal greeting | ONE line mono teal 14px `~/vedmich.dev $ whoami` + separate `Hi, I'm` mono mute 16px (separate block) | Current: `~/vedmich.dev $` + `whoami` in one flex block + `Hi, I'm` at text-sm | Single-line terminal prompt at 14px; separate `Hi, I'm` at 16px mono mute below |
| 5 | Greeting size | 16px | `text-sm` (14px) | `text-base` |
| 6 | **h1 size** | **64px** | `text-4xl sm:text-5xl lg:text-6xl` (36→48→60) | `text-[64px]` — no responsive shrinking (reference stays 64 on all viewports) |
| 7 | h1 weight | 700 | `font-bold` (700) ✓ | keep |
| 8 | h1 letter-spacing | **-0.03em** | `tracking-tight` (-0.025em) | `tracking-[-0.03em]` |
| 9 | h1 line-height | **1.05** | default (~1.1) | `leading-[1.05]` |
| 10 | h1 color | 1/1 | Complete    | 2026-05-01 |
| 11 | Role ("Senior SA @ AWS") | 2/2 | Complete    | 2026-05-01 |
| 12 | Tagline | 1/1 | Complete   | 2026-05-01 |
| 13 | Cert pills gap | `gap: 10, marginTop: 28` | `gap-2 mb-10` (8px gap, 40 mb) | `gap-2.5 mt-7` |
| 14 | CTA margin-top | 32 | `gap-3` (12 gap) | `mt-8` |
| 15 | Cursor | inline `_` char, teal, blinking opacity | `<span class="typing-cursor text-brand-primary-hover">` (CSS pseudo `|`) | keep current — visually equivalent |

**Typography cross-check (computed styles from Phase 3 audit):**
- About.astro tokens ✓ all match (Space Grotesk 28/600, Inter 18/1.7, pills Inter 13/500 on #1E293B, overline Inter 11/600 #94A3B8).
- Header.astro tokens ✓ all match after 03-03 expansion (logo 32px rounded-[7px], nav Inter 14/500 text-secondary, search bg-base rounded-[7px] with mono ⌕).
- **Only Hero.astro remained drift as of 2026-04-19.**

**Change plan:**
1. Remove `min-h-[90vh] flex items-center pt-16` from `<section>` wrapper.
2. Switch wrapper to `pt-24 pb-16 px-6` (96/64/24 reference padding).
3. Change background from `.hero-deep-signal` (which uses `--grad-hero-soft` complex blobs) to flat `linear-gradient(160deg, var(--bg-base), var(--brand-primary-soft))` — matches reference exactly. Keep noise overlay.
4. Inner container: `max-w-6xl` → `max-w-[1120px]`, drop the nested `max-w-3xl` wrapper (reference has single column at full container width).
5. Greeting structure:
   - Line 1 (terminal): `<div class="font-mono text-brand-primary text-sm mb-4">~/vedmich.dev $ whoami</div>` — mono teal 14px.
   - Line 2 (Hi): `<div class="font-mono text-text-secondary text-base mb-1">Hi, I'm</div>` — mono mute 16px.
6. `h1`: `font-display text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-text-primary m-0`. No responsive shrinking.
7. Role: `<div class="font-mono text-warm text-lg mt-3">` — amber 18px mono, margin-top 12px (reference `marginTop: 12`).
8. Tagline: Split `hero.tagline` i18n key:
   - `hero.tagline_prefix: "Distributed Systems · Kubernetes · "`
   - `hero.tagline_emphasis: "AI Engineer"`
   - Render: `<p class="font-body text-lg text-text-secondary max-w-[640px] mt-4">{i.hero.tagline_prefix}<span class="text-text-primary">{i.hero.tagline_emphasis}</span></p>` (mt-4 ≈ 18px).
9. Cert pills wrapper: `flex flex-wrap gap-2.5 mt-7` (28px from role, 10px gap).
10. CTA wrapper: `flex flex-wrap items-center gap-3 mt-8` (32px from pills).

**Plans:** 3 plans across 2 waves

Plans:
- [x] 04-01-i18n-kubestronaut-PLAN.md — Wave 1: 3-key hero.tagline split in both locales + Kubernaut→Kubestronaut fix in about.bio_before (bilingual).
- [x] 04-02-hero-rewrite-PLAN.md — Wave 2 (depends 04-01): Add --grad-hero-flat token + full Hero.astro rewrite (4-pill authority strip, clamp h1, inline _ cursor, flat gradient) + remove .typing-cursor from global.css + build gate.
- [x] 04-03-rename-observer-gate-PLAN.md — Wave 2 (depends 04-02): Kubestronaut rename in social.ts/BaseLayout/CLAUDE.md + Header.astro nav-active observer + scroll-margin-top global + inline REQ-011/013/014 into REQUIREMENTS.md + user visual checkpoint for REQ-013/014 acceptance.

**Est. effort:** 45 min (grew from Phase 11's original 15 min based on audit depth).

**Verification:**
- Computed styles of h1 match reference: 64px/700/-0.03em/1.05.
- Hero total height on 1440×900 viewport is ~520px (not 810px like before).
- `linear-gradient(160deg,#0F172A,#134E4A)` applied as flat background (no radial blobs).
- Tagline has "AI Engineer" visually distinct (text-primary emphasis).
- Role text is mono amber, 18px (not 20-24).
- Terminal greeting is ONE line, not two blocks.
- `npm run build` exits 0.
- No hardcoded hex in Hero.astro.
- Side-by-side against `reference-1440-full.png` — Hero section is pixel-equivalent.

---

## Phase 5 — Podcasts: DKT teal + AWS RU amber badges

**Requirements:** REQ-004
**Files:** `src/components/Podcasts.astro`
**Change:** Rewrite Podcasts.astro to match reference `app.jsx:423-453`: vertical stack per card (badge/logo → h3 → desc → stats → Listen footer); DKT card keeps existing PNG logo with white chrome (D-01 — brand asset over 3-letter text badge); AWS RU card replaces music-note SVG with inline `AWS RU` amber text badge per `Badge` primitive `app.jsx:125-129`; stats become mono muted without color tint (D-08); whole-card anchor preserved.
**Est. effort:** 20 min
**Plans:** 1 plan
**Verification:** DKT logo in badge slot, AWS RU amber badge, no music-note icon, both locales render identically.

Plans:
- [x] 05-01-podcasts-rewrite-PLAN.md — Wave 1: Full rewrite of `src/components/Podcasts.astro` to two explicit card blocks (DKT logo + AWS RU amber text badge), vertical stack, mono muted stats + token/hex hygiene + build gate.

---

## Phase 6 — Book: PACKT cover + V. Vedmich emboss

**Requirements:** REQ-005
**Files:** `src/components/Book.astro`
**Change:** Rewrite Book.astro per reference `app.jsx:488-519` with user-locked deviations from `06-CONTEXT.md`: (1) retain real `/images/book-cover-3d.jpg` 3D render which already has PACKT + V. Vedmich baked in (D-01 — real brand asset over CSS faux cover, same stance as Phase 5 DKT logo); (2) first full-bleed amber band in the site — section `bg-brand-accent-soft border-y border-brand-accent/30` with inner `max-w-[1120px] mx-auto` container (D-04); (3) promote current 2-col flex to 3-col desktop grid `grid-cols-[140px_1fr_auto] gap-7 items-center` with mobile `flex flex-col gap-6` stack (D-08, D-09); (4) add Amazon rating row under h3 — `★★★★★ 4.8 · Amazon`, hardcoded `const rating = 4.8`, full ARIA annotations (D-15, D-17, D-19); (5) solid amber CTA `bg-brand-accent text-bg-base hover:bg-brand-accent-hover px-5 py-2.5 rounded-lg` per ref Button variant=accent (D-13); drop `max-w-3xl` (D-10), drop `bg-surface/30` (D-06). Preserve existing `.book-cover` CSS block (D-03), whole-card anchor (D-11), arrow SVG (D-14), `.card-glow` + `.animate-on-scroll` (D-24, D-25). No i18n edits, no CSS faux cover, no extra PACKT/V.Vedmich HTML labels, no new tokens, no `social.ts` changes.
**Est. effort:** 30 min
**Plans:** 1 plan
**Verification:** Book card matches reference visually — full-bleed amber band edge-to-edge, 3-col desktop grid / mobile stack, rating row renders 5 amber stars + 4.8 + Amazon label, solid amber CTA contrast verified, both locales identical structurally, `npm run build` passes, no horizontal-scroll regression at 1440px or 375px.

Plans:
- [x] 06-01-book-rewrite-PLAN.md ✓ (commit `97c6e89`, 2026-04-21, 7 min 9 sec) — Full rewrite of `src/components/Book.astro` to full-bleed amber band section wrapper, 3-col desktop grid with mobile stack, JPG cover retained, NEW Amazon rating row with hardcoded 4.8 + 5 stars + ARIA, solid amber CTA per D-13 + token/hex hygiene + build gate. All 13 verification checks passed; `npm run build` green (7 pages, 837ms); DOM shape verified in both `dist/en/index.html` and `dist/ru/index.html`.

---

## Phase 7 — Speaking: timeline + arrows + inline city ✅

**Status:** Complete (2026-04-21, 3 plans across 2 waves, ~7 min total execution)
**Requirements:** REQ-003
**Files:** Content Collection migration + component rewrite + 4 new pages
**Change:** Full speaking portfolio with Content Collection — migrate 7 talks from `social.ts` to markdown files, create individual talk pages at `/{locale}/speaking/{slug}`, rewrite Speaking.astro to query collection with reference grid layout (`app.jsx:456-486`), add full portfolio index pages. Layout: year `100px | events 1fr` grid, year in display-36 teal, events as left-border blocks with `Event · City` (city muted) and talks prefixed with `→` arrow. YouTube embeds on individual pages. Remove speakingEvents from social.ts after migration.
**Est. effort:** 3-4 hours (expanded from original 35 min — now includes full portfolio architecture)
**Plans:** 3 plans across 2 waves
**Verification:** 10/10 must-haves passed. 23 pages built (834ms). Individual talk pages render, homepage grid layout matches reference, speakingEvents removed, no hardcoded hex.

Plans:
- [x] 07-01-PLAN.md ✓ (commits `8096e60`, `8048466`, `071ae22`, 2026-04-21, 2 min 47 sec) — Wave 1: Register speaking collection in content.config.ts with Zod schema (10 fields per D-06), add 4 i18n keys per locale (back_link, watch_video, view_slides, all_talks), install @astro-community/astro-embed-youtube package v0.5.10. All verifications passed; `npm run build` green (7 pages, 769ms).
- [x] 07-02-PLAN.md ✓ (commits `92ab775`, `0c27d99`, 2026-04-21, 1 min 23 sec) — Wave 1 (parallel): Created 14 markdown files (7 EN + 7 RU) from speakingEvents data, frontmatter per schema, minimal body text, matching slugs, 2023 re:Invent has highlight field. Found 7 talks (not 6 as planned). video/slides fields omitted (will add when URLs available). `npm run build` green (7 pages, 814ms).
- [x] 07-03-PLAN.md ✓ (commits `2ea5cae`, `82ed3b9`, `d2b856c`, `259b948`, `f457667`, 2026-04-21, 2 min 41 sec) — Wave 2: Created 4 pages (EN/RU slug + EN/RU index), rewritten Speaking.astro with reference grid layout (100px|1fr, border-l, → arrows, inline city muted), speakingEvents removed from social.ts. Build generates 16 new speaking pages (7 talks × 2 locales + 2 index). `npm run build` green (23 pages, 836ms).

---

## Phase 8 — Presentations: match card format + portfolio migration ✅

**Status:** Complete (2026-04-24, 3 plans across 2 waves, commits `895ef22`, `e2c62a6`, `757ed8e`)
**Verification:** 10/10 must-haves passed (`.planning/phases/08-presentations-match-card-format/08-VERIFICATION.md`). 3 items routed to human visual-verify-on-push per CLAUDE.md convention.

**Requirements:** NEW REQ-010 (presentations polish)
**Goal:** Rewrite homepage Presentations section to match reference `app.jsx:522-551` visual format AND migrate `presentations` data from `src/data/social.ts` to an Astro Content Collection (mirror Phase 7 Speaking pattern). Add new full portfolio index pages at `/{locale}/presentations`. Extract reusable `<PresentationCard>` component. Update `search-index.ts` to query the collection. Keep decks as external links to `s.vedmich.dev/{slug}/` (individual deck pages deferred to future Unified Slides milestone v0.5).
**Files:** `src/content.config.ts` (schema), `src/content/presentations/{en,ru}/*.md` (12 new files), `src/components/PresentationCard.astro` (new), `src/components/Presentations.astro` (rewrite), `src/pages/{en,ru}/presentations/index.astro` (2 new), `src/data/search-index.ts` (update), `src/data/social.ts` (remove presentations export), `src/i18n/{en,ru}.json` (subtitle {N} interpolation + back_to_home key)
**Change:** Per `app.jsx:522-551`. 3-col grid, each card: mono date+event overline, display-18 title, body excerpt, mono teal SOLID slug URL (no /80 alpha), teal tag badges (Badge primitive alpha style per D-01). Container `max-w-[1120px]`, section `bg-surface` (zebra-rhythm D-17). Card padding `p-6` (24px D-21), grid gap `gap-5` (20px D-20). "All decks →" header link stays inline (consistency with Speaking Phase 7 per D-04) but target changes from external `s.vedmich.dev` to internal `/{locale}/presentations` index page (D-05). Subtitle interpolates total deck count via `{N}` placeholder (D-13). Whole-card anchor preserved (D-23). All 28 UI decisions locked in `08-CONTEXT.md`, visual contract approved in `08-UI-SPEC.md` (commits `c83f38f`, `f683eb5`).
**Est. effort:** 3-4 hours (expanded from original 25 min — now includes Content Collection migration mirroring Phase 7 Speaking pattern)
**Plans:** 3 plans across 2 waves
**Verification:** 5-row card structure per card (overline/title/description/slug/tags), teal tag badges with visible alpha on bg-surface (fallback to `bg-brand-primary/10` if `/30` on soft token renders too dark), internal "All decks →" link, 2 new index pages generated (total 25 pages), subtitle interpolates total count, no hardcoded hex colors, both locales render identically.

Plans:
- [x] 08-01-PLAN.md ✓ (commit `895ef22`, 2026-04-24) — Wave 1: Registered presentations collection in `content.config.ts` with 9-field Zod schema (`city: z.string().nullable()`, `description` required, `tags` required array). Updated both i18n files with `{N}` placeholder in `presentations.subtitle` and new top-level `back_to_home` key. `npm run build` green (23 pages, 1.00s).
- [x] 08-02-PLAN.md ✓ (commit `e2c62a6`, 2026-04-24) — Wave 1 (sequential): Created 12 markdown files (6 EN + 6 RU). RU translates `title` + `description` only. 3 files per locale have `city: null` (slurm-prompt-engineering, slurm-ai-demo, dkt-workflow). Slides URLs populated with trailing slash. `video` field omitted per Phase 7 Plan 2 convention. `npm run build` green (23 pages, 966ms — content files don't add routes).
- [x] 08-03-PLAN.md ✓ (commit `757ed8e`, 2026-04-24) — Wave 2: Created `PresentationCard.astro` (5-row structure, teal tag Badge with Tailwind 4 alpha compiled via color-mix). Rewrote `Presentations.astro` to query collection, slice top 6, render via `<PresentationCard>`, container `max-w-[1120px]`, `bg-surface`, internal "All decks →" link, subtitle count interpolation. Created EN + RU `/presentations/` index pages with back-link. Migrated `search-index.ts` to collection query (dropped dead `locale_urls` + `as any`). Removed `presentations` export from `social.ts`. `npm run build` green (25 pages, 893ms); zero hardcoded hex in Phase 8 files.

---

## Phase 9 — Blog: 3 posts with correct card format ✅

**Status:** Complete (2026-04-26, 3 plans across 3 waves, commits `4736ce6`, `b6f6000`, `103b7e6`, `51864e1`, `21dcb1a`)
**Requirements:** REQ-002
**Goal:** Ship the blog card format matching reference `app.jsx:553-574` AND author 3 vault-grounded posts (EN + RU) using a new reusable project-local skill. Three sequential waves in one phase: (1) UI — extract `<BlogCard>`, rewrite `BlogPreview`, unify `/blog/` index + slug pages, tighten schema, wire reading-time remark plugin; (2) Skill — create `.claude/skills/vv-blog-from-vault/` that delegates to `mermaid-pro`/`excalidraw`/`art`/`viktor-vedmich-design`/`recall`/`episodic-memory`, hard-excludes confidential vault paths, and drives the CLAUDE.md publish flow; (3) Content — use the skill to write karpenter/mcp/manifests posts × 2 locales = 6 markdown files + copy 4 karpenter carousel PNGs to `public/blog-assets/`.
**Files:**
- Wave 1: `src/components/BlogCard.astro` (new), `src/components/BlogPreview.astro` (rewrite), `src/pages/{en,ru}/blog/index.astro` (rewrite), `src/pages/{en,ru}/blog/[...slug].astro` (update), `src/content.config.ts` (tighten + 3 new fields), `src/data/search-index.ts` (cleanup), `src/i18n/{en,ru}.json` (add `blog.min_read`), `astro.config.mjs` (remark plugin), `remark-reading-time.mjs` (new), `package.json` (reading-time + mdast-util-to-string dev deps)
- Wave 2: `.claude/skills/vv-blog-from-vault/SKILL.md` + `scripts/{vault-search.py,session-recall.py,deploy-post.sh}` + `references/{voice-guide,translation-rules,frontmatter-schema,visuals-routing,companion-sources}.md` + `workflows/{new-post,update-post}.md`
- Wave 3: `src/content/blog/{en,ru}/2026-03-20-karpenter-right-sizing.md` + `src/content/blog/{en,ru}/2026-03-02-mcp-servers-plainly-explained.md` + `src/content/blog/{en,ru}/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` + `public/blog-assets/2026-03-20-karpenter-right-sizing/*.png` (4 carousel PNGs)
**Change:**
- BlogCard matches ref `app.jsx:553-574` — 4-row structure (mono date overline / display title / body excerpt / teal tag badges), mirrors `PresentationCard.astro` minus row 4 (slug URL). Section transparent (D-15) so `bg-bg-base` shows through. Container `max-w-[1120px]`, grid `gap-5`, `p-6` card padding per Phase 8 conventions.
- Slug page gains `{author} · {N} {min_read_label}` byline, mono-xs short-month date (RU strips trailing "г."), `text-4xl sm:text-5xl tracking-[-0.02em]` h1, teal tag badges.
- Schema tightens `tags` to required + adds `author` (default "Viktor Vedmich") / `reading_time` (remark-computed) / `cover_image` (optional, schema-ready).
- Skill delegates rather than duplicates: mermaid-pro / excalidraw / art / viktor-vedmich-design / recall / episodic-memory MCP. Vault search enforces `10-AWS/11-Active-Clients/`, `14-Tips-AWS-Internal/`, `16-Amazon-Employer/` hard exclusion.
- 3 posts per D-06 word counts: karpenter 1500-2500 (reuses 4 carousel PNGs), mcp 800-1200 (cites upcoming DOP202 Warsaw chalk talk), manifests 700-1000 (standalone opinion, recall-grounded).
- Commit convention: Wave 1/2 use `docs|feat(09-XX):` with Co-Authored-By trailer; Wave 3 content commits use `Post: <title>` plain per CLAUDE.md.
**Est. effort:** 6-8 hours (expanded from original 90 min — added reusable skill track + deeper schema work)
**Plans:** 3 plans across 3 sequential waves (waves are sequential — Wave 3 consumes Wave 2 skill, Wave 2 targets Wave 1 schema)
**Verification:** BlogCard renders 4-row layout; homepage shows 3 newest cards (Karpenter + hello-world + MCP by date desc); `/blog/` index shows all 4 posts in 3-col grid; slug pages render byline + teal tags + larger h1; 3 posts ship as `Post:` commits; ROADMAP Phase 9 marked complete; `npm run build` exits 0 with 6 new dist pages.

Plans:
- [x] 09-01-PLAN.md ✓ (commits `687a73f`, `ba682a4`, `4736ce6`, 2026-04-26, 4m 51s) — Wave 1: UI — BlogCard extraction + BlogPreview rewrite + /blog/ index rewrite + slug page updates (byline + teal tags + Cyrillic author render in RU) + schema tighten + reading-time remark plugin + `blog.min_read` i18n key
- [x] 09-02-PLAN.md ✓ (commits `1b99881`, `ea83879`, `b5cca7a`, `b6f6000`, 2026-04-26, ~35m) — Wave 2 (depends 09-01): Skill — `.claude/skills/vv-blog-from-vault/` with SKILL.md + 3 scripts + 5 references + 2 workflows; delegates to `mermaid-pro`/`excalidraw`/`art`/`viktor-vedmich-design`/`recall`/`episodic-memory` and enforces confidential vault exclusion
- [x] 09-03-PLAN.md ✓ (commits `103b7e6`, `51864e1`, `21dcb1a`, 2026-04-26) — Wave 3 (depends 09-02): Content — 3 posts × 2 locales (Karpenter 1316w EN/1191w RU + MCP 1214w EN/1076w RU + manifests 966w EN/872w RU), reused 4 karpenter carousel PNGs per D-39, 3 `Post:` commits (NO Co-Authored-By per CLAUDE.md) + 1 `docs(09):` ROADMAP-close commit, NOT PUSHED per user preference

---

## Phase 10 — Contact: letter badges + working form

**Goal:** Rewrite `src/components/Contact.astro` to match reference `app.jsx:577-632` — 5-col grid of letter badges (L / G / Y / 𝕏 / T) above a primary teal "Write me a message" CTA that expands in place into a Name / Email / Message form. Form builds a `mailto:viktor@vedmich.dev?subject=…&body=…` URL and hands off to the user's mail client. After submit, the Card swaps to an honest success state (`✓ Check your email client` — NOT `✓ Message sent` because we cannot truthfully claim delivery via mailto). All 37 decisions locked in `10-CONTEXT.md` (mailto backend D-01…D-04, instant state swap D-05…D-08, HTML5-only validation D-09…D-12, honest success copy D-13…D-17, letter-grid visuals D-18…D-22, form Card visuals D-23…D-28, i18n keys D-29…D-30, vanilla-TS island D-31…D-34, noscript fallback D-35, remove SVG sprite D-36, `social.ts` untouched D-37 per Footer dependency).

**Requirements:** REQ-006 (upgraded — form must be functional, not CTA)
**Files:** `src/components/Contact.astro` (full rewrite), `src/i18n/en.json` (+11 keys), `src/i18n/ru.json` (+11 keys mirror)
**Change:** Single atomic rewrite. Letter badges use canonical Deep Signal tokens (`bg-bg-base`, `border-border`, `text-brand-primary`, `card-glow`). CTA + Send reuse Book's Phase 6 primary button shape swapped amber→teal. Form Card is `bg-bg-surface` non-hoverable; inputs `bg-bg-base` + `focus-visible:ring-brand-primary/40`. Success panel teal ✓ glyph (not `--success` emerald — ref is explicit). Island is ~60 lines vanilla TS mirroring SearchPalette null-guarded IIFE, state machine via `data-state` attribute on section root, ESC scoped to section (D-34 — avoids SearchPalette global ESC conflict). `<noscript>` fallback exposes plain `mailto:viktor@vedmich.dev` anchor for JS-off visitors. `src/data/social.ts` is untouched — Footer.astro still destructures `icon` field (D-37 resolution per 10-PATTERNS.md §4).

**Security (T-10-01 HIGH):** mailto URL injection via CRLF in user fields. Mitigated via `encodeURIComponent()` on every interpolated value — verified by grep gate (`encodeURIComponent` must appear ≥ 3× in Contact.astro).

**Pre-flight (D-03, user responsibility):** MX for `vedmich.dev` must be configured and `viktor@vedmich.dev` must receive mail. Phase 10 cannot close on live until this is verified — test by sending a mail to the address from an external account.

**Est. effort:** 45 min
**Plans:** 1/1 plans complete

Plans:
- [x] 10-01-PLAN.md — Wave 1: Rewrite Contact.astro wholesale (letter grid + inline-expand form + success state + vanilla-TS island with scoped ESC + noscript fallback) + add 11 new `contact.*` i18n keys in both `en.json` and `ru.json` (bilingual atomic edit) + T-10-01 encodeURIComponent mitigation + token/hex hygiene + build gate.

**Verification:** 5 letter badges render with 𝕏 literal Unicode, CTA → form → success state cycle works with Cancel/ESC/Close all returning to CTA, mailto URL properly URL-encoded, success copy honest ("Check your email client"), both locales render identically, `<noscript>` mailto anchor present for JS-off path, zero hex literals in Contact.astro, zero deprecated cyan, `npm run build` exits 0.

---

## Phase 11 — Logo + favicon refresh

**Goal:** Adopt canonical Deep Signal brand assets as browser-surface icons — swap Header `<img>` from `/favicon.svg` to an optimised `/vv-logo-hero.png` (64×64, ≤10 KB, rendered 32×32 via CSS) with a11y `alt="Viktor Vedmich"`; regenerate multi-size `favicon.ico` (16/32/48) from Deep Signal SVG; add full icon coverage (apple-touch-icon 180×180 + android-chrome 192/512 + `site.webmanifest` with theme_color `#14B8A6` + background_color `#0F172A`); expand BaseLayout `<head>` to 5-tag icon+manifest+theme-color block; copy 3 canonical SVGs (`vv-favicon`, `vv-logo-primary`, `vv-logo-inverse`) from skill assets into `public/`; mirror all new derivatives to `.design-handoff/deep-signal-design-system/project/assets/` with hero renamed to `vv-logo-hero-64.png` so the 1.87 MB canonical stays intact. Generation via committed, re-runnable `scripts/generate-icons.mjs` (sharp + png-to-ico). All 13 decisions locked in `11-CONTEXT.md`.

**Requirements:** REQ-007
**Files:**
- Wave 1 (tooling + assets): `package.json` + `package-lock.json` (sharp + png-to-ico devDeps); `scripts/generate-icons.mjs` (new); `public/vv-favicon.svg` / `public/vv-logo-primary.svg` / `public/vv-logo-inverse.svg` (new, canonical SVG copies); `public/vv-logo-hero.png` (new, 64×64 optimised); `public/favicon.ico` (regenerated multi-size); `public/apple-touch-icon.png` (new); `public/android-chrome-192x192.png` (new); `public/android-chrome-512x512.png` (new); `public/site.webmanifest` (new); 6 mirror copies in `.design-handoff/deep-signal-design-system/project/assets/` (hero renamed `vv-logo-hero-64.png`).
- Wave 2 (component wiring): `src/components/Header.astro:39` (swap `<img>`); `src/layouts/BaseLayout.astro:35` (expand to 5-tag icon+manifest+theme-color block).

**Change:**
- `scripts/generate-icons.mjs` — ESM one-shot (`node scripts/generate-icons.mjs`), enforces 10 KB hero PNG budget, renders 16/32/48 PNGs for favicon.ico packaging, renders 180/192/512 platform rasters from `vv-favicon.svg`, writes webmanifest with `theme_color: "#14B8A6"` and `background_color: "#0F172A"` (hex literals allowed per D-06 — JSON/meta can't reference CSS vars, REQ-007 tracks exception), and mirrors 6 derivatives into `.design-handoff/` (hero renamed to preserve 1.87 MB canonical).
- Header markup: `alt="Viktor Vedmich"` (user a11y-first over reference's `alt="VV"` per D-02); keep `rounded-[7px]` + `w-8 h-8` (reference parity); add `loading="eager" decoding="sync"` (above-the-fold).
- BaseLayout block: `<!-- Icons + PWA manifest -->` header + SVG icon link + multi-size ICO fallback + apple-touch-icon link + manifest link + theme-color meta (4-space indent, sibling style mirrors fonts-preload block).
- No i18n changes (D-11: asset-name leakage check `grep "favicon\|vv-logo" src/i18n/*.json` must stay at 0).
- Cache invalidation (D-12): filename bypass — new `/vv-logo-hero.png` path replaces `/favicon.svg` in Header; legacy `.ico` overwritten in place; manifest via fresh URL.

**Est. effort:** 20–30 min (2 plans, 2 waves)
**Plans:** 2/2 plans complete

Plans:
- [x] 11-01-PLAN.md — Wave 1: devDeps (sharp + png-to-ico) + `scripts/generate-icons.mjs` ESM pipeline + 3 canonical SVG copies to `public/` (md5 gated) + 64×64 optimised hero PNG (≤10 KB budget) + multi-size favicon.ico (16/32/48) + apple-touch-icon (180×180) + android-chrome (192×192 + 512×512) + `site.webmanifest` (D-05 verbatim) + mirror 6 derivatives to `.design-handoff/` (hero renamed `vv-logo-hero-64.png` to preserve 1.87 MB canonical).
- [x] 11-02-PLAN.md — Wave 2 (depends 11-01): Swap `Header.astro:39` to `/vv-logo-hero.png` + `alt="Viktor Vedmich"` + `loading="eager" decoding="sync"` (D-02); expand `BaseLayout.astro:35` to 5-line icon+manifest+theme-color block with 4-space indent + `<!-- Icons + PWA manifest -->` comment (D-06); phase-level gates (build 7 pages + i18n invariant 0 matches + no deprecated cyan hex + EN/RU dist markup symmetry).

**Verification:** `public/` has 11 new/copied assets; `.design-handoff/` has 6 mirror entries + 1.87 MB canonical unchanged (1,957,873 B); Header renders `/vv-logo-hero.png` with `alt="Viktor Vedmich"`; BaseLayout has full icon block + `theme-color #14B8A6` meta; `npm run build` exits 0 with 7 pages; EN + RU dist HTML render new markup symmetrically; zero deprecated cyan (`#06B6D4` / `#22D3EE`) introduced; `grep "favicon\|vv-logo" src/i18n/*.json` returns 0 matches; `scripts/generate-icons.mjs` is idempotent (re-running produces md5-identical outputs).

---

## Phase 12 — Footer match

**Requirements:** NEW REQ-012
**Files:** `src/components/Footer.astro`
**Change:** Per `app.jsx:640-648`. Simple two-column flex: `© {year} Viktor Vedmich` left, `Built with Astro` right. 32px padding, top border. 5 social-icon SVGs + `socialLinks` import deleted (contacts live in Contact section via Phase 10). Container aligned to canonical v0.4 `max-w-[1120px]`. Solid `border-border` + `text-[13px]` + dynamic `new Date().getFullYear()` + bilingual i18n preserved (`footer.copyright` + `footer.built_with`). Target: ~14 LOC (from 43). Closes v0.4-reference-audit milestone.
**Est. effort:** 10 min
**Plans:** 1/1 plans complete

Plans:
- [x] 12-01-PLAN.md — Wave 1: Full rewrite of `src/components/Footer.astro` to reference target shape (delete 5 SVG blocks + `socialLinks` import + nested flex wrapper; swap `max-w-6xl` → `max-w-[1120px]`; drop `bg-surface/30` + border `/50` alpha; bump `text-sm` → `text-[13px]`; two sibling spans in `flex items-center justify-between`) + token/hex hygiene + build gate (7 pages) + EN/RU dist symmetry check.

---

## Milestone-level done criteria

- [ ] Phases 2-12 merged to main with atomic commits
- [x] Phase 2 complete
- [x] Phase 3 complete
- [x] Phase 4 complete
- [x] Phase 5 complete
- [x] Phase 6 complete (Plan 1 implementation done, awaiting user visual verify + push to main)
- [x] Phase 7 complete (3 plans, commits `8096e60`→`f457667`, 2026-04-21)
- [x] Phase 8 complete (3 plans, commits `895ef22`→`757ed8e`, 2026-04-24)
- [ ] Phases 9-12 remaining — **next: Phase 9 (Blog) — 3 plans across 3 waves, see plan list above**
- [ ] Live vedmich.dev visually matches `app.jsx` rendering of reference UI kit
- [ ] Both /en/ and /ru/ render without regression at 1440px + 375px
- [ ] ⌘K search works on live
- [ ] Contact form opens on live
- [ ] `npm run build` = 7 pages, passes
- [ ] MEMORY updated with completion
