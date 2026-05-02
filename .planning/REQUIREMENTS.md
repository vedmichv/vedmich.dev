# REQUIREMENTS — Milestone v1.0 Content Platform

**Milestone:** v1.0 — Content Platform
**Started:** 2026-05-02
**Source:** `.planning/PROJECT.md` (Current Milestone) + `.planning/research/*` + kickoff discussion with user
**Numbering:** continues from v0.4 last REQ-014; v1.0 starts at REQ-015

---

## Goal

Turn vedmich.dev from "static site with a handful of posts" into a full content platform: three content streams (blog, presentations, podcast/talk companion posts) under one domain, Slidev decks served as first-party sub-routes under `vedmich.dev/slides/<slug>/`, reusable rich-media primitives that cut Slidev-slide lift from ~30 min to < 10 min, Excalidraw diagrams embedded as inline SVGs, and an overall UI polish pass.

---

## v1.0 Requirements

### Rich-Media Primitives

- [ ] **PRIMS-01**: Ship a `VvStage` Astro component that establishes the 1800×820 SVG viewBox and handles responsive aspect-ratio sizing for inline diagrams.
- [ ] **PRIMS-02**: Ship a `VvNode` Astro component that renders a positioned node (x/y props) with an icon slot + label slot, using Deep Signal tokens only.
- [ ] **PRIMS-03**: Ship a `VvWire` Astro component that renders a connecting line between two nodes with optional `dashed` and fade-in animation-delay props.
- [ ] **PRIMS-04**: Ship a `VvPacket` Astro component that animates a circle along a path via SMIL `<animateMotion>`, respects `prefers-reduced-motion`, and caps concurrent packets to avoid layout thrashing.
- [ ] **PRIMS-05**: Refactor `src/components/PodLifecycleAnimation.astro` to use the new primitives and visually match the pre-refactor animation on `/blog/karpenter-right-sizing` — this validates the "< 10 min per slide" exit criterion.
- [ ] **PRIMS-06**: Author a `src/components/visuals/README.md` that documents the primitive API (props, examples, SMIL-vs-CSS-offset-path gotcha, reduced-motion rules) so future slide ports reuse primitives instead of reinventing them.

### Code Block Upgrades

- [ ] **CODE-01**: Render a language badge (top-right pill) on every prose code block, showing the fence language (`yaml`, `bash`, `ts`, etc.) in JetBrains Mono small-caps.
- [ ] **CODE-02**: Support `// [!code highlight]` line-highlight comments via `@shikijs/transformers`, validated against bash, yaml, and typescript (all three must highlight — Shiki silently skips unsupported languages).
- [ ] **CODE-03**: Support `// [!code ++]` / `// [!code --]` diff-add/remove line styling via `@shikijs/transformers`.
- [ ] **CODE-04**: Apply a Deep Signal-matched Shiki dark theme using CSS variables (`--text-primary`, `--bg-code`, `--brand-primary`, `--brand-accent`) instead of a named-theme JSON — must survive Shiki version bumps without breaking.
- [ ] **CODE-05**: Preserve the existing `CodeCopyEnhancer.astro` copy button behavior across all 4 existing blog posts (no regressions on copy UX after Shiki upgrade).

### Excalidraw Pipeline

- [ ] **DIAG-01**: Ship `scripts/excalidraw-to-svg.mjs` that converts `.excalidraw.json → .svg` via `@aldinokemal2104/excalidraw-to-svg` (build-time, zero runtime JS).
- [ ] **DIAG-02**: Integrate SVGO into the same pipeline so emitted diagrams are ≤ 10 KB each — prevents LCP regression per PITFALLS.md.
- [ ] **DIAG-03**: Establish the `public/blog-assets/<slug>/diagrams/*.svg` convention for committed diagrams, with `title`+`desc` a11y elements injected during export.
- [ ] **DIAG-04**: Replace the ASCII client-↔-server diagram in the existing MCP blog post with an Excalidraw SVG rendered via the new pipeline (both `en/` and `ru/` locales).
- [ ] **DIAG-05**: Add 2-3 additional Excalidraw diagrams to existing blog posts (karpenter / manifests / TBD-third) to stress-test the pipeline on real content.

### Slidev Integration

