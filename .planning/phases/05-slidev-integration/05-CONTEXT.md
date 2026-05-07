# Phase 5: Slidev Integration - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 ships the **infrastructure and contract** for serving Slidev presentation decks as first-party routes under `vedmich.dev/slides/<slug>/`. It does NOT migrate any real deck content in this phase.

**In scope:**
1. Git submodule `slidev/` → `vedmichv/slidev` at `-b gh-pages` branch
2. CI pipeline extension in `.github/workflows/deploy.yml` — submodule checkout + explicit-whitelist `cp -r` step into `dist/slides/<slug>/`
3. `PresentationCard.astro` URL rewrite — `deckUrl` switches from `https://s.vedmich.dev/${slug}/` → `/slides/${slug}/`
4. All 6 existing `src/content/presentations/{en,ru}/*.md` MDX entries → `draft: true` (4 ghost slugs + 2 slurm slugs all hidden from homepage)
5. `src/data/search-index.ts` URL builder swap
6. `src/i18n/{en,ru}.json` subtitle string update (remove `s.vedmich.dev` domain mention)
7. `docs/slides-onboarding.md` runbook — how to build + publish a new deck end-to-end
8. `CLAUDE.md` gains a short `## Slidev Integration` pointer block with 3-4 key commands
9. `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` — short skill reference pointing to `docs/slides-onboarding.md` as source of truth (three-way-sync to vault backup per CLAUDE.md rule)
10. REQUIREMENTS/ROADMAP/STATE traceability updates closing Phase 5

**Explicitly out of scope:**
- Migrating any Slurm deck (`slurm-prompt-engineering`, `slurm-ai-demo`) onto `vedmich.dev/slides/` — separate user-driven task (D-11)
- `s.vedmich.dev` CNAME removal / 301 redirect — user will handle manually later (SLIDES-05 deferred)
- Rebuilding any existing dist with new `--base /slides/<slug>/` path
- DKT decks (`DKT-AI/slidev`) — separate brand, separate subdomain, not touched
- E2E live verification against a real deck on `/slides/<slug>/` — smoke-level gate only (D-14)

**Success definition:** `npm run build` passes; `git submodule status` shows `slidev/` initialized at `vedmichv/slidev:gh-pages` HEAD; `grep -r 's.vedmich.dev' src/` returns zero hits outside draft MDX `slides:` overrides; `docs/slides-onboarding.md` exists; `/slides/` route works (even if it just lists no decks); CI deploy stays ≤ +5s over current baseline (~90s).

</domain>

<decisions>
## Implementation Decisions

### Phase Scope & Outcomes

- **D-01 (Scope is pipeline-only):** Phase 5 delivers infrastructure + docs + contract. NO real deck migration. Presentations section on homepage becomes empty (6 × draft:true) — acceptable; reality check on 2026-05-07 confirmed only 2 of 6 slugs have live builds anyway, and those 2 are built with `--base /slurm-*/` so they can't serve under `/slides/` without a full rebuild. Rebuild is scoped out — user will migrate decks in their own time.

### Ghost decks & MDX hygiene

- **D-11 (All 6 MDX → draft:true):** add `draft: true` to frontmatter in `src/content/presentations/{en,ru}/{slurm-prompt-engineering,slurm-ai-demo,karpenter-prod,eks-multi-az,mcp-platform,dkt-workflow}.md` (12 files total). Collection schema already supports `draft` (used in blog collection). PresentationsList / BlogPreview-style filter `.filter(d => !d.data.draft)` needed on the homepage `Presentations.astro` + index page consumers — to be verified during plan.
- **D-03 (Ghost MDX kept as skeleton):** do NOT delete 4 ghost MDX files — preserve their frontmatter (title, event, city, date, description, tags) for future real-deck authoring. `draft: true` hides them from homepage + `/presentations/` index.

### Submodule topology

