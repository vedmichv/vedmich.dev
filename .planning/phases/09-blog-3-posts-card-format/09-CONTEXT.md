# Phase 9: Blog — 3 posts with correct card format — Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite `BlogPreview.astro` to match reference `app.jsx:553-574` visual format, unify `/blog/` index and slug pages with that format, add 3 blog posts (EN + RU, 6 files total) required by REQ-002, **and** build a project-local skill `vv-blog-from-vault` that automates the vault→blog-post workflow (QMD + recall + session-sync integration + draft generation + visuals-routing + verify+push).

Phase 9 is a three-track gate in one phase:
1. **UI track** — card format + BlogCard component + index/slug unification
2. **Skill track** — create `.claude/skills/vv-blog-from-vault/` as reusable pipeline
3. **Content track** — use the skill to write the 3 required posts (Karpenter, MCP, manifests-by-hand) in both locales

**Scope expanded by user decision during discuss:** Original Phase 9 scope (3 posts + card rewrite, 90 min) grew to include a reusable skill for future blog authoring (estimated 6-8 hours total) — same pattern as Phase 7 Speaking / Phase 8 Presentations expansions. Rationale: the skill makes future post production (post-v0.4) much faster and grounds voice in real vault content + session history.

**NOT in this phase:**
- CSS/SVG animations inside posts (deferred — may need first real pattern before generalizing)
- Obsidian → blog auto-sync daemon (deferred to later — skill is manual-trigger)
- Pagination on `/blog/` index (deferred — post count still tiny)
- Cover images generation at scale (skill emits prompts; no batch image generation job)
- RSS feed (deferred — listed in CLAUDE.md TODO)

</domain>

<decisions>
## Implementation Decisions

### Track split — 3 waves, single phase
- **D-01:** Phase 9 is a single phase with 3 sequential waves, NOT split across phases. User chose "hybrid: skill inside Phase 9".
  - **Wave 1:** Card format — extract `<BlogCard>`, rewrite BlogPreview, unify `/blog/` index + slug pages, tighten collection schema. Pure UI work, no content.
  - **Wave 2:** Create `.claude/skills/vv-blog-from-vault/` — SKILL.md + scripts + references. Pure infrastructure.
  - **Wave 3:** Use the skill to write 3 posts × 2 locales = 6 markdown files. Content work grounded in vault/session-history.
- **D-02:** Waves are sequential because Wave 3 consumes the Wave 2 skill, and Wave 1 defines the schema + card that Wave 3 targets. No parallelization inside Phase 9.

### Content sourcing (Wave 3)
- **D-03:** Combination approach per user: vault analysis + skills history + reusable skill (Wave 2). Do NOT write posts from general knowledge — always ground in vault sources and/or past Claude Code sessions.
- **D-04:** Confirmed vault sources per post:
  - **karpenter-right-sizing** — Primary: `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/` (7 HTML slides: cover / setup / 3 traps — speed, race, churn / 4-step rollout / CTA). Stats to use: **1,000+ Salesforce clusters**, **70% cost cut vs Cluster Autoscaler**, **<60s provisioning**. Supporting: `30-Projects/31-Work-AWS-DA-Role/31.80 AWS-Other-Resources/Innovate Karpenter.md`, `40-Content/44-Speaking/44.20-Talk-Materials/DOP202-Warsaw-Summit-Speaker-Notes.md`.
  - **mcp-servers-plainly-explained** — Primary: `40-Content/44-Speaking/44.10-CFPs/15.31-Talks-Materials/2026-05-06-Warsaw-Summit-MCP-Chalk-Talk.md`. Supporting: `30-Projects/37-AI-DevOps-course/37.10-AI-DevOps-Level-1/37.14-Claude-Code/Lesson-2-MCP-Protocol.md`, `70-PKM/77-Connections/2026/aws-documentation-mcp-vs-knowledge-mcp-server-2026-04.md`, `70-PKM/73-KB-Tech/73.20-AI/73.23-cc-claude-code/+Claude Code.md`.
  - **why-i-write-kubernetes-manifests-by-hand** — Opinion piece. Primary: session history via `recall` + `episodic-memory` + `20-Calendar/25-diary/25.70-Claude-Summaries/*.md` scan on K8s-related work (2026-04-12 through 2026-04-26 diary files exist). No dedicated vault note — the opinion emerges from session reflection. Supporting: `33-Book-Kubernetes/` chapters on manifests/GitOps (if found by QMD).
