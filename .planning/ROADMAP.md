# ROADMAP.md — v1.0 Content Platform

**Milestone goal:** Turn vedmich.dev from "static site with a handful of posts" into a full content platform with three streams (blog, presentations, companion posts), reusable rich-media primitives that cut Slidev slide lift from ~30 min to <10 min, Excalidraw diagram embedding, code block upgrades (language badges + `// [!code highlight]`), and Slidev decks served as first-party routes under `vedmich.dev/slides/<slug>/`.

**Exit criteria:**
- Slidev slide lift < 10 min/slide (proven by re-porting PodLifecycleAnimation onto Wave 1 primitives)
- At least 1 Excalidraw diagram embedded (MCP post minimum; 2-3 additional placements desirable)
- Code blocks render language badge + support `// [!code highlight]` with Deep Signal-matched Shiki theme
- Slidev decks served under `vedmich.dev/slides/<slug>/` with documented onboarding workflow
- "See all →" CTAs present at top and bottom of Blog + Presentations homepage sections
- ≥ 2 companion posts shipped (1 DKT + 1 AWS RU)

**Execution model:** Sequential — one phase at a time. Phase 7 (codegen) is checkpoint-gated after Phase 1 completion.

**Phase numbering:** Reset to 1 (v1.0 milestone starts fresh, `config.json: phase_start=1, continue_from_previous=false`).

**Reference context:** v0.4 Reference Audit shipped 2026-05-01 (12 phases, 26 plans, 41 tasks). Live site matches Deep Signal reference UI-kit across all homepage sections. v1.0 builds on this stable foundation.

---

## Phases

- [ ] **Phase 1: Rich Media Primitives** — VvStage/VvNode/VvWire/VvPacket Astro components + refactor PodLifecycleAnimation
- [ ] **Phase 2: Code Block Upgrades** — Shiki transformers + language badge + Deep Signal theme override
- [ ] **Phase 3: UI Polish** — "See all →" CTAs + hover states + section transitions + spacing audit
- [ ] **Phase 4: Excalidraw Pipeline** — Export script + replace ASCII diagrams + stress-test on 2-3 posts
- [ ] **Phase 5: Slidev Integration** — Git submodule + CI build + migrate 6 decks + DNS decision + onboarding docs
- [ ] **Phase 6: Companion Posts** — 1 DKT + 1 AWS RU companion post via vv-blog-from-vault skill + schema extension
- [~] **Phase 7: Slidev → Astro Codegen (OPTIONAL)** — **SKIPPED 2026-05-02**: time-to-port measured at 0.73 min (44s) on AWS three-tier; primitives alone hit the <10 min target, codegen ROI insufficient

---

## Phase Details

### Phase 1: Rich Media Primitives
**Goal:** Ship reusable Astro primitives (VvStage, VvNode, VvWire, VvPacket) that enable inline animated diagrams in blog posts, reducing Slidev → blog post porting time from ~30 min to <10 min per slide.

**Depends on:** Nothing (foundational phase)

**Requirements:** PRIMS-01, PRIMS-02, PRIMS-03, PRIMS-04, PRIMS-05, PRIMS-06

**Success Criteria** (what must be TRUE):
1. User can compose an inline animated diagram in MDX using `<VvStage>` + `<VvNode>` + `<VvWire>` + `<VvPacket>` with explicit coordinates visible at the call site
2. Existing `PodLifecycleAnimation.astro` refactored onto primitives and renders identically to pre-refactor version on `/blog/karpenter-right-sizing` (live)
3. Primitives use SMIL `<animateMotion>` inside stable SVG viewBox (no CSS offset-path coordinate-space bugs)
4. All animations respect `prefers-reduced-motion: reduce` (packets/wires pause, nodes appear without motion)
5. `src/components/visuals/README.md` documents primitive API (props, examples, SMIL-vs-CSS-offset-path gotcha, reduced-motion rules) for future slide ports