- **D-02 (Submodule branch):** `git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev`. Targets artifact branch directly. `vedmichv/slidev` default-branch is already `gh-pages` (confirmed via `gh repo view 2026-05-07`), so this is natural. No refactor to the slidev repo required.
- **D-12 (Submodule with empty whitelist):** submodule is added now; CI copy step is written but with commented-out whitelist (`# for slug in ...; do cp -r slidev/$slug dist/slides/; done`) since no decks migrate in this phase. When the first real deck is ready for `/slides/`, uncomment + add slug.
- **D-05 (Whitelist CI copy):** explicit `for slug in <list>; do cp -r slidev/$slug dist/slides/; done`. No auto-discover, no manifest.json — predictable and greppable. Adding a deck = one-line edit to `.github/workflows/deploy.yml`.
- **D-06 (Manual pump):** after a new deck is built and pushed to `vedmichv/slidev:gh-pages`, author runs locally in `vedmich.dev`: `git submodule update --remote --merge slidev && git add slidev && git commit -m "chore(slides): bump <slug>" && git push`. Two push surfaces: one to the slidev repo (artifact), one to vedmich.dev (submodule pointer). Covered by onboarding runbook.
- **D-07 (Build time budget):** max +5s over current ~90s CI baseline. `actions/checkout@v4 submodules: recursive` adds ~2s; whitelist `cp -r` of a couple of 5MB deck dirs adds ~200ms; currently empty whitelist adds 0ms.

### URL routing & surface