- **D-05:** Exclude confidential AWS sources explicitly (per CLAUDE.md and PROJECT.md anti-patterns): NEVER read `10-AWS/11-Active-Clients/`, `14-Tips-AWS-Internal/`, or `16-Amazon-Employer/`. Skill must enforce this exclusion in vault search.

### Blog post structure — per-topic calibration
- **D-06:** Per-topic length and structure — user said "на усмотрение по теме":
  - **Karpenter:** ~1500-2500 words (long-form). 3 trap sections (from carousel slides 03-05) + 4-step rollout section (slide 06) + stats lede. Deep-dive with numbers, code snippets, and a mermaid diagram for consolidation flow.
  - **MCP:** ~800-1200 words (medium). "Plainly explained" title locks the register — explain without jargon, use a simple architecture diagram (client ↔ server), 3-4 concrete examples (AWS Knowledge vs Documentation MCP).
  - **Manifests-by-hand:** ~700-1000 words (opinion piece). Punchy lede → 3-4 reasons with nuance → acknowledge when you'd use helm/kustomize anyway → close with a practical heuristic.
- **D-07:** Structure template per REQ-002 (300-600) is a floor, not a ceiling — user explicitly opted for per-topic calibration.

### Companion linking (talk/carousel cross-promotion)
- **D-08:** Posts can stand alone OR link to companion artifacts (LinkedIn carousels, upcoming talks). Both modes supported per user:
  - Karpenter post **will** link to the LinkedIn carousel once it ships (`40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/`).
  - MCP post **will** reference the Warsaw Summit 2026-05-06 chalk talk as "expanded version on stage at AWS Summit Warsaw".
  - Manifests post stands alone.
- **D-09:** Companion link placement: end-of-post section ("Related"), NOT in intro. Avoids cluttering the lede and keeps readers anchored first.
- **D-10:** Skill (Wave 2) includes a `companion-link-check` step: scans vault for known companions to the topic (carousels in `45.20-Brand-Kit/carousel-templates/`, talks in `44-Speaking/44.20-Talk-Materials/`) and suggests inclusion.