- [ ] **SLIDES-01**: Add `vedmichv/slidev` as a git submodule at `slidev/` and extend `.github/workflows/deploy.yml` to build every deck with `slidev build --base /slides/<slug>/` and copy the output into `dist/slides/<slug>/` before `actions/deploy-pages@v4`.
- [ ] **SLIDES-02**: Merge the Slidev build + Astro build into a single GH Actions job to avoid the `actions/deploy-pages` race-condition pitfall (two workflows targeting the same GH Pages lease).
- [ ] **SLIDES-03**: Migrate all 6 existing decks from `s.vedmich.dev` to `vedmich.dev/slides/<slug>/` — each deck must resolve assets correctly under the sub-path (curl check, not just preview).
- [ ] **SLIDES-04**: Update every `src/data/social.ts` `presentations[].slug` entry + any in-content links so PresentationCard points at `/slides/<slug>/`, not `s.vedmich.dev/<slug>/`.
- [ ] **SLIDES-05**: Configure the `s.vedmich.dev` CNAME to serve a 301 redirect to `vedmich.dev/slides/<slug>/` — preserves external backlinks during the transition.
- [ ] **SLIDES-06**: Author a `docs/slides-onboarding.md` runbook covering "how to add a new deck": submodule update, `social.ts` entry, build verification, deploy, visual check.

### Slidev → Astro Codegen (Optional — Checkpoint-Gated)

- [ ] **CODEGEN-01** *(optional, triggered only if the PRIMS-05 refactor still takes > 15 min per additional slide ported by hand)*: Ship `scripts/slidev-to-astro.mjs` that reads one slide's `.md` + scoped `<style>`, strips Vue-specific `data-v-*` attributes, swaps Slidev tokens (`--vv-teal` → `--brand-primary`), converts Iconify web-components to inline SVG with `role="img"` + `aria-label`, and emits an `.astro` component using VvStage/VvNode/VvWire/VvPacket — validated on S1 arch-grid, S2 lifecycle, and S3 mesh patterns.

### Homepage Polish

- [ ] **POLISH-01**: Add a "See all posts →" CTA link to the top of the Blog homepage section (under the section heading) pointing at `/{locale}/blog/`, bilingual `blog.see_all` i18n key in both `en.json` + `ru.json`.
- [ ] **POLISH-02**: Keep a bottom "See all posts →" CTA under the BlogPreview cards (may already exist — audit and unify styling with POLISH-01).
- [ ] **POLISH-03**: Add top + bottom "See all presentations →" CTAs to the Presentations homepage section pointing at `/{locale}/presentations/`, bilingual `presentations.see_all` keys.
- [ ] **POLISH-04**: Extend `.animate-on-scroll` with a staggered section-reveal variant (fade-in + 50-100ms stagger per child), wired into homepage sections; must respect `prefers-reduced-motion: reduce`.
- [ ] **POLISH-05**: Add hover states to `BlogCard.astro`, `PresentationCard.astro`, and the Speaking card component — consistent `border-brand-primary` glow + subtle translate-Y lift + brand-accent underline on title, using Deep Signal tokens only.
- [ ] **POLISH-06**: Audit every homepage section for remaining spacing / typography / alignment nits against the Deep Signal reference (`/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx`) and fix each finding — target a clean pass on 1440×900 + 375px mobile.

### Companion Posts + Skill Updates

- [ ] **CONTENT-01**: Extend `src/content.config.ts` blog schema with optional `episode_number`, `episode_duration`, `listen_url` fields for companion posts (no regression on existing 4 posts).
- [ ] **CONTENT-02**: Ship 1 DKT episode companion blog post (EN + RU locales, 2 files) via the `vv-blog-from-vault` skill — specific episode chosen during `/gsd-discuss-phase`.
- [ ] **CONTENT-03**: Ship 1 AWS RU podcast companion blog post (EN + RU locales, 2 files) via the `vv-blog-from-vault` skill — specific episode chosen during `/gsd-discuss-phase`.
- [ ] **CONTENT-04**: Update the `vv-slidev` skill (lives at `~/.claude/skills/vv-slidev/`) with a `references/publish-to-vedmich-dev.md` page documenting the "publish a new deck to vedmich.dev/slides/<slug>/" workflow (submodule update, social.ts entry, deploy). Mirror the update into the vault backup per the three-way-sync rule.
- [ ] **CONTENT-05**: Extend the `vv-blog-from-vault` skill with a `references/primitives-usage.md` page covering VvStage/VvNode/VvWire/VvPacket, plus an update to `references/visuals-routing.md` elevating primitives to "Priority 2" (reuse-first) so companion posts favor primitives over hand-coded SVG. Mirror the update into the vault backup.

---

## Future Requirements (deferred out of v1.0)

- **RSS feed** (table-stakes, low urgency) — deferred to v1.1 / future milestone
- **Real search** (Pagefind or Algolia) — deferred until post count > 50
- **Tag filter UI on blog index** — exists minimally; expand in future milestone
- **Dark/light mode toggle** — Tailwind 4 `@theme` inlines tokens, runtime toggle needs theme refactor; deferred
- **Newsletter subscription** — not core to platform goal; deferred indefinitely
- **View counters / analytics** — deferred; Cloudflare Analytics or similar considered later