- **D-04 (PresentationCard URL rewrite):** `src/components/PresentationCard.astro` changes `const deckUrl = \`https://s.vedmich.dev/${slug}/\`` → `const deckUrl = \`/slides/${slug}/\``. Drop `displayUrl = 's.vedmich.dev/${slug}'` — either remove display line or replace with `/slides/${slug}` if card still shows the path. Frontmatter `slides:` field becomes optional — PresentationCard prefers `data.slides` if set (for external overrides like SpeakerDeck, user's manually hosted dist on s.vedmich.dev), otherwise computes `/slides/${slug}/`. Schema in `src/content.config.ts` already has `slides: z.string().url().optional()`.
- **D-13 (404.html fallback):** do NOT copy `vedmichv/slidev:gh-pages` root-level `404.html` (it's hardcoded for a 2-segment `/slug/slide` path — breaks on the new 3-segment `/slides/slug/slide`). Do NOT bundle a replacement in Phase 5 — verify on practice when the first real deck ships under `/slides/`. Slidev SPA's internal Vue Router handles most navigation via hash/history natively; a GH Pages 404 fallback is only needed for direct-link edge cases, which we test when there's content to test.

### i18n & search

- **D-15 (i18n subtitle):** `src/i18n/en.json` `speaking.subtitle` → remove `s.vedmich.dev` mention: `"{N} talks · all on vedmich.dev/slides"`. `src/i18n/ru.json` mirror: `"{N} докладов · все на vedmich.dev/slides"`. Bilingual parity per CLAUDE.md constraint.
- **D-16 (search-index URL):** `src/data/search-index.ts:37` URL build switches from `https://s.vedmich.dev/${slug}` → `/slides/${slug}`. Same pattern as D-04.

### Docs & onboarding

- **D-08 (Source/dist split stable):** Slidev `.md` sources live in theme repos (`vedmich/slidev-theme-slurm`, `vedmichv/slidev-theme-vv`, `DKT/slidev-theme-dkt`). Built dist artifacts go to `vedmichv/slidev:gh-pages`. Phase 5 does NOT consolidate or refactor this split. Runbook documents the current reality.
- **D-09 (Docs location):** full runbook at `docs/slides-onboarding.md` in vedmich.dev repo. Short pointer block `## Slidev Integration` added to `CLAUDE.md` with 3-4 key commands (build with `--base`, push to slidev, pump submodule in vedmich.dev). Full content in docs/, quick lookup in CLAUDE.md.
- **D-10 (vv-slidev skill update):** `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` is a **short (30-50 LOC) pointer** to `docs/slides-onboarding.md` as single-source-of-truth, plus quick commands inline. NOT a full mirror. Three-way-sync mandatory: edit live skill first, mirror to `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/`, commit vault with message `vault backup: skill vv-slidev — add publish-to-vedmich-dev.md reference`.

### Verification

- **D-14 (Smoke-level verification):** exit criteria: (1) `npm run build` exits 0; (2) current unit/integration test suite (69 tests) still green; (3) `git submodule status slidev/` shows initialized checkout at some SHA; (4) `grep -rn 's\.vedmich\.dev' src/` returns only results inside `src/content/presentations/` draft MDX frontmatter (if any `slides:` URL overrides survived) and inside i18n files NOT updated (should be zero after phase close); (5) `docs/slides-onboarding.md` exists and has been reviewed; (6) `CLAUDE.md` has new `## Slidev Integration` section. No live Playwright/curl against a deployed deck is required because no deck migrates.

### Requirements traceability

- **D-17 (REQUIREMENTS/ROADMAP alignment):** 7 pending SLIDES-01..06 + CONTENT-04 requirements get partial closure or deferral. Proposed mapping (to be finalized in plan):
  - SLIDES-01 (submodule + CI build) — **shipped** (pipeline exists, empty whitelist)
  - SLIDES-02 (single GH Actions job) — **shipped** (CI stays single job)
  - SLIDES-03 (migrate 6 decks) — **deferred** (0/6 migrate in Phase 5; re-opened as separate user-driven tasks)
  - SLIDES-04 (social.ts/in-content links) — **shipped** (PresentationCard + search-index rewritten; frontmatter `slides:` becomes optional override)
  - SLIDES-05 (s.vedmich.dev 301 redirect) — **deferred** (user will close s.vedmich.dev manually)
  - SLIDES-06 (onboarding runbook) — **shipped** (docs/slides-onboarding.md)
  - CONTENT-04 (vv-slidev skill reference) — **shipped** (references/publish-to-vedmich-dev.md)

### Claude's Discretion

- **Exact path of `vv-slidev` skill 3-way-sync target in vault:** Claude to follow the CLAUDE.md rule (`~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/`) — no user input needed.
- **CI `actions/checkout@v4` submodule flag:** use `with: submodules: recursive` (cleanest per ARCHITECTURE.md Option A analysis); no separate `git submodule update --init` step unless the recursive flag fails on private submodules (public repo here, so fine).
- **PresentationsList empty-state copy:** if homepage `Presentations.astro` is a `preview` (shows top 3), empty state can be a simple "No decks yet" message or the section can hide entirely when `decks.length === 0`. Claude to pick the pattern that matches existing Blog empty-state handling (which exists per Phase 03 Plan 02).
- **CLAUDE.md block exact copy + placement:** Claude to write the pointer block in the tone of existing CLAUDE.md sections (e.g., `### Excalidraw Diagram Pipeline`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 upstream docs (ROADMAP/REQUIREMENTS/PROJECT)
- `.planning/ROADMAP.md` §`Phase 5: Slidev Integration` — 7 success criteria + effort estimate + critical risks table (Pitfalls 3, 10, 12)
- `.planning/REQUIREMENTS.md` §`Slidev Integration` (SLIDES-01..06) + §`Companion Posts + Skill Updates` (CONTENT-04)
- `.planning/PROJECT.md` §`Current milestone: v1.0 — Content Platform` — Slidev integration rationale
- `.planning/STATE.md` — current position, notes (Phase 5 DNS audit note, test count 69)

### Research (v1.0 milestone kickoff research, 2026-05-02)
- `.planning/research/ARCHITECTURE.md` §`Slidev Integration Architecture` (lines 285-418) — Option A (git submodule + cp) = recommended approach, source of D-02/D-05/D-07
- `.planning/research/PITFALLS.md` §`Pitfall 3: Rebuilding Slidev Decks on Every Main Site Deploy` (lines 42-54) — pre-build in separate repo, never build in main CI
- `.planning/research/PITFALLS.md` §`Pitfall 7: Forgetting Submodule Update` (lines 97-105) — documented workflow + drift detection
- `.planning/research/PITFALLS.md` §`Pitfall 10: Not Testing Slidev Client-Side Routing` (lines 125-135) — GH Pages serves index.html for 404s; verified by existing s.vedmich.dev deploy
- `.planning/research/PITFALLS.md` §`Pitfall 12: Base Path Asset Resolution` (referenced by ROADMAP Critical Risks table) — always build with `--base /slides/<slug>/`, curl test on live (source of D-13 decision to defer until first real migration)
- `.planning/research/SUMMARY.md` — v1.0 milestone synthesis

### Codebase
- `src/components/PresentationCard.astro` — URL construction at lines 12-13 (D-04 target)
- `src/content/presentations/{en,ru}/*.md` — 12 MDX files for draft flag (D-11)
- `src/content.config.ts` — presentations collection schema (verify `draft` field exists, add if missing)
- `src/data/search-index.ts:37` — D-16 target
- `src/i18n/en.json:65` + `src/i18n/ru.json:65` — D-15 target
- `.github/workflows/deploy.yml` — D-05 CI extension target (currently 49 LOC)
- `public/CNAME` — contains `vedmich.dev` (no change needed; Slidev repo has its own `CNAME = s.vedmich.dev`)

### Global CLAUDE.md constraints (apply universally)
- `CLAUDE.md` §`Deep Signal Design System` — no hardcoded hex, use tokens (applies if any styling added, unlikely in this phase)
- `CLAUDE.md` §`Publishing Workflow` — small infra changes push to main, no PR required; big infra changes get PR + visual review (Phase 5 is big-ish — likely a PR workflow)
- `~/.claude/CLAUDE.md` §`Skill updates — three-way sync` — mandatory 3-way sync for vv-slidev skill changes (D-10)

### External (read-only references)
- `vedmichv/slidev` gh-pages branch — live artifact repo with 2 live decks (`slurm-prompt-engineering`, `slurm-ai-demo`) and `404.html` + root `index.html` + `CNAME = s.vedmich.dev`
- `vedmich/slidev-theme-slurm/presentations/` — Slidev sources for 2 existing slurm decks (not touched in Phase 5)
- `https://slidev.antfu.me/guide/hosting.html` — Slidev deploy docs (base path, SPA router) — reference for onboarding runbook

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Content Collection `draft` pattern** — already used in `src/content/blog/` (4 posts, all `draft: false`). Schema already has `draft: z.boolean().default(false)`. Reusing the same pattern in presentations collection (or adding it if missing) keeps code shape identical across collections.
- **BlogPreview empty-state filter** — Phase 03 Plan 02 shipped `posts.length > 0` guard on bottom CTA. Same guard needed on `Presentations.astro` bottom CTA + potentially hide section entirely when all decks are draft.
- **`Speaking.astro` unified CTA class** — Phase 03 Plan 02 established `text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap` — unchanged, just noting consistency when the empty-state branch is added.
- **PresentationCard.astro card structure** — layout, hover states, `card-glow` + `animate-on-scroll` unchanged. Only the URL derivation (lines 12-13) changes.

### Established Patterns
- **ZeroJS default** — doesn't apply to `/slides/*` sub-routes (they're Slidev SPAs). Applies only to Astro-rendered main site pages (homepage, blog, presentations index).
- **Bilingual parity** — every i18n key change lands in BOTH `en.json` and `ru.json`. D-15 enforces this.
- **Token-only styling** — no hex literals. Applies to any CSS added (unlikely in this phase — mostly config/infra edits).
- **`/[locale]/` routing** — `/slides/` is LOCALE-AGNOSTIC by design (confirmed by ARCHITECTURE.md: Slidev decks are single-language). No `/en/slides/` + `/ru/slides/` mirror.
- **Small-PR vs branch-PR workflow** — Phase 5 touches `.github/workflows/deploy.yml` (CI!), CLAUDE.md, and multiple content files — should be a feature branch + PR (per CLAUDE.md Publishing Workflow "Big changes" section) for safety. Capture a before/after build log in PR body to prove CI didn't regress.

### Integration Points
- **`PresentationCard.astro`** — sole consumer of deck URL. One-file edit.
- **Search index** — `src/data/search-index.ts` builds the client-side search payload. URL rewrite needed for search results (same pattern as D-04).
- **Homepage `Presentations.astro`** — section list renderer. Add draft filter if not present. Verify empty-state handling (blog already handles).
- **`/presentations/` index page** — `/[locale]/presentations/index.astro` likely lists all (non-draft) decks. Will render empty after D-11 until user migrates first deck.
- **`.github/workflows/deploy.yml`** — add `actions/checkout@v4 with: submodules: recursive` + empty-whitelist cp step. Keep single-job architecture per SLIDES-02.
- **`.gitmodules`** — new file created by `git submodule add`. Contains `path = slidev / url = https://github.com/vedmichv/slidev.git / branch = gh-pages`. Committed.

### Anti-patterns to avoid
- **Don't** add Slidev as an npm dep (Pitfall 3) — decks are pre-built artifacts, vedmich.dev never runs `slidev build`.
- **Don't** try to auto-build missing decks in CI to "fill" ghost slugs — that contradicts D-01 (pipeline-only scope) and re-opens complexity.
- **Don't** copy `vedmichv/slidev:gh-pages` root-level files (`index.html`, `CNAME`, `404.html`, single-file `*.css`) into `dist/slides/` — whitelist-only copy prevents this.
- **Don't** update `s.vedmich.dev` DNS or CNAME in Phase 5 — out of scope (SLIDES-05 deferred).
- **Don't** write per-locale `/slides/` routes — `/slides/` is locale-agnostic, confirmed by ARCHITECTURE.md.

</code_context>

<specifics>
## Specific Ideas

- **User's phrasing during discussion:** "Точно не надо деки со slurm на мой сайт нести" — Slurm decks stay on `s.vedmich.dev` for now; user will decide migration later.
- **User's phrasing on s.vedmich.dev closure:** "оставить как есть, я потом закрою сам" — Phase 5 does NOT touch s.vedmich.dev, DNS, or the `vedmichv/slidev:gh-pages` root redirect logic. User owns that closure as a separate op-task.
- **User's phrasing on docs:** "Оба: docs/ + pointer в CLAUDE.md" — explicit two-surface doc pattern (full runbook + short CLAUDE.md hint).
- **User's phrasing on skill content:** "Ссылка на docs/slides-onboarding.md" — skill reference is a short pointer, NOT a full mirror. Reduces drift risk.
- **User's phrasing on submodule:** "Да, подключить на будущее" — submodule value is partly forward-looking. Pipeline is proven/commented now, activated when first real deck migrates.

</specifics>

<deferred>
## Deferred Ideas

- **SLIDES-05 — `s.vedmich.dev` → 301 redirect:** user will handle closure manually in their own time. Options discussed during discuss: (A) JS-redirect via rewriting gh-pages root `index.html` + `404.html` to `window.location.replace('vedmich.dev/slides' + pathname)` (~15 min, Recommended by Claude); (B) delete CNAME + disable GH Pages in vedmichv/slidev settings; (C) leave parallel. User chose "оставить как есть, закрою сам" — option C for now, likely option A later. Captured in case future agent picks this up.
- **Actual Slurm deck migration** (`slurm-prompt-engineering`, `slurm-ai-demo` → `vedmich.dev/slides/`): requires rebuild with `--base /slides/<slug>/` in `vedmich/slidev-theme-slurm/presentations/`, new push to `vedmichv/slidev:gh-pages`, uncomment CI whitelist for 2 slugs, submodule bump. User controls timing.
- **Ghost-deck content authoring** (karpenter-prod, eks-multi-az, mcp-platform, dkt-workflow): actual Slidev decks need to be written, built with correct `--base`, pushed, CI whitelist expanded. Some of these may correspond to real talks that were delivered but never got decks published.
- **Live `/slides/` E2E verification harness** (Playwright + curl script): belongs in the phase that migrates the first real deck. Pattern: hit `/slides/<slug>/`, assert 200 + assets resolve + SPA sub-navigation (`/slides/<slug>/2`) works.
- **GH Pages 404.html custom fallback for `/slides/<slug>/<slide>` deep links:** only needed if Slidev SPA router doesn't handle deep refreshes natively under the new base path. Test when first real deck is live.
- **Companion posts linking to `/slides/<slug>/`:** Phase 6 dependency (CONTENT-01/02/03). Not deferred-forever — just downstream.

### Reviewed Todos (not folded)

None — `gsd-sdk query todo.match-phase 5` returned zero matches for Phase 5.

</deferred>

---

*Phase: 5-Slidev-Integration*
*Context gathered: 2026-05-07*