### Card format (Wave 1) — match ref `app.jsx:553-574`
- **D-11:** Card structure mirrors Phase 8 `<PresentationCard>` 1:1 — 4-row layout:
  1. **Overline (mono date):** `font-mono text-xs text-text-muted mb-2` → formatted date (e.g., `Mar 20, 2026` EN / `20 марта 2026` RU via `toLocaleDateString`).
  2. **Title:** `font-display text-lg font-semibold leading-snug mt-0 text-text-primary group-hover:text-brand-primary transition-colors`.
  3. **Description:** `font-body text-sm text-text-secondary my-2.5 leading-relaxed flex-1`.
  4. **Tags:** `flex flex-wrap gap-1.5` with teal Badge style D-12.
  (No slug URL row — that's presentation-specific. Blog cards have 4 rows, not 5.)
- **D-12:** Tag badges use the same teal Badge treatment as Phase 8 D-01:
  - `bg-brand-primary-soft/30 border border-brand-primary/40 text-brand-primary`
  - `font-mono text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded`
- **D-13:** Card container: `group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll` — matches PresentationCard. `p-6` (24px) matches ref, up from current `p-5` (20).
- **D-14:** Whole-card `<a>` anchor wraps everything — site-wide convention (Podcasts, Book, Presentations).

### Section background + zebra rhythm
- **D-15:** BlogPreview section wrapper: **transparent** (inherits `bg-bg-base` from page), cards are `bg-surface`. Matches ref `app.jsx:553-574` (Blog Section has no `bg={VV.surface}` prop). Preserves zebra: Podcasts(surface) → Speaking(surface) → Book(amber band) → Presentations(surface) → Blog(transparent/base) → Contact(surface). Current `bg-surface/30` on the section is dropped.
- **D-16:** Section container: `max-w-[1120px] mx-auto px-6` — matches all other sections post-Phase 4. Drop current `max-w-6xl` (1152).
- **D-17:** Section padding: `py-20 sm:py-28` — consistent with all sections.
- **D-18:** Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` — 3-col on desktop, `gap-5` (20px) matches ref.
- **D-19:** "All posts →" header link (right-aligned): `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`, target `/{locale}/blog`. Matches Phase 7/8 header link pattern (inline, NOT ghost Button footer). Pattern consistency wins over ref byte-match.

### Component extraction
- **D-20:** Extract `src/components/BlogCard.astro` with typed `CollectionEntry<'blog'>` props — mirrors Phase 8 `<PresentationCard>` approach. Used in 3 places:
  - `BlogPreview.astro` (homepage section, slice top 3)
  - `src/pages/{en,ru}/blog/index.astro` (full list, flat date-desc)
  - Potentially future "related posts" block on slug pages (schema-compatible, not shipped in Phase 9).

### Index page unification (Wave 1)
- **D-21:** `src/pages/{en,ru}/blog/index.astro` rewritten to use `<BlogCard>` grid instead of the current list layout. Same 3-col grid as homepage preview, no `.slice(0, 3)`. Container `max-w-[1120px]`. Back-link not needed on index page (no deeper path).
- **D-22:** Page uses the same `bg-bg-base` (transparent section) as homepage.

### Slug page updates (Wave 1)
- **D-23:** Slug page (`src/pages/{en,ru}/blog/[...slug].astro`) keeps its prose layout and header, BUT three visual updates to align with new card format:
  - **Date overline:** Change from `text-sm text-text-muted mb-2` to `font-mono text-xs text-text-muted mb-2` — mono per ref card overline.
  - **Typography h1:** Upgrade from `font-display text-3xl sm:text-4xl font-bold` to `font-display text-4xl sm:text-5xl font-bold tracking-[-0.02em]` — display-40/-48 with tighter tracking, blog post heading as "hero" of its page.
  - **Tag badges:** Same teal Badge style as cards (D-12) — replace current `bg-surface text-text-muted` muted pills. Note: uses `bg-brand-primary-soft/30` which is the card-context-consistent token (slug page body is `bg-bg-base`, cards look fine at that alpha).
- **D-24:** Back-link, prose styling, and Content component unchanged. `max-w-3xl` container preserved (readability).

### Reading time + author (additive schema)
- **D-25:** Blog collection schema extended (additive, non-breaking):
  ```ts
  title: z.string() (unchanged, required)
  description: z.string() (unchanged, required)
  date: z.coerce.date() (unchanged, required)
  tags: z.array(z.string()) (CHANGED: required, was optional) — matches speaking/presentations
  draft: z.boolean().default(false) (unchanged)
  // NEW:
  author: z.string().default('Viktor Vedmich')
  reading_time: z.number().optional() (minutes; computed at build if absent)
  cover_image: z.string().optional() (public/blog-assets/{slug}/cover.png relative path)
  ```
- **D-26:** Existing `hello-world.md` (EN + RU) currently has `tags: ["personal", "announcement"]` — already satisfies new required tags constraint. No migration pain.
- **D-27:** `reading_time` computation: if frontmatter omitted, compute at build time as `Math.ceil(wordCount / 200)`. Word count via splitting body on whitespace. Implement as an Astro-level helper in `src/i18n/utils.ts` or a new `src/lib/reading-time.ts`.
- **D-28:** Slug-page header adds `By {author} · {reading_time} min read` (EN) / `{author} · {reading_time} мин чтения` (RU) below the date overline.

### RU translation strategy
- **D-29:** Full RU body translation per user — 3 EN + 3 RU markdown files with full prose, NOT the presentations "translate-frontmatter-only" pattern. Blog prose is meant to be read; body-in-EN-with-RU-frontmatter would be a broken UX.
- **D-30:** Translation rules (follow hello-world.md precedent):
  - Tech terms stay in English: `Karpenter`, `NodePool`, `Kubernetes`, `MCP server`, `Cluster Autoscaler`, flag names, `YAML`, etc.
  - Concepts translated: "cluster" → "кластер" only in natural RU phrasing, but compound terms like "Karpenter cluster" stay EN-ish.
  - Code blocks identical in both locales.
  - Quotes from upstream (carousel, talk) may remain in English if the source is English — mark with "*(original English)*" note where needed.
- **D-31:** Voice: tech-expert from first person ("I've seen this fail in production" / "На клиентах я видел…") — matches AWS SA experience-grounded voice per user. Specifically NOT punchy-opinionated-for-its-own-sake and NOT neutral tutorial-style.

### Skill `vv-blog-from-vault` (Wave 2)
- **D-32:** Skill location: **project-local** at `.claude/skills/vv-blog-from-vault/` per user. Committed with the repo, tight to vedmich.dev design tokens and conventions. Not global (other projects wouldn't reuse it — blog post style is too brand-specific).
- **D-33:** Skill structure (inspired by `sync-claude-sessions`, `vv-carousel`):
  ```
  .claude/skills/vv-blog-from-vault/
  ├── SKILL.md                    # Main entry: triggers, overview, routing
  ├── scripts/
  │   ├── vault-search.py         # QMD/grep wrapper, exclude confidential paths
  │   ├── session-recall.py       # recall + episodic-memory wrapper for topic
  │   ├── reading-time.ts         # Word count + minutes helper (shared with site build)
  │   └── deploy-post.sh          # npm run build + playwright screenshot + git commit + push
  ├── references/
  │   ├── voice-guide.md          # "Tech-expert from first person" voice rules (D-31)
  │   ├── translation-rules.md    # EN→RU rules (D-30)
  │   ├── frontmatter-schema.md   # Full schema with examples
  │   ├── visuals-routing.md      # Decision tree: flowchart→mermaid-pro, sketch→excalidraw, illustration→art, brand→viktor-vedmich-design, image-prompt-for-nanobanana/GPTImage
  │   └── companion-sources.md    # Map: vault paths with carousels, talks, podcast episodes
  └── workflows/
      ├── new-post.md             # Step-by-step: topic → vault search → recall → draft → translate → visuals → review → publish
      └── update-post.md          # Edit existing post workflow
  ```
- **D-34:** Skill capabilities (per user multi-select):
  - **Vault search + extract sources:** QMD search, read top N files, respect confidential exclusions.
  - **Session-history recall:** Wrap `recall` skill + `episodic-memory:search-conversations` for topic. Pull from `20-Calendar/25-diary/25.70-Claude-Summaries/*.md`.
  - **Draft generation EN + RU:** With frontmatter per D-25 schema, voice per D-31, translation rules per D-30.
  - **Companion link management:** Scan vault for carousels/talks/podcast episodes on topic, suggest end-of-post "Related" section (D-08/D-09/D-10).
  - **Visuals routing + image-prompt generation:** Analyze draft for "this needs a diagram/illustration" patterns, route to appropriate skill (`mermaid-pro`, `excalidraw`, `art`, `viktor-vedmich-design`) OR generate a ready-to-paste prompt for NanoBanana/GPTImage image generation tools.
  - **Verify + push:** Skill workflow ends with `deploy-post.sh` — `npm run build` → playwright screenshot localhost → `git commit -m "Post: {title}"` (NO Co-Authored-By per CLAUDE.md publishing rule) → `git push origin main` → `gh run list --branch main --limit 3` to report deploy status.
- **D-35:** Skill triggers (in SKILL.md description):
  - User says: "write a blog post", "create post about X", "новый пост", "новая статья"
  - User says: "publish post", "deploy post"
  - User says: "blog from vault", "post from talk", "post from carousel"
- **D-36:** Skill **delegates to other skills** rather than duplicating their logic:
  - `mermaid-pro` for diagrams (not inline mermaid generation)
  - `excalidraw` for sketches/flowcharts
  - `art` for AI image generation with an optimized prompt
  - `viktor-vedmich-design` for brand-consistent visuals
  - `recall` + `episodic-memory` for session history
  - Respects the CLAUDE.md instruction hierarchy: user instructions > skills > system defaults.

### Visuals integration (Wave 2 skill + Wave 3 posts)
- **D-37:** The skill includes a `visuals-audit` phase after draft generation. Heuristics for "this section would benefit from a visual":
  - Mentions "flow" / "sequence" / "pipeline" → offer mermaid flowchart or sequence diagram
  - Mentions 3+ enumerated components/steps → offer mermaid flowchart or step grid
  - Mentions "architecture" → offer mermaid C4 OR route to existing vault architecture diagrams in `44-Speaking/44.20-Talk-Materials/`
  - Mentions physical metaphor / UI screenshot → offer `art` skill with a generated prompt
  - Opinion/emotion sections → probably no visual needed
- **D-38:** Asset storage: `public/blog-assets/{slug}/` for images, inline `<img>` in markdown body. Mermaid blocks stay as fenced code blocks (Astro handles rendering or ships an integration — verify during Wave 1 or Wave 2).
- **D-39:** Reuse opportunities FIRST (user explicit priority):
  - `karpenter-1000-clusters/` already has 7 rendered slides — reuse 2-3 as inline images in the Karpenter post (e.g., trap illustrations, rollout step grid) instead of regenerating.
  - Warsaw MCP talk may have architecture diagram assets in `44-Speaking/44.20-Talk-Materials/`.
  - Only generate NEW visuals when nothing suitable exists in vault/presentations.
- **D-40:** Animations IN blog posts (CSS/SVG): enabled by user but deferred to first real need. Zero-JS site principle preserves: only CSS transitions / SVG `<animate>` allowed, never JS libs. If a post calls for one, the skill can generate a minimal CSS-animated snippet inline. Not a blocker for the 3 REQ-002 posts.

### i18n
- **D-41:** No new top-level i18n keys required in Wave 1 — `i.blog.title`, `i.blog.all_posts`, `i.back_to_home` already exist. Wave 3 posts have their i18n inside each markdown file (title/description in EN file vs RU file).
- **D-42:** New slug-page keys: `blog.by_author` (EN: "By", RU: "Автор:" or blank) and `blog.min_read` (EN: "min read", RU: "мин чтения"). Add in Wave 1 since slug page updates are in Wave 1.

### Publishing flow (CLAUDE.md authority)
- **D-43:** Skill follows CLAUDE.md § "Publishing Workflow → Adding a new blog post":
  1. Commit message template: `Post: <title>` (no Co-Authored-By for content commits per CLAUDE.md — that's different from code commits).
  2. Push straight to `main`, no PR, auto-deploys in ~2 min via GH Actions.
  3. Verify live at `/{locale}/blog/<slug>` after deploy.
- **D-44:** Image assets in `public/blog-assets/{slug}/` are committed with the post markdown in the same commit — atomic.

### Claude's Discretion
- Exact prose wording of the 3 posts (Wave 3) — skill drafts, user reviews on live after push
- mermaid diagram content for karpenter post — pick one illustrative flow (e.g., "Node consolidation loop" or "3 traps progression")
- Whether to use the carousel's rendered PNG slides as inline images in karpenter post or generate fresh mermaid alternatives (preference: reuse per D-39)
- SKILL.md description text and trigger phrases wording
- Script languages for skill (Python, Bash, Node) — prefer Python for consistency with `sync-claude-sessions` and most other skills
- Whether `reading_time` is a Zod `.optional()` field that's computed-if-absent, or `.default(null)` with build-time fill — planner decides
- Tag list for each post — start from REQ-002 (Karpenter: kubernetes/aws/karpenter; MCP: ai/mcp/agents; Manifests: kubernetes/opinion) and refine during Wave 3 if skill suggests better tags based on vault content

### Deferred inside Phase 9 (noted but not blocking)
- See `<deferred>` section below.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference UI kit (ground truth for visual contract)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L553-574 — Blog section + card
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L125-129 — Badge primitive (tag badges)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L157-168 — Card primitive
- `reference-1440-full.png` — full homepage screenshot

### Phase 7 Speaking — template for Content Collection patterns
- `.planning/phases/07-speaking-portfolio/07-CONTEXT.md` — collection migration decisions
- `.planning/phases/07-speaking-portfolio/07-01-PLAN.md` — schema registration pattern
- `.planning/phases/07-speaking-portfolio/07-03-PLAN.md` — page creation pattern
- `src/content/speaking/{en,ru}/*.md` — frontmatter + body structure template

### Phase 8 Presentations — template for Card component + index page
- `.planning/phases/08-presentations-match-card-format/08-CONTEXT.md` — Card component decisions (D-01 tag badges, D-16 BlogCard extraction pattern)
- `src/components/PresentationCard.astro` — exact component pattern to mirror (adapt from 5-row to 4-row, drop slug URL, adapt frontmatter fields)
- `src/components/Presentations.astro` — homepage preview wrapper pattern
- `src/pages/{en,ru}/presentations/index.astro` — index page pattern

### Blog-specific current state (what's being rewritten)
- `src/components/BlogPreview.astro` — 75 lines, current implementation
- `src/pages/{en,ru}/blog/index.astro` — 55 lines, current index
- `src/pages/{en,ru}/blog/[...slug].astro` — 60 lines, current slug page
- `src/content.config.ts` §L4-13 — blog schema (extending in Wave 1)
- `src/content/blog/{en,ru}/hello-world.md` — existing post (migration-compat check for new required tags)
- `src/i18n/en.json` §L68-72, `src/i18n/ru.json` §L68-72 — blog i18n (adding 2 new keys)

### Vault sources for 3 posts (Wave 3)
- **Karpenter post:**
  - `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/index.html` — 7-slide carousel structure + stats
  - `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/c01-cover.html` through `c07-cta.html` — individual slide content
  - `~/Documents/ViktorVedmich/30-Projects/31-Work-AWS-DA-Role/31.80 AWS-Other-Resources/Innovate Karpenter.md`
  - `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.20-Talk-Materials/DOP202-Warsaw-Summit-Speaker-Notes.md`
- **MCP post:**
  - `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.10-CFPs/15.31-Talks-Materials/2026-05-06-Warsaw-Summit-MCP-Chalk-Talk.md`
  - `~/Documents/ViktorVedmich/30-Projects/37-AI-DevOps-course/37.10-AI-DevOps-Level-1/37.14-Claude-Code/Lesson-2-MCP-Protocol.md`
  - `~/Documents/ViktorVedmich/70-PKM/77-Connections/2026/aws-documentation-mcp-vs-knowledge-mcp-server-2026-04.md`
  - `~/Documents/ViktorVedmich/70-PKM/73-KB-Tech/73.20-AI/73.23-cc-claude-code/+Claude Code.md`
- **Manifests-by-hand post:**
  - Session history via `recall` skill + `episodic-memory:search-conversations`
  - `~/Documents/ViktorVedmich/20-Calendar/25-diary/25.70-Claude-Summaries/2026-04-{12,13,15,16,17,18,19,20,21,22,23,24,26}.md` — diary scan
  - No dedicated vault note — opinion emerges from session reflection

### Skill-building references (Wave 2)
- `~/.claude/skills/sync-claude-sessions/SKILL.md` + `scripts/claude-sessions` + `workflows/` — skill structure template
- `~/.claude/skills/vv-carousel/SKILL.md` + `references/` — VV-brand skill structure template
- `~/.claude/skills/recall/SKILL.md` + `workflows/temporal.md` + `workflows/topic.md` — session recall wrapper
- `~/.claude/skills/mermaid-pro/` — delegate-to-skill pattern
- `~/.claude/skills/excalidraw/` — delegate-to-skill pattern
- `~/.claude/skills/art/` — delegate-to-skill pattern
- `~/.claude/skills/viktor-vedmich-design/` — brand token consumer pattern

### Project-level
- `CLAUDE.md` — Publishing workflow §§ "Adding a new blog post", Deep Signal tokens, confidential vault anti-patterns, self-hosted fonts, zero-JS principle, GSD language rules
- `.planning/PROJECT.md` — v0.4 milestone, Obsidian cross-references, validated decisions
- `.planning/REQUIREMENTS.md` §L33-53 — REQ-002 (3 posts, slugs, dates, tags)
- `.planning/ROADMAP.md` §L166-175 — Phase 9 scope (note: ROADMAP's estimate of 90 min will grow to 6-8h after this discuss expands scope — roadmap update expected during planning)
- `src/styles/design-tokens.css` — canonical color/spacing tokens
- `src/styles/global.css` — Tailwind 4 @theme block

### Skill ecosystem to delegate to (Wave 2 references)
- `mermaid-pro` — diagrams (flowcharts, sequence, architecture)
- `excalidraw` — whiteboard-style sketches
- `art` — AI image generation (optimized prompts for NanoBanana/GPTImage)
- `viktor-vedmich-design` — brand-consistent visuals
- `recall` — session temporal/topic mode
- `episodic-memory:search-conversations` — semantic search across all Claude Code conversations
- `sync-claude-sessions` — Claude session export to vault (source of session history)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/components/PresentationCard.astro`** — exact 5-row pattern to adapt (drop slug URL row → 4 rows). Typography, Badge classes, `card-glow`, `animate-on-scroll`, whole-card `<a>` anchor all directly transferable.
- **`src/components/Presentations.astro`** — homepage preview wrapper; adapt `getCollection('presentations', ...)` → `getCollection('blog', ...)` + `.slice(0, 3)`.
- **`src/pages/{en,ru}/presentations/index.astro`** — flat grid layout template.
- **`src/content.config.ts`** — already defines blog schema; extend with `author`/`reading_time`/`cover_image` and tighten tags.
- **`src/i18n/utils.ts`** — `t(locale)` helper; extend with reading-time or keep separate helper.
- **`src/components/Book.astro`**, **`src/components/Speaking.astro`** — `animate-on-scroll` + `card-glow` proven patterns.

### Established Patterns
- Content Collection per locale: `src/content/{collection}/{locale}/*.md` — blog, speaking, presentations all follow this.
- Frontmatter bilingual for user-facing strings (title, description), shared for technical (date, tags, slug).
- No hardcoded hex in components.
- All sections use `max-w-[1120px] mx-auto` since Phase 4.
- Whole-card anchor preferred (Podcasts, Book, Presentations).
- Skill ecosystem at `~/.claude/skills/` and project-local `./.claude/skills/` — both discoverable.

### Integration Points
- **Astro Content Collections:** `src/content.config.ts` schema — build-time validation, no runtime.
- **Search index:** `src/data/search-index.ts` already indexes blog via `getCollection('blog', ...)` — schema extension is additive, no search-index changes needed.
- **i18n JSON files:** both locales edited in same commit (CLAUDE.md bilingual constraint).
- **GH Actions deploy:** auto on push to main, ~60-90s deploy.
- **Routes already exist:** `/{locale}/blog/`, `/{locale}/blog/[slug]` — Wave 1 is rewrite, not new routes.

### Creative options the existing architecture enables
- **Reading-time build helper:** Extract into `src/lib/reading-time.ts`, reuse in skill (`scripts/reading-time.ts` symlink or duplicate).
- **`<BlogCard>` recycled for "related posts"** — Phase 9 delivers the component; future phase can add related-by-tag block to slug pages without touching card code.
- **Skill generates markdown files directly into `src/content/blog/{en,ru}/`** — no intermediate staging, respects CLAUDE.md publishing velocity.
- **mermaid in blog posts** — Astro supports via `@astrojs/mdx` or a Shiki code-fence transformer; verify current setup or add integration.

### Constraints from existing architecture
- **Bilingual constraint:** every text change in both `en.json` and `ru.json` in same commit.
- **Tailwind 4 `@theme` alpha quirks:** Phase 8 already validated `bg-brand-primary-soft/30` works — safe to reuse.
- **Zero-JS default:** animations in posts must be CSS/SVG only, not JS libs. Skill enforces this.
- **Confidential vault exclusions:** skill must hard-exclude `10-AWS/11-Active-Clients/`, `14-Tips-AWS-Internal/`, `16-Amazon-Employer/` from any vault scan.
- **MDX vs MD:** current blog is `.md` (Shiki code highlighting via Astro). If mermaid requires MDX, migration is a bigger ask — verify during Wave 1.

</code_context>

<specifics>
## Specific Ideas

- **Follow Phase 8 Presentations as the template** — user confirmed card format decisions by selecting "Recommended" across D-11/D-12/D-13/D-14/D-15. Planner should read `08-03-PLAN.md` as the card+component+index pattern and `07-01-PLAN.md` as the schema registration pattern.
- **Karpenter post leans heavily on the existing carousel** — do NOT regenerate those 3 trap illustrations; reuse them. User's principle from Phase 5 (DKT logo over text badge): real brand assets win over regenerated ones.
- **MCP post is "plainly explained"** — register-match the title. No "behold the glory of stdio transport" — keep it mundane and useful. Best resource for ground truth is Viktor's own Warsaw chalk talk notes.
- **Manifests post is the risky one** — no vault source, opinion-only. Skill's `recall` integration is the most important for this post. If session history can't produce enough real experience grounding, flag this post for user input before drafting (via AskUserQuestion in skill workflow).
- **Skill description wording matters** — per CLAUDE.md skill discovery mechanism, description triggers matter. Include Russian triggers: "новая статья", "новый пост", "статья из vault", "пост из доклада".
- **Publishing = push to main** — CLAUDE.md explicitly marks blog posts as "small changes → push straight to main, no PR". Skill respects this. `deploy-post.sh` does `git push origin main`.
- **No Co-Authored-By on content commits** — CLAUDE.md publishing workflow example uses `git commit -m "Post: <title>"` plain, unlike code commits which include the Co-Authored-By trailer.
- **Reuse carousel slide pngs** — `45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/out/c01-cover.png` through `c07-cta.png` — 1080×1350 PNG. Can inline at reduced width in the Karpenter post as visual breaks between sections. Copy to `public/blog-assets/2026-03-20-karpenter-right-sizing/*.png`.

</specifics>

<deferred>
## Deferred Ideas

Ideas surfaced during discussion but not inside Phase 9 scope.

### RSS feed (`@astrojs/rss`)
Phase 9 adds 3 posts → pipeline for syndication is useful. Defer to own phase (Phase 9.1 or next milestone). CLAUDE.md lists this in TODOs already.

### Obsidian → blog auto-sync daemon
The `vv-blog-from-vault` skill is manual-trigger. A file-watch daemon that auto-proposes new posts when a vault note matches trigger heuristics is a separate scope. Already in CLAUDE.md TODOs.

### Tag filter / tag archive pages
`/{locale}/blog/tag/{tag}/` routes with filtered blog list. Collection supports it trivially (tag array queryable). Not in Phase 9. Same as Phase 8 deferred tag filter for presentations.

### Pagination on `/blog/` index
Current post count (1 hello-world + 3 in Phase 9 = 4) is tiny. Pagination unnecessary until count > 15-20.

### Reading progress indicator / TOC
Slug-page UX niceties. Defer.

### Cross-post / multi-site syndication
Syndicate posts to Dev.to, Medium, LinkedIn via API. Separate concern, separate skill (probably extension of `vv-carousel`-like ecosystem).

### Post cover image at card level
Card currently has no image. Ref `app.jsx:553-574` has no image either. If future redesign adds cover thumbnails, the `cover_image` schema field is already there to receive it.

### Animations in posts (CSS/SVG)
User enabled the idea but kept it "for the first real need". Not a blocker for the 3 REQ-002 posts. Skill will propose when a section benefits, but won't auto-generate on first Phase 9 execution.

### MDX migration
If a post genuinely needs mermaid rendering inline and Astro markdown doesn't support it out of the box, evaluate `@astrojs/mdx`. Phase 9 scope: verify current Astro markdown mermaid support; defer migration unless required for a specific post.

### Skill extraction to global `~/.claude/skills/vv-blog/`
If a second site needs the same pipeline, extract. Current: project-local only.

### Companion auto-update
When a new carousel lands in `45.20-Brand-Kit/carousel-templates/`, skill scans existing posts and suggests backfilling "Related" links. Cool but deferred.

</deferred>

---

*Phase: 09-blog-3-posts-card-format*
*Context gathered: 2026-04-26*