**Plans:** 6 plans across 5 waves (0 → 1 → 2 → 3 → 4)

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Test + Icon infrastructure: install astro-icon + 8 Iconify collections + @playwright/test, register icon() integration in astro.config.mjs, scaffold playwright.config.ts, capture pre-refactor pixel-parity baseline PNG (wave 0)
- [x] 01-02-PLAN.md — Pure-TS utilities + node unit tests: _vv-registry.ts (SSR coordinate store), _vv-geom.ts (rectangle edge-point math), _vv-path.ts (SVG path builder); 17 unit tests (wave 0)
- [x] 01-03-PLAN.md — VvStage skeleton: SSR host, viewBox/aspect-ratio, tone palette CSS, reduced-motion :global rules, per-stage glow filter id (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-04-PLAN.md — VvNode + VvWire + VvPacket register-only primitives + extend registry with PacketRecord + update VvStage to emit nodes/packets from registry (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-05-PLAN.md — Refactor PodLifecycleAnimation.astro onto primitives (≤100 LOC) + Playwright pixel-parity gate + human visual sign-off (wave 3)

**Wave 4** *(blocked on Wave 3 completion)*
- [x] 01-06-PLAN.md — src/components/visuals/README.md (200+ lines, 9 sections) + time-to-port metric measurement + Phase 7 go/skip decision (wave 4)

**UI hint:** yes

---

### Phase 2: Code Block Upgrades
**Goal:** Upgrade code blocks across the site with language badges (top-right pill), `// [!code highlight]` line-highlight support, and a Deep Signal-matched Shiki theme using CSS variable overrides.

**Depends on:** Phase 1 (independent, but ordering rationale: global Shiki config change has highest regression risk — run early while post count is low)

**Requirements:** CODE-01, CODE-02, CODE-03, CODE-04, CODE-05

**Success Criteria** (what must be TRUE):
1. Every prose code block renders a language badge (top-right pill) showing the fence language (`yaml`, `bash`, `ts`, etc.) in JetBrains Mono small-caps
2. Code blocks support `// [!code highlight]` line-highlight comments via `@shikijs/transformers` — validated on bash, yaml, and typescript in existing posts
3. Code blocks support `// [!code ++]` / `// [!code --]` diff-add/remove line styling
4. Shiki theme uses Deep Signal CSS variables (`--text-primary`, `--bg-code`, `--brand-primary`, `--brand-accent`) for syntax highlighting
5. Existing `CodeCopyEnhancer.astro` copy button behavior works on all 4 existing blog posts (no regressions)

**Plans:** 6 plans across 6 waves (0 → 1 → 2 → 3 → 4 → 5)

Plans:
- [x] 02-01-PLAN.md — Test infrastructure + Astro exact-pin 5.18.0 + 8 pre-change baseline PNGs (wave 0)
- [x] 02-02-PLAN.md — Install @shikijs/transformers@^3.23.0 + shikiConfig block + fixture post exercising highlight/diff on bash/yaml/ts/dockerfile (wave 1)
- [x] 02-03-PLAN.md — remark-stash-code-lang.mjs + rehype-code-badge.mjs plugins at project root + 6 unit tests + astro.config.mjs wiring (wave 2)
- [x] 02-04-PLAN.md — Deep Signal Shiki CSS overrides (github-dark attribute-selector + !important) + figure/badge/highlight/diff styling (wave 3)
- [x] 02-05-PLAN.md — CodeCopyEnhancer.astro rewrite (icon-only-at-rest + label-on-hover + singleton aria-live toast in BaseLayout.astro + bilingual labels) (wave 4)
- [x] 02-06-PLAN.md — Final baseline re-capture + 8-screenshot regression gate + human sign-off checkpoint + Astro caret restore to ^5.18.0 (wave 5)

---

### Phase 3: UI Polish
**Goal:** Polish homepage UX with "See all →" CTAs (Blog + Presentations sections), hover states on cards, staggered section-reveal animations, and a spacing/typography audit against Deep Signal reference.

**Depends on:** Phase 2 (independent, but positioned as palate cleanser between high-risk phases)

**Requirements:** POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05, POLISH-06

**Success Criteria** (what must be TRUE):
1. Blog and Presentations homepage sections have "See all →" CTA links at top (under section heading) and bottom (under preview cards), pointing at `/{locale}/blog/` and `/{locale}/presentations/` respectively
2. `BlogCard.astro`, `PresentationCard.astro`, and Speaking card component have hover states (consistent `border-brand-primary` glow + subtle translate-Y lift + brand-accent title underline)
3. Homepage sections use staggered fade-in animation (50-100ms stagger per child) via extended `.animate-on-scroll` variant, respecting `prefers-reduced-motion`
4. All homepage sections audited for spacing/typography/alignment against Deep Signal reference at 1440×900 and 375px mobile — zero nits remain
5. All i18n keys bilingual (`blog.see_all`, `presentations.see_all` in both `en.json` + `ru.json`)

**Plans:** 4 plans across 3 waves (1 → 2 → 3). Wave 1 runs Plans 01 + 03 in parallel.

Plans:
**Wave 1** *(parallel — zero file overlap)*
- [x] 03-01-PLAN.md — Token + Motion infrastructure: update `--transition-normal` to expo-out curve in design-tokens.css; add `.animate-on-scroll-stagger` variant + reduced-motion guard in global.css (POLISH-04 CSS, POLISH-05 curve)
- [x] 03-03-PLAN.md — WR-03 fold: ship `tests/unit/shiki-palette-guard.test.ts` with 8 github-dark hex assertions + document guard pattern in CLAUDE.md (Phase 2 tech-debt closure, folded per D-05)

**Wave 2** *(blocked on Plan 01)*
- [x] 03-02-PLAN.md — Bottom CTAs + stagger wiring: add `All posts →` to BlogPreview.astro, `All decks →` to Presentations.astro, unify Speaking.astro CTA style with canonical BlogPreview shape; wrap both grids in stagger variant (POLISH-01, 02, 03, 04 wiring, 05 class unification)

**Wave 3** *(blocked on Plans 01 + 02 deploying to live)*
- [ ] 03-04-PLAN.md — Spacing/typography audit: capture 14 baseline screenshots (7 sections × 2 viewports) via playwright-cli attach-to-real-Chrome on live vedmich.dev; ship AUDIT.md with 5-col findings table; fix each finding as atomic `fix(03): ...` commit with after-screenshot (POLISH-06)

**UI hint:** yes

---

### Phase 4: Excalidraw Pipeline
**Goal:** Establish build-time `.excalidraw.json → SVG` export pipeline, replace ASCII diagram in MCP blog post with Excalidraw SVG, and stress-test the pipeline on 2-3 additional diagrams in existing posts.

**Depends on:** Phase 3 (independent, but positioned before companion posts so diagram pipeline is ready for them)

**Requirements:** DIAG-01, DIAG-02, DIAG-03, DIAG-04, DIAG-05

**Success Criteria** (what must be TRUE):
1. `scripts/excalidraw-to-svg.mjs` converts `.excalidraw.json → .svg` via build-time Node script (zero runtime JS)
2. Emitted diagrams are SVGO-optimized to ≤ 10 KB each (prevents LCP regression)
3. Convention established: `public/blog-assets/<slug>/diagrams/*.svg` for committed diagrams, with `title`+`desc` a11y elements injected during export
4. MCP blog post (`2026-03-15-mcp-intro.md`) ASCII diagram replaced with Excalidraw SVG rendered via the new pipeline (both `en/` and `ru/` locales)
5. 2-3 additional Excalidraw diagrams added to existing posts (karpenter / manifests / TBD-third) — pipeline stress-tested on real content

**Plans:** TBD

---

### Phase 5: Slidev Integration
**Goal:** Serve Slidev presentation decks as first-party routes under `vedmich.dev/slides/<slug>/` via git submodule + CI build, migrate all 6 existing decks from `s.vedmich.dev`, update internal links, configure DNS redirect, and document the "add a new deck" workflow.

**Depends on:** Phase 4 (independent infrastructure change, but best isolated after primitives + code blocks validated)

**Requirements:** SLIDES-01, SLIDES-02, SLIDES-03, SLIDES-04, SLIDES-05, SLIDES-06, CONTENT-04

**Success Criteria** (what must be TRUE):
1. `vedmichv/slidev` added as git submodule at `slidev/`, `.github/workflows/deploy.yml` extended to build every deck with `slidev build --base /slides/<slug>/` and copy output to `dist/slides/<slug>/` before `actions/deploy-pages@v4`
2. Slidev build + Astro build run in a single GH Actions job (avoids `actions/deploy-pages` race-condition pitfall)
3. All 6 existing decks migrated to `vedmich.dev/slides/<slug>/` — each deck resolves assets correctly under the sub-path (curl check on live, not just preview)
4. Every `src/data/social.ts` `presentations[].slug` entry + in-content links updated to point at `/slides/<slug>/`, not `s.vedmich.dev/<slug>/`
5. `s.vedmich.dev` CNAME configured to serve 301 redirect to `vedmich.dev/slides/<slug>/` (preserves external backlinks during transition)
6. `docs/slides-onboarding.md` runbook authored covering "how to add a new deck": submodule update, `social.ts` entry, build verification, deploy, visual check
7. `vv-slidev` skill updated with `references/publish-to-vedmich-dev.md` documenting the workflow (mirrored to vault backup per three-way-sync rule)

**Plans:** TBD

---

### Phase 6: Companion Posts
**Goal:** Ship 2 companion posts (1 DKT + 1 AWS RU podcast episode) via the `vv-blog-from-vault` skill, validating the end-to-end content pipeline (primitives + diagrams + Slidev decks + schema extensions).

**Depends on:** Phase 1 (primitives), Phase 4 (diagrams), Phase 5 (Slidev integration) — companion posts may reference all three

**Requirements:** CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-05

**Success Criteria** (what must be TRUE):
1. `src/content.config.ts` blog schema extended with optional `episode_number`, `episode_duration`, `listen_url` fields for companion posts (no regression on existing 4 posts)
2. 1 DKT episode companion blog post shipped (EN + RU locales, 2 files) via `vv-blog-from-vault` skill — specific episode chosen during phase discussion
3. 1 AWS RU podcast companion blog post shipped (EN + RU locales, 2 files) via `vv-blog-from-vault` skill — specific episode chosen during phase discussion
4. Companion posts render correctly with animations (using primitives) + diagrams (Excalidraw SVGs) where applicable
5. `vv-blog-from-vault` skill extended with `references/primitives-usage.md` covering VvStage/VvNode/VvWire/VvPacket + `references/visuals-routing.md` updated to elevate primitives to "Priority 2" (reuse-first) — mirrored to vault backup

**Plans:** TBD

---

### Phase 7: Slidev → Astro Codegen (OPTIONAL) — **SKIPPED 2026-05-02**

**Decision:** SKIP. Time-to-port measured at 0.73 min (44 s) on AWS three-tier architecture slide — primitives + README alone hit the <10 min target by a ~14× margin. Codegen would save ≤ 30 s per slide, not worth the 10-15 h effort. See `.planning/phases/01-rich-media-primitives/time-to-port-report.md` for the full measurement and rationale.

**Original goal (preserved for reference):** Ship `scripts/slidev-to-astro.mjs` that reads one Slidev slide's `.md` + scoped `<style>`, strips Vue-specific attributes, swaps tokens, converts Iconify to inline SVG, and emits an `.astro` component using primitives — validated on S1 arch-grid, S2 lifecycle, and S3 mesh patterns.

**Depends on:** Phase 1 (primitives must exist)

**Requirements:** CODEGEN-01

**Checkpoint condition:** After Phase 1 (primitives), re-port one slide from Slidev to Astro using primitives. If elapsed time >15 min, proceed with Phase 7. If <15 min, skip Phase 7 entirely (primitives alone hit the <10 min target, codegen ROI is marginal).

**Success Criteria** (what must be TRUE):
1. `scripts/slidev-to-astro.mjs` reads Slidev `.md` + scoped style, emits Astro component using VvStage/VvNode/VvWire/VvPacket
2. Script handles S1 arch-grid, S2 lifecycle, and S3 mesh slide patterns
3. Documented limitations (which slides port cleanly, which need manual tweaks)
4. Codegen script successfully ports one real slide (e.g., Pod lifecycle slide 84) — output Astro component renders identically to hand-ported version

**Plans:** TBD

**Note:** This phase only runs if the checkpoint after Phase 1 shows manual slide porting is still >15 min/slide. If primitives drop lift time to 10-12 min (within target), skip this phase entirely.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Rich Media Primitives | 0/? | Not started | - |
| 2. Code Block Upgrades | 0/? | Not started | - |
| 3. UI Polish | 3/4 | Executing (Plans 01 + 02 + 03 shipped 2026-05-03) | - |
| 4. Excalidraw Pipeline | 0/? | Not started | - |
| 5. Slidev Integration | 0/? | Not started | - |
| 6. Companion Posts | 0/? | Not started | - |
| 7. Slidev Codegen (OPTIONAL) | 0/? | Checkpoint-gated | - |

---

## Research Flags

| Phase | Needs Research? | Reason |
|-------|----------------|--------|
| Phase 1 | NO | Pattern validated (Slidev Vue + Phase 9 hotfix) |
| Phase 2 | MAYBE | Language badge implementation path unclear (remark vs CodeCopyEnhancer) — allocate 1h research spike, timeboxed |
| Phase 3 | NO | Standard component modification |
| Phase 4 | NO | Straightforward npm package usage — compare `@excalidraw/excalidraw` vs `@aldinokemal2104/excalidraw-to-svg` during planning |
| Phase 5 | MAYBE (DNS) | Submodule + CI is standard — DNS audit (15 min) to check Route 53 + external backlinks to `s.vedmich.dev` |
| Phase 6 | NO | Uses existing vv-blog-from-vault skill |
| Phase 7 | YES | Complexity unknown (HTML + CSS parsing) — timebox to 10-15h if triggered |

---

## Critical Risks by Phase

| Phase | Top Pitfall | Prevention |
|-------|-------------|------------|
| Phase 1 | Hardcoded coords in component logic (Pitfall 4) | Explicit x/y props visible in MDX call site; API design review first |
| Phase 2 | Global Shiki regression (Pitfall 2) | Test all 4 existing posts; pin Astro version; screenshot comparison |
| Phase 3 | None (low-risk component mods) | Visual test homepage on 1440×900 + 375px |
| Phase 4 | Excalidraw in prod bundle (Pitfall 6) | Dev dependency only; never import in components |
| Phase 5 | Rebuilding Slidev in CI (Pitfall 3) | Pre-build in separate repo, copy static artifacts |
| Phase 5 | Base path asset resolution (Pitfall 12) | Always build with `--base /slides/<slug>/`, curl test on live |
| Phase 6 | CSS offset-path if primitives not used (Pitfall 1) | Use primitives (SMIL-based) for all animations |
| Phase 7 | Unknown parsing complexity | Timebox to 10-15h; abort if exceeds 20h |

---

## Effort Estimates

| Phase | Estimated Effort | Notes |
|-------|-----------------|-------|
| Phase 1 | 6-8h | 4 components + refactor + README |
| Phase 2 | 4-6h | Config + remark plugin/CodeCopyEnhancer + regression test |
| Phase 3 | 2-3h | CTAs + hover states + stagger animation + audit |
| Phase 4 | 2-3h | Script + 1-2 diagram placements |
| Phase 5 | 4-6h | Submodule + CI + 6 deck migration + DNS + docs |
| Phase 6 | 6-8h | Schema extension + 2 posts (3-4h each) + skill updates |
| Phase 7 | 10-15h | Codegen logic + testing (IF triggered) |

**Total base effort (Phases 1-6):** 24-34h
**Total with codegen (if triggered):** 34-49h

---

## Coverage Validation

All 32 v1.0 requirements + 1 optional (CODEGEN-01) mapped:

| REQ-ID | Category | Phase | Status |
|--------|----------|-------|--------|
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
| POLISH-01 | Homepage Polish | Phase 3 | Plan 02 shipped (top CTA already present; verified) |
| POLISH-02 | Homepage Polish | Phase 3 | Plan 02 shipped (bottom `All posts →` CTA) |
| POLISH-03 | Homepage Polish | Phase 3 | Plan 02 shipped (bottom `All decks →` CTA) |
| POLISH-04 | Homepage Polish | Phase 3 | Plans 01 + 02 shipped (CSS infrastructure + grid wiring) |
| POLISH-05 | Homepage Polish | Phase 3 | Plans 01 + 02 shipped (curve token + canonical CTA class) |
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

**Last updated:** 2026-05-03 (Phase 3 Plans 01 + 02 + 03 shipped — motion infrastructure + bottom CTAs + stagger wiring + Shiki palette guard test)