---

## Out of Scope for v1.0 (Explicit Exclusions)

| Excluded | Reason |
|---|---|
| Interactive Excalidraw via `@excalidraw/excalidraw` React component | ~1 MB runtime, breaks zero-JS budget — static SVG export only |
| Full interactive Slidev presenter UX inside blog posts | UX mismatch; Slidev decks stay on their own sub-routes |
| Slidev-exact fidelity for every slide | Selective porting accepted — some slides won't port cleanly |
| Comments section | Spam management burden; readers engage on LinkedIn / X |
| Lighthouse / a11y formal audit | Deferred to v1.1 — v1.0 scope is already broad |
| Obsidian → blog auto-sync script | Manual `vv-blog-from-vault` skill remains the path |
| Shiki Twoslash runtime | 200 KB runtime JS, violates zero-JS budget — transformer-based only |

---

## Constraints (from PROJECT.md + CLAUDE.md, apply to every requirement)

- **Zero-JS default.** New features must not add runtime JS beyond IntersectionObserver, menu toggle, CodeCopyEnhancer, and SMIL animations already shipped.
- **No hardcoded hex.** All colors via `src/styles/design-tokens.css`.
- **Never cyan (`#06B6D4` / `#22D3EE`).** Deprecated Electric Horizon palette.
- **Bilingual parity.** Every text change lands in both `src/i18n/en.json` and `src/i18n/ru.json`.
- **Build must pass.** `npm run build` stays green; current baseline 31 pages in ~800 ms.

---

## Traceability

| REQ-ID | Category | Phase | Status |
|---|---|---|---|
| PRIMS-01 | Rich-Media Primitives | Phase 1 | Pending |
| PRIMS-02 | Rich-Media Primitives | Phase 1 | Pending |
| PRIMS-03 | Rich-Media Primitives | Phase 1 | Pending |
| PRIMS-04 | Rich-Media Primitives | Phase 1 | Pending |
| PRIMS-05 | Rich-Media Primitives | Phase 1 | Pending |
| PRIMS-06 | Rich-Media Primitives | Phase 1 | Pending |
| CODE-01 | Code Block Upgrades | Phase 2 | Pending |
| CODE-02 | Code Block Upgrades | Phase 2 | Pending |
| CODE-03 | Code Block Upgrades | Phase 2 | Pending |
| CODE-04 | Code Block Upgrades | Phase 2 | Pending |
| CODE-05 | Code Block Upgrades | Phase 2 | Pending |
| POLISH-01 | Homepage Polish | Phase 3 | Pending |
| POLISH-02 | Homepage Polish | Phase 3 | Pending |
| POLISH-03 | Homepage Polish | Phase 3 | Pending |
| POLISH-04 | Homepage Polish | Phase 3 | Pending |
| POLISH-05 | Homepage Polish | Phase 3 | Pending |
| POLISH-06 | Homepage Polish | Phase 3 | Pending |
| DIAG-01 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-02 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-03 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-04 | Excalidraw Pipeline | Phase 4 | Pending |
| DIAG-05 | Excalidraw Pipeline | Phase 4 | Pending |
| SLIDES-01 | Slidev Integration | Phase 5 | Pending |
| SLIDES-02 | Slidev Integration | Phase 5 | Pending |
| SLIDES-03 | Slidev Integration | Phase 5 | Pending |
| SLIDES-04 | Slidev Integration | Phase 5 | Pending |
| SLIDES-05 | Slidev Integration | Phase 5 | Pending |
| SLIDES-06 | Slidev Integration | Phase 5 | Pending |
| CONTENT-01 | Companion Posts + Skill Updates | Phase 6 | Pending |
| CONTENT-02 | Companion Posts + Skill Updates | Phase 6 | Pending |
| CONTENT-03 | Companion Posts + Skill Updates | Phase 6 | Pending |
| CONTENT-04 | Companion Posts + Skill Updates | Phase 5 | Pending |
| CONTENT-05 | Companion Posts + Skill Updates | Phase 6 | Pending |
| CODEGEN-01 | Codegen (optional) | Phase 7 | Checkpoint-gated |

**Coverage:** 32/32 v1.0 requirements mapped ✓ (33/33 including optional CODEGEN-01)

---

**Summary:** 32 v1.0 requirements + 1 optional (CODEGEN-01) across 7 categories. Research flagged estimate 24-34h base effort (Phases 1-6), 34-49h with codegen if triggered.
