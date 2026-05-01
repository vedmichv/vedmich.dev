# Phase 7: Speaking Portfolio — Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite Speaking section to match reference `app.jsx:456-486` visual layout AND expand into a full Speaking Portfolio with Content Collection, individual talk pages, video/slides links. Data migrates from `src/data/social.ts` `speakingEvents` array to `src/content/speaking/{en,ru}/*.md` markdown files. Homepage Speaking section becomes a preview (like BlogPreview) pulling from the collection. Each talk gets its own page at `/{locale}/speaking/{slug}`.

**Scope expanded by user decision:** Original Phase 7 was visual-only (35 min). User chose to build full portfolio (est. 3-4 hours).

</domain>

<decisions>
## Implementation Decisions

### Section visual style
- **D-01:** Section background = `bg-surface` (#1E293B) per reference `app.jsx:457` (`bg={VV.surface}`)
- **D-02:** Events use left-border style (`border-l-2 border-border pl-5`) — no cards, no card-glow, no timeline dots. Grid per year: `grid-cols-[100px_1fr] gap-6`. Year in `font-display text-4xl font-bold text-brand-primary tracking-[-0.02em]` (36px teal).
- **D-03:** Preserve `animate-on-scroll` on year groups — consistent with all other site sections.

### Data model — Content Collection
- **D-04:** Speaking entries stored as Astro Content Collection in `src/content/speaking/{en,ru}/*.md`. One file per talk (not per event). Follows the same pattern as `src/content/blog/`.
- **D-05:** Collection schema registered in `src/content.config.ts` alongside blog collection.
- **D-06:** Frontmatter schema (Zod):
  ```
  title: string (required) — talk title
  event: string (required) — conference/event name
  city: string (required) — event city
  date: date (required) — event date
  tags: string[] (required) — topic tags
  video: string (optional) — YouTube URL
  slides: string (optional) — Slidev URL (s.vedmich.dev/slug/)
  rating: string (optional) — speaker rating e.g. "4.7/5.0"
  highlight: string (optional) — highlight text e.g. "Speaker rating: 4.7/5.0"
  draft: boolean (default false)
  ```
- **D-07:** Body text = talk description, key takeaways, any notes. Optional — some talks may have empty body initially.

### Pages and routing
- **D-08:** Individual talk pages at `/{locale}/speaking/{slug}` — full page with title, event, date, city, description, YouTube embed (if video field set), slides link, body text.
- **D-09:** Homepage Speaking section = preview component pulling latest/notable talks from collection, grouped by year, rendered in reference visual format (grid 100px|1fr, left-border, `→` arrows, inline city dimmed).

### Content migration
- **D-10:** Migrate existing `speakingEvents` from `src/data/social.ts` into Content Collection md files. Current data: 5 events across 3 years (2026, 2024, 2023), 6 total talks.
- **D-11:** After migration, `speakingEvents` export can be removed from `social.ts` (Speaking.astro will query collection instead).

### Reference visual fidelity (from `app.jsx:456-486`)
- **D-12:** Section title: "Speaking", subtitle: i18n `speaking.subtitle` (already exists: "30+ technical deep-dives per year. Speaker rating: 4.5–4.7 / 5.0").
- **D-13:** Event format: `Event name · City` — city in `text-text-muted font-normal`, separated by ` · `. Event name in `font-display text-lg font-semibold text-text-primary` (18px, 600).
- **D-14:** Talk lines: `→ Talk title` — arrow in `text-brand-primary`, talk text in `font-body text-sm text-text-muted` (14px). `margin-top: 6px` between talks.
- **D-15:** Highlight: `★ highlight text` — mono 12px amber (`font-mono text-xs text-warm`). Only for 2023 re:Invent.
- **D-16:** Year groups separated by `gap-8` (32px).
- **D-17:** Container: `max-w-[1120px] mx-auto` (consistent with all sections).
- **D-18:** Section padding: `py-20 sm:py-28` (consistent with all sections).

### Claude's Discretion
- Talk page layout design (heading, meta, body, video embed placement)
- YouTube embed implementation (lite-youtube-embed vs iframe with lazy loading)
- How many talks to show on homepage preview vs "View all →" link
- i18n key additions for talk page UI elements
- Slug generation from talk titles

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference UI kit
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 456-486 — Speaking section visual spec (grid layout, typography, colors, spacing)

### Existing blog collection (pattern to follow)
- `src/content.config.ts` — Blog collection schema definition (follow same pattern for speaking)
- `src/content/blog/en/` — Blog content structure (mirror for speaking)
- `src/pages/en/blog/[...slug].astro` — Blog slug routing (mirror for speaking)

### Current speaking data
- `src/data/social.ts` lines 52-100 — Current `speakingEvents` array to migrate

### Design system
- `src/styles/design-tokens.css` — All color/font tokens
- `src/styles/global.css` — Tailwind 4 @theme mappings

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content.config.ts` — Blog collection already registered; add speaking collection alongside it
- `src/pages/en/blog/[...slug].astro` — Blog slug page pattern; replicate for speaking
- `BaseLayout.astro` — HTML shell used by all pages
- `animate-on-scroll` CSS class — Available globally for fade-in animations

### Established Patterns
- Content Collections with glob loader + Zod schema (blog is the precedent)
- i18n via `t(locale)` + JSON files — all new UI strings need both en.json and ru.json
- Section components receive `locale` prop
- All sections use `max-w-[1120px] mx-auto` container since Phase 4
- Token-only colors — no hardcoded hex

### Integration Points
- `src/pages/en/index.astro` and `ru/index.astro` — Speaking component import
- `src/pages/en/speaking/[...slug].astro` — New route to create
- `src/pages/ru/speaking/[...slug].astro` — New route to create (mirror)
- Navigation in `Header.astro` — May need "Speaking" nav link update if it doesn't already scroll to #speaking

</code_context>

<specifics>
## Specific Ideas

- User wants a "speaking log" — like a blog but for talks. Show where they spoke, what about, and link to video recordings.
- The goal is to have shareable individual talk pages that can be sent to conference organizers or shared on social media.
- Video embedding is important — when a recording exists, visitors should be able to watch it directly on the page.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-speaking-portfolio*
*Context gathered: 2026-04-21*
