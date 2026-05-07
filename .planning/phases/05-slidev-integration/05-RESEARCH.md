# Phase 5: Slidev Integration - Research

**Researched:** 2026-05-07
**Domain:** Git submodule + GitHub Pages static-site composition (Astro 5 + pre-built Slidev SPA artifact)
**Confidence:** HIGH

## Summary

Phase 5 is an **infrastructure-only** wiring pass: the phase delivers the contract, pipeline, and runbook for serving Slidev decks under `vedmich.dev/slides/<slug>/`, but migrates **zero** decks in this phase per `05-CONTEXT.md §D-01`. The CONTEXT.md locks 17 decisions that together determine the submodule topology (`-b gh-pages` per D-02), the CI extension (`actions/checkout@v4 with submodules: recursive` + an *empty-whitelist* `cp -r` block per D-05/D-12), the code edits (PresentationCard + search-index URL rewrite per D-04/D-16; i18n subtitle per D-15; `draft: true` on all 6 MDX pairs per D-11), and the docs deliverables (`docs/slides-onboarding.md` + CLAUDE.md pointer per D-09; `vv-slidev/references/publish-to-vedmich-dev.md` with 3-way sync per D-10).

Architecture research is already complete (`.planning/research/ARCHITECTURE.md §Slidev Integration Architecture` recommended Option A; PITFALLS.md enumerates all relevant risks). This research therefore skips the "which approach" layer and focuses on **implementation-ready specifics** the planner will need: exact git submodule commands, the precise YAML delta for `.github/workflows/deploy.yml`, the state of every file CONTEXT.md references (verified by direct inspection), and the Validation Architecture for Nyquist Dimension 8 (smoke-level per D-14, since no deck migrates and no live route can be E2E-tested against real content).

**Critical finding from direct codebase inspection (good news, reduces scope):** every consumer of `getCollection('presentations')` — `src/components/Presentations.astro:13`, `src/pages/{en,ru}/presentations/index.astro:10`, `src/data/search-index.ts:26` — **already** filters `!data.draft`. The presentations schema in `src/content.config.ts:45` **already** has `draft: z.boolean().default(false)`. D-11 is therefore a **pure frontmatter edit** on 12 MDX files; no schema change, no consumer change is needed. Empty-state handling is needed only in `Presentations.astro` (for the 0-deck case — the current template renders a 0-card grid unconditionally).

**Critical finding from the live gh-pages branch:** the two live deck builds were re-built on 2026-03-03 with `--base /<slug>/` (NOT `/slides/<slug>/`) to match the `s.vedmich.dev` custom domain (slidev repo HEAD commit `1dfa2ec0`: "Fix base path for custom domain s.vedmich.dev"). Serving these under `vedmich.dev/slides/<slug>/` would produce broken assets — confirms D-01's "pipeline-only, no migration" scope. The 2 decks cannot be moved without a full rebuild in `vedmich/slidev-theme-slurm/`.

**Primary recommendation:** Follow CONTEXT.md decisions verbatim. The infrastructure is a textbook git-submodule-plus-whitelist-cp pattern; the risk surface is not the *how*, it is the *what-happens-when-the-whitelist-is-empty*. The planner should structure Phase 5 as a single-branch PR (per D-17 + CLAUDE.md Publishing Workflow "Big changes") with 3-4 plans: (A) submodule + CI + CLAUDE.md/docs, (B) code edits (PresentationCard + search-index + i18n + draft flips + Presentations empty-state), (C) skill 3-way-sync, (D) close Phase 5 in REQUIREMENTS/ROADMAP/STATE.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope & outcomes**
- **D-01:** Phase 5 is pipeline-only. NO real deck migration. Presentations section on homepage becomes empty (6 × draft:true). Confirmed on 2026-05-07: only 2/6 slugs have live builds anyway, and those 2 are built with `--base /<slug>/` (confirmed by inspecting `~/Documents/GitHub/vedmichv/slidev/slurm-prompt-engineering/index.html`) so they cannot serve under `/slides/` without a full rebuild. Rebuild is out of scope — user will handle deck migration in their own time.

**Ghost decks & MDX hygiene**
- **D-11:** Add `draft: true` to frontmatter in 12 files — `src/content/presentations/{en,ru}/{slurm-prompt-engineering, slurm-ai-demo, karpenter-prod, eks-multi-az, mcp-platform, dkt-workflow}.md`. Schema already supports `draft` (verified 2026-05-07 in `src/content.config.ts:45`).
- **D-03:** Do NOT delete the 4 ghost MDX files — preserve frontmatter (title, event, city, date, description, tags) for future real-deck authoring. `draft: true` hides them from homepage + `/presentations/` index.

**Submodule topology**
- **D-02:** `git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev`. Targets artifact branch directly. `vedmichv/slidev` default-branch is `gh-pages` (verified 2026-05-07 via `gh repo view`: `defaultBranchRef: {name: gh-pages}`; HEAD commit `1dfa2ec0`).
- **D-12:** Submodule is added now; CI copy step is written but with **commented-out whitelist** since no decks migrate in this phase. When the first real deck is ready, uncomment + add slug.
- **D-05:** Explicit `for slug in <list>; do cp -r slidev/$slug dist/slides/; done`. No auto-discover, no manifest.json. Adding a deck = one-line edit to `.github/workflows/deploy.yml`.
- **D-06:** After a new deck is pushed to `vedmichv/slidev:gh-pages`, author runs locally in `vedmich.dev`: `git submodule update --remote --merge slidev && git add slidev && git commit -m "chore(slides): bump <slug>" && git push`. Two push surfaces (slidev repo artifact + vedmich.dev submodule pointer). Covered by onboarding runbook.
- **D-07:** Max +5s over current ~90s CI baseline. `actions/checkout@v4 submodules: recursive` adds ~2s; whitelist `cp -r` of a couple of 5-MB deck dirs adds ~200 ms; empty whitelist adds 0 ms.

**URL routing & surface**
- **D-04:** `src/components/PresentationCard.astro:12-13` — `deckUrl` switches from `https://s.vedmich.dev/${slug}/` → `/slides/${slug}/`. Also drop or rewrite `displayUrl`. PresentationCard prefers `data.slides` (optional schema field) if set (external overrides like SpeakerDeck or user-hosted dist), otherwise computes `/slides/${slug}/`. Schema already has `slides: z.string().url().optional()` (verified 2026-05-07 in `src/content.config.ts:43`).
- **D-13:** Do NOT copy `vedmichv/slidev:gh-pages` root-level `404.html` (it's hardcoded for 2-segment `/slug/slide` path — breaks on new 3-segment `/slides/slug/slide`). Do NOT bundle a replacement in Phase 5 — verify in practice when first real deck ships. Slidev SPA's internal Vue Router handles most navigation via hash/history natively.

**i18n & search**
- **D-15:** `src/i18n/en.json:65` `speaking.subtitle` → remove `s.vedmich.dev` mention. `src/i18n/ru.json:65` mirror. Bilingual parity per CLAUDE.md constraint.

  **NOTE — naming drift in D-15:** the decision wording says "`speaking.subtitle`" but the actual location of the string is under `presentations.subtitle` (key `subtitle` inside the `presentations` block at line 65 of both files). `speaking.subtitle` at line 51 is a separate string ("30+ technical deep-dives per year. Speaker rating: 4.5–4.7/5.0") that does NOT contain `s.vedmich.dev`. Verified by direct grep 2026-05-07. The planner should edit `presentations.subtitle` and note this drift for the CONTEXT-D-15 correction.

- **D-16:** `src/data/search-index.ts:37` URL build switches from `https://s.vedmich.dev/${slug}` → `/slides/${slug}`. Same pattern as D-04.

**Docs & onboarding**
- **D-08:** Slidev `.md` sources live in theme repos (`vedmich/slidev-theme-slurm`, `vedmichv/slidev-theme-vv`, `DKT/slidev-theme-dkt`). Built dist artifacts go to `vedmichv/slidev:gh-pages`. Phase 5 does NOT consolidate or refactor this split.
- **D-09:** Full runbook at `docs/slides-onboarding.md` in vedmich.dev repo. Short pointer block `## Slidev Integration` added to `CLAUDE.md`.
- **D-10:** `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` is a short (30-50 LOC) pointer to `docs/slides-onboarding.md` as SSoT, plus quick commands inline. Three-way-sync mandatory: edit live skill first, mirror to `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/`, commit vault.

**Verification**
- **D-14:** Smoke-level. Exit criteria: (1) `npm run build` exits 0; (2) current unit test suite (69 tests) still green; (3) `git submodule status slidev/` shows initialized checkout at some SHA; (4) `grep -rn 's\.vedmich\.dev' src/` returns only results inside `src/content/presentations/` draft MDX frontmatter `slides:` URL overrides (if any survived) — zero after phase close in i18n files; (5) `docs/slides-onboarding.md` exists; (6) `CLAUDE.md` has new `## Slidev Integration` section. No live Playwright/curl — no deck to test against.

**Requirements traceability**
- **D-17:** SLIDES-01 shipped (pipeline exists, empty whitelist); SLIDES-02 shipped (single job); SLIDES-03 **deferred** (0/6 migrate); SLIDES-04 shipped (PresentationCard + search-index rewritten); SLIDES-05 **deferred** (user closes s.vedmich.dev manually); SLIDES-06 shipped (docs/slides-onboarding.md); CONTENT-04 shipped (vv-slidev skill reference).

### Claude's Discretion
- **Exact vault path for vv-slidev skill 3-way sync:** Claude follows the CLAUDE.md rule at `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/` — verified extant on 2026-05-07.
- **CI `actions/checkout@v4` submodule flag:** use `with: submodules: recursive` (cleanest per ARCHITECTURE.md Option A).
- **Empty-state copy for Presentations.astro:** pick pattern matching existing BlogPreview empty-state (`posts.length > 0` guard on title CTA + conditional render of grid, plus "Posts coming soon..." muted text — see `src/components/BlogPreview.astro:26-47`).
- **CLAUDE.md block exact copy + placement:** write in the tone of existing sections (e.g., `### Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)`).

### Deferred Ideas (OUT OF SCOPE)
- **SLIDES-05 s.vedmich.dev → 301 redirect** — user handles closure manually.
- **Actual Slurm deck migration** (`slurm-prompt-engineering`, `slurm-ai-demo` → `vedmich.dev/slides/`) — requires rebuild with `--base /slides/<slug>/` in `vedmich/slidev-theme-slurm/presentations/`, new push to `vedmichv/slidev:gh-pages`, uncomment CI whitelist for 2 slugs, submodule bump. User-controlled timing.
- **Ghost-deck content authoring** (karpenter-prod, eks-multi-az, mcp-platform, dkt-workflow) — actual decks need to be written, built, published.
- **Live `/slides/` E2E verification harness** (Playwright + curl script) — belongs in the phase that migrates the first real deck.
- **GH Pages 404.html custom fallback** for `/slides/<slug>/<slide>` deep links — only needed if Slidev SPA router doesn't handle deep refreshes natively under the new base path. Test when first real deck is live.
- **Companion posts linking to `/slides/<slug>/`** — Phase 6 dependency (CONTENT-01/02/03). Downstream, not deferred-forever.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SLIDES-01 | Submodule + CI extension builds decks into `dist/slides/<slug>/` | Standard Stack §Git Submodule + §GH Actions; Architecture Patterns §CI extension YAML delta; Code Examples §`git submodule add`; Runtime State Inventory confirms `.gitmodules` and `slidev/` do not yet exist |
| SLIDES-02 | Single GH Actions job | Architecture Patterns §Current workflow shape — current `deploy.yml` is already a single `build` job feeding `deploy`; the submodule step lands in `build` without splitting |
| SLIDES-03 | Migrate 6 decks | **Deferred per D-17.** Research confirms 2/6 live decks were built with `--base /<slug>/` (not `/slides/<slug>/`) — rebuild required, out of scope |
| SLIDES-04 | Rewrite internal deck URLs | Code Examples §PresentationCard.astro diff + §search-index.ts diff; verified every consumer already draft-filters |
| SLIDES-05 | s.vedmich.dev → 301 | **Deferred per D-17.** User-owned op-task |
| SLIDES-06 | `docs/slides-onboarding.md` runbook | Architecture Patterns §Recommended project structure; Code Examples §Full runbook outline; cross-reference with existing `vv-slidev/references/deployment.md` which covers the *slidev-repo side* of the flow |
| CONTENT-04 | `vv-slidev/references/publish-to-vedmich-dev.md` | Runtime State Inventory §Skill live location confirmed at `~/.claude/skills/vv-slidev/` + vault mirror path confirmed; Code Examples §Skill file outline |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Submodule checkout | CI / Build-time | Git | GitHub Actions `actions/checkout@v4` with `submodules: recursive` fetches pre-built SPA artifacts at build time; never at runtime |
| Whitelist cp to `dist/slides/` | CI / Build-time | — | Static-file composition happens between Astro build and Pages artifact upload; no runtime component |
| `/slides/<slug>/` serving | CDN / Static (GH Pages) | Browser / Client (Vue Router) | GH Pages serves SPA shell; Slidev's built-in Vue Router handles intra-deck navigation client-side |
| PresentationCard URL derivation | Astro SSR (build-time) | — | URL is computed at build time from collection entry id + optional `data.slides` override — zero runtime JS |
| search-index URL shape | Astro SSR (build-time) | Browser / Client (search modal) | `buildSearchIndex` runs at build-time, emits a JSON payload; search modal consumes URLs at runtime without mutation |
| Draft filtering | Astro SSR (build-time) | — | All 4 consumers of `getCollection('presentations')` already filter `!data.draft` — no runtime/browser code involved |
| Onboarding runbook | Human / Documentation | — | Static markdown; no code-level responsibility |
| Skill reference | Claude Code skill loader | Human / Docs | Loaded by Claude Code sessions via the skill system; mirrored to vault for QMD search |

**Why this matters:** Every Phase 5 change is either build-time (Astro SSR), CI-time (GH Actions), or static-docs. No browser-runtime code is added or modified (`/slides/*` sub-routes are Slidev's own SPAs — they ship as pre-built artifacts, not as Astro components). This confirms the ZeroJS budget is unchanged.

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | `^5.18.0` (`package.json:19`) | Static site generator; owns homepage, blog, presentations index, draft filtering | `[VERIFIED: codebase]` Current site-wide; zero-JS-by-default with MDX + Shiki |
| `@astrojs/mdx` | `^4.3.14` | MDX for presentations content collection | `[VERIFIED: codebase]` Required for the existing content collection schema |
| Git submodule | Git 2.50.1 | Track `vedmichv/slidev:gh-pages` from `vedmich.dev` superproject at the committed SHA | `[VERIFIED: `git submodule add -h`]` Native, no external dependency; branch-tracking via `.gitmodules branch = gh-pages` |
| `actions/checkout@v4` | v4 | Checkout superproject + submodules in CI | `[VERIFIED: `.github/workflows/deploy.yml:22`]` Already in use; `with: submodules: recursive` is the documented flag (Slidev docs mirror the same pattern per Context7 `/websites/sli_dev`) |
| `actions/upload-pages-artifact@v3` | v3 | Upload `dist/` to Pages | `[VERIFIED: `.github/workflows/deploy.yml:37`]` Already in use |
| `actions/deploy-pages@v4` | v4 | Deploy artifact to Pages | `[VERIFIED: `.github/workflows/deploy.yml:50`]` Already in use |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` | `^3.7.0` | Sitemap generator with filter for draft content | `[VERIFIED: codebase]` Already filters `__` prefix fixtures; verify it excludes draft presentations via the same pattern OR confirm draft pages don't emit URLs |
| zod (via `astro:content`) | transitive | Schema validation for presentations collection | `[VERIFIED: codebase]` `draft: z.boolean().default(false)` at `src/content.config.ts:45`; `slides: z.string().url().optional()` at `:43` |

### Alternatives Considered (from ARCHITECTURE.md — already decided)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Git submodule (Option A) | Reusable workflow + artifact fetch (Option B) | `[CITED: ARCHITECTURE.md §Slidev Integration Architecture]` 30-90s slower; cross-repo auth complexity; artifact retention 90d. **Locked out — D-02 chooses Option A.** |
| Git submodule (Option A) | Monorepo (Option C — Turborepo) | Heavy refactor; overkill for 2-3 decks. **Locked out.** |

**Installation:**
```bash
# Zero new npm dependencies
# Only CI + git metadata changes:
git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev
# Creates: .gitmodules, slidev/ directory (checkout of gh-pages at HEAD SHA 1dfa2ec0 as of 2026-05-07)
```

**Version verification** (2026-05-07):
- `vedmichv/slidev` default branch: `gh-pages` `[VERIFIED: gh repo view]`
- `vedmichv/slidev` HEAD SHA: `1dfa2ec0` ("Fix base path for custom domain s.vedmich.dev", 2026-03-03) `[VERIFIED: gh api repos/vedmichv/slidev/commits]`
- `vedmichv/slidev` repo size: ~34 MB total; local `.git`: 33 MB; two deck dirs ~14-15 MB each `[VERIFIED: du -sh]` — this is the submodule init cost
- `actions/checkout@v4` submodules flag syntax: `with: submodules: recursive` `[VERIFIED: Context7 /websites/sli_dev "GitHub Pages Deployment Workflow"]` (Slidev's own docs use the same pattern)

## Architecture Patterns

### System Architecture Diagram

```
                 ┌────────────────────────────────────┐
                 │ Author machine (vedmich.dev clone) │
                 │                                    │
                 │  git submodule update --remote     │
                 │  --merge slidev                    │
                 │  git commit -m "chore(slides):     │
                 │  bump <slug>"                      │
                 │  git push                          │
                 └─────────────┬──────────────────────┘
                               │
                               ▼
          ┌────────────────────────────────────────┐
          │ GitHub: vedmich.dev main branch        │
          │  (.gitmodules + slidev/ @ pinned SHA)  │
          └────────────────┬───────────────────────┘
                           │ push → triggers
                           ▼
  ┌────────────────────────────────────────────────────────────┐
  │ GitHub Actions: deploy.yml                                 │
  │                                                            │
  │  actions/checkout@v4                                       │
  │    with: {submodules: recursive}                           │
  │       │                                                    │
  │       ▼                                                    │
  │    [checkout: superproject + slidev/ @ pinned SHA]         │
  │       │                                                    │
  │       ▼                                                    │
  │    npm ci → npm run build → Astro writes dist/             │
  │       │                                                    │
  │       ▼                                                    │
  │    [new step] Copy Slidev decks to dist/slides/            │
  │       mkdir -p dist/slides                                 │
  │       # for slug in <whitelist>; do                        │
  │       #   cp -r slidev/$slug dist/slides/                  │
  │       # done                                               │
  │       ↑ empty whitelist in Phase 5                         │
  │       │                                                    │
  │       ▼                                                    │
  │    actions/upload-pages-artifact@v3 (dist/)                │
  │       │                                                    │
  │       ▼                                                    │
  │    actions/deploy-pages@v4                                 │
  └───────────────────────────┬────────────────────────────────┘
                              │
                              ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ GitHub Pages: vedmich.dev                                   │
  │                                                             │
  │  /en/*, /ru/*          — Astro-rendered static HTML         │
  │  /slides/<slug>/       — Pre-built Slidev SPA (future)      │
  │                                                             │
  │ PresentationCard href="/slides/<slug>/" →                   │
  │   Phase 5: 404 (deck not yet served)                        │
  │   Future:  Slidev SPA shell, Vue Router handles /1, /2, ... │
  └─────────────────────────────────────────────────────────────┘
```

Reader trace — Phase 5 primary use case (CI run with empty whitelist, no visible deck on site):
1. Author edits PresentationCard.astro + search-index.ts + 12 MDX files + i18n/* + CLAUDE.md + docs/slides-onboarding.md + `.github/workflows/deploy.yml`.
2. `git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev` creates `.gitmodules` + `slidev/` directory.
3. `git push` triggers the workflow.
4. CI checks out superproject + `slidev/` at pinned SHA `1dfa2ec0`.
5. Astro builds `dist/` (homepage has zero visible decks because all MDX are draft).
6. The new "Copy Slidev decks" step runs but does nothing (whitelist empty); `dist/slides/` is never created.
7. Pages artifact uploads → deploy.
8. `/slides/` route returns GitHub Pages' default 404 (no `dist/slides/` directory, no `dist/slides/index.html`). This is expected behaviour — see Pitfall 13 below.

### Recommended Project Structure

```
vedmich.dev/
├── .gitmodules                        ← new in Phase 5
├── .github/workflows/
│   └── deploy.yml                     ← edited: + submodules flag + cp step
├── slidev/                            ← new submodule (tracked, not checked into .gitignore)
│   ├── 404.html                       ← do NOT copy (D-13)
│   ├── CNAME                          ← do NOT copy (wrong domain)
│   ├── index.html                     ← do NOT copy (links to old /slug paths)
│   ├── slurm-prompt-engineering/      ← ~14 MB, whitelisted-only copy (Phase 5: NOT copied)
│   └── slurm-ai-demo/                 ← ~15 MB, whitelisted-only copy (Phase 5: NOT copied)
├── docs/
│   └── slides-onboarding.md           ← new in Phase 5 (D-09)
├── src/
│   ├── components/
│   │   ├── PresentationCard.astro     ← edited (D-04)
│   │   └── Presentations.astro        ← edited (empty-state when 0 non-draft decks)
│   ├── content/presentations/
│   │   ├── en/*.md (6 files)          ← edited (draft: true, D-11)
│   │   └── ru/*.md (6 files)          ← edited (draft: true, D-11)
│   ├── data/search-index.ts           ← edited (D-16)
│   └── i18n/
│       ├── en.json                    ← edited (D-15: presentations.subtitle at line 65)
│       └── ru.json                    ← edited (D-15: presentations.subtitle at line 65)
└── CLAUDE.md                          ← edited: + ## Slidev Integration section (D-09)

~/.claude/skills/vv-slidev/references/
└── publish-to-vedmich-dev.md          ← new (D-10, three-way sync target 1)

~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/
└── publish-to-vedmich-dev.md          ← new (D-10, three-way sync target 2)
```

### Pattern 1: Git submodule with branch tracking
**What:** Adopt a remote git repo as a subdirectory of the superproject, pinned to a specific commit SHA but tracking a named branch.
**When to use:** Here — we want to depend on `vedmichv/slidev:gh-pages` artifacts deterministically at a known SHA, but also want a clean workflow to bump the pointer when new decks land (`git submodule update --remote --merge slidev`).
**Example:**
```bash
# Source: [CITED: git-submodule(1) man page]
# -b gh-pages tells git to record `branch = gh-pages` in .gitmodules
# so --remote updates follow the gh-pages branch
git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev
```

Resulting `.gitmodules` file (exact shape per git-submodule docs):
```
[submodule "slidev"]
    path = slidev
    url = https://github.com/vedmichv/slidev.git
    branch = gh-pages
```

And a new line in `.git/config`:
```
[submodule "slidev"]
    url = https://github.com/vedmichv/slidev.git
    active = true
```

### Pattern 2: CI submodule checkout + whitelist composition
**What:** Check out the superproject AND the submodule in CI, run the Astro build, then copy whitelisted subdirectories of the submodule into the Astro `dist/` before artifact upload.
**When to use:** Deploying static files from multiple sources (Astro-generated + pre-built SPAs) to a single GH Pages artifact.
**Example** (exact delta against current `.github/workflows/deploy.yml`):
```yaml
# Source: [VERIFIED: codebase + Context7 /websites/sli_dev GH Pages deploy pattern]
# Before:
      - name: Checkout
        uses: actions/checkout@v4

# After:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

# And after the "Build Astro" step, BEFORE "Upload artifact":
      - name: Copy Slidev decks to dist/slides
        run: |
          mkdir -p dist/slides
          # Whitelist — uncomment slugs as decks migrate to vedmich.dev/slides/<slug>/.
          # Each line: cp -r slidev/<slug> dist/slides/
          # for slug in slurm-prompt-engineering slurm-ai-demo; do
          #   cp -r slidev/$slug dist/slides/
          # done
```

### Pattern 3: Astro collection draft filter (already in place)
**What:** Every consumer of `getCollection('presentations')` filters `!data.draft` in its loader callback, hiding draft entries from the homepage preview, the full index page, and the search modal.
**Evidence:**
```typescript
// Source: [VERIFIED: src/components/Presentations.astro:13-15]
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});
```
```typescript
// Source: [VERIFIED: src/pages/en/presentations/index.astro:10-12] (mirror: /ru/)
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});
```
```typescript
// Source: [VERIFIED: src/data/search-index.ts:26-28]
const decks = await getCollection('presentations', ({ id, data }) => {
  return !data.draft && id.startsWith(`${locale}/`);
});
```
**Implication for Phase 5:** Flipping 12 MDX frontmatter files to `draft: true` is the ENTIRE code change needed to hide the ghost decks. No filter code edits required.

### Anti-Patterns to Avoid

- **Copy root-level gh-pages files into `dist/slides/`** (D-13). Never `cp -r slidev/* dist/slides/` — that includes `404.html` (wrong path structure), `index.html` (wrong inter-deck links), and `CNAME` (wrong domain). Whitelist-only.
- **Auto-discover slug names from `slidev/` directory listing.** Tempting but fragile — a stray file or future `_tmp/` in the gh-pages branch would leak into `dist/slides/`. Explicit whitelist (D-05) is greppable and predictable.
- **Run `slidev build` in vedmich.dev CI.** Pitfall 3. `package.json` must NOT gain `@slidev/cli`, `vue`, or `slidev-theme-*`. Decks are artifacts, not sources.
- **Add `slidev/` to `.gitignore`.** It's a submodule; ignoring it breaks the superproject-to-submodule link.
- **Use `git submodule add` without `-b gh-pages`.** Without the branch flag, `.gitmodules` won't record `branch = gh-pages`, and `git submodule update --remote` won't know which branch to track — it defaults to the remote HEAD (which is `gh-pages` today, but relying on that is fragile).
- **Edit the *speaking*.subtitle i18n key** instead of *presentations*.subtitle. D-15's wording is ambiguous; the actual key containing `s.vedmich.dev` is `presentations.subtitle` at line 65 of both locale files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fetching pre-built Slidev artifacts at CI time | Custom `curl https://vedmichv.github.io/slidev/.../ --output ...` or `gh release download` | `git submodule add -b gh-pages` + `actions/checkout@v4 with: submodules: recursive` | `[CITED: ARCHITECTURE.md §Slidev Integration Architecture]` Submodule pins a specific SHA; curl-based fetches have no version pinning, no cache, and depend on GH Pages uptime during CI |
| Tracking which deck version is deployed | Manual JSON manifest ("versions.json") | Git submodule SHA — already stored in superproject tree at `git ls-tree HEAD slidev` | Single source of truth; `git log slidev` shows the bump history |
| Discovering which decks to copy in CI | `find slidev/ -name index.html -mindepth 2` or `ls slidev/*/package.json` | Explicit whitelist in `deploy.yml` (D-05) | `[CITED: D-05]` Auto-discover includes root-level `404.html`, `index.html`, `CNAME` and any stray files; whitelist is greppable |
| Filtering draft presentations from lists | Per-component `if (data.draft) return null` | `getCollection('presentations', ({data}) => !data.draft)` loader callback | `[VERIFIED: src/pages/**/presentations/index.astro]` Already in place in all 4 consumers |
| SPA hash/history routing under `/slides/<slug>/` | Custom GH Pages `404.html` | Slidev's built-in Vue Router | `[CITED: PITFALLS.md §Pitfall 10]` Slidev's SPA handles deep links natively when built with correct `--base`; a custom 404 is only needed for direct-link edge cases (test when first real deck migrates) |
| Generating the onboarding runbook from scratch | Freehand writing | Reuse structure from `diagrams-source/README.md` (Phase 4 runbook: Authoring / Metadata / Exporting / Embedding / Gotchas / Further reading) | `[VERIFIED: diagrams-source/README.md exists, 118 LOC, 6 H2 sections]` Well-received pattern per Phase 04.1 Plan 04 |

**Key insight:** Phase 5 is a composition problem, not a computation problem. The right primitives (git submodule, CI `cp -r`, Astro collection loaders) already exist and are already in use in this codebase or in standard GitHub Actions practice. The only net-new artifacts are three docs (CLAUDE.md section, `docs/slides-onboarding.md`, skill reference) + one YAML delta + one `.gitmodules` + one-line edits to 5 source files + frontmatter flips on 12 MDX files. Nothing is invented.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. The content collection's `id` field stores `en/<slug>` strings derived from filesystem paths — draft flag change is frontmatter only, doesn't touch `id`. Search index is rebuilt at every build from MDX — no persisted state. | **None.** |
| Live service config | Two parallel GH Pages deployments: (1) `vedmich.dev` served from `vedmichv/vedmich.dev:main`, (2) `s.vedmich.dev` served from `vedmichv/slidev:gh-pages` with CNAME. Phase 5 does NOT touch (2) per D-01 + SLIDES-05 deferral. DNS Route 53 has A records for `vedmich.dev` → GH IPs + `s.vedmich.dev` → `vedmichv.github.io` (per CLAUDE.md "Deployment §DNS"). Neither changes in Phase 5. | **None — verified by CLAUDE.md DNS table and D-01 scope lock.** |
| OS-registered state | None. No local services, cron, launchd, or similar OS-level registrations reference any renamed string. | **None — verified by nature of the change (pure static site + docs).** |
| Secrets / env vars | None. No env vars, no secrets store `s.vedmich.dev` or a deck URL. The `.github/workflows/deploy.yml` uses no secrets beyond the default `GITHUB_TOKEN` required by `actions/deploy-pages@v4`. The submodule is a public repo — no deploy key or PAT required for `actions/checkout@v4 with: submodules: recursive`. | **None.** |
| Build artifacts / installed packages | `dist/` rebuilds from source on every CI run — no stale artifact risk. `node_modules/` is not affected (zero new deps). The new `slidev/` directory is a submodule checkout, not a build artifact — `git submodule update --init --recursive` populates it from the remote pinned SHA. Local `dist/` on developer machines may exist from prior `npm run build` — not load-bearing. | **None — CI rebuild from source is the normal flow.** |

**The canonical question:** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?*

Answer: **Nothing inside vedmich.dev's scope.** The only external system that still embeds the old string is the `vedmichv/slidev:gh-pages` branch itself (its `404.html`, `CNAME = s.vedmich.dev`, and `index.html` list `./<slug>/` links). These are **out of scope** for Phase 5 — they belong to SLIDES-05 (deferred, user-owned). Any external backlinks on the open web pointing at `s.vedmich.dev/<slug>/` continue to work via the existing CNAME until the user manually closes that surface.

## Common Pitfalls

### Pitfall 1: Confusing the two "subtitle" i18n keys
**What goes wrong:** D-15 says "update `speaking.subtitle`" — but the `s.vedmich.dev` string is actually in `presentations.subtitle` (line 65 of both `en.json` / `ru.json`). Editing `speaking.subtitle` (line 51) leaves the domain reference on the homepage.
**Why it happens:** D-15 wording in CONTEXT.md says "speaking" but the grep hit and the functional placement is in the `presentations` i18n block.
**How to avoid:** The planner must specify `presentations.subtitle` as the target. Detection: `grep -n s.vedmich.dev src/i18n/*.json` — it's at line 65 under `presentations`, not `speaking`.
**Warning signs:** Verifier runs `grep -rn 's\.vedmich\.dev' src/` after the phase and finds a surviving hit in `src/i18n/en.json:65` — indicates the wrong key was edited.

### Pitfall 2: Empty whitelist producing no `dist/slides/` at all
**What goes wrong:** The CI step `mkdir -p dist/slides` succeeds with the commented-out whitelist, but since no deck is copied, `dist/slides/` is an empty directory. On GH Pages, an empty directory is NOT served — there is no `/slides/` route. Navigating to `vedmich.dev/slides/` returns the default GH Pages 404. Navigating to `vedmich.dev/slides/anything/` returns the same 404.
**Why it happens:** Intentional in Phase 5 per D-01 (no deck migrates). But a reviewer might expect `/slides/` to render "something" — e.g. an index page listing available decks.
**How to avoid:** Document this expectation in the phase SUMMARY and in the onboarding runbook. No action needed for the code — it's the desired state. Detection: `curl -I https://vedmich.dev/slides/` should return `404` after deploy; this is NOT a regression.
**Warning signs:** A human review question like "why doesn't `/slides/` work?" — answer: "it will work when the first deck migrates; until then it's a reserved namespace."

### Pitfall 3: Rebuilding Slidev decks on every main site deploy
**What goes wrong:** `[CITED: PITFALLS.md §Pitfall 3]` Running `slidev build` in vedmich.dev CI adds 10-30 s per deck; for 10 decks, CI goes from 2 min → 5+ min. Main site `package.json` pollutes with `@slidev/cli`, `vue`, theme packages.
**Why it happens:** Misunderstanding the artifact-vs-source split.
**How to avoid:** Never add Slidev packages to `package.json`. The submodule is the artifact store; `cp -r` is the only build-time operation.
**Warning signs:** `grep -i slidev package.json` returns a hit (other than in `scripts/` comments); CI time crosses 3 min.

### Pitfall 4: Forgetting `-b gh-pages` on `git submodule add`
**What goes wrong:** `git submodule add <url> slidev` without `-b gh-pages` creates a `.gitmodules` that has NO `branch = gh-pages` line. Later, `git submodule update --remote slidev` fetches the remote HEAD — which today happens to be `gh-pages` (since it's the default branch), but if the repo's default branch ever changes, the pointer will silently follow the new default.
**Why it happens:** Easy to miss the flag; `git submodule add` works either way.
**How to avoid:** Verify `.gitmodules` contains `branch = gh-pages` after the add; verify `git submodule update --remote --merge slidev` pulls from the correct branch.
**Warning signs:** `grep -A3 slidev .gitmodules` shows no `branch = gh-pages` line. `git config -f .gitmodules --get submodule.slidev.branch` returns nothing.

### Pitfall 5: Three-way-sync drift on `vv-slidev` skill
**What goes wrong:** `[CITED: ~/.claude/CLAUDE.md §Skill updates — three-way sync]` Edit live skill at `~/.claude/skills/vv-slidev/`, forget to mirror to vault at `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/`. Next time Viktor works on the skill from the vault side, he sees stale content.
**Why it happens:** `cp -R` trailing-slash gotcha on macOS. The CLAUDE.md rule shows the gotcha explicitly.
**How to avoid:** Use the exact form from CLAUDE.md: `cp -R ~/.claude/skills/vv-slidev ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/` — no trailing slash on source. Or use an explicit file path: `cp ~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/`.
**Warning signs:** `diff -r ~/.claude/skills/vv-slidev ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev` returns differences after the mirror step.

### Pitfall 6: Sitemap still listing ghost-deck URLs
**What goes wrong:** `[VERIFIED: astro.config.mjs:56]` The current sitemap filter is `page => !/\/blog\/__/.test(page)` — it excludes `__fixture-*` blog pages but does NOT filter by presentations draft status. After flipping 12 MDX to draft:true, the draft-flagged pages may still appear in the sitemap if Astro emits them at any route.
**Why it happens:** Astro builds draft pages into `dist/` by default. The sitemap integration doesn't know about the `draft` field. This is the EXACT scenario `astro.config.mjs:54-55` comments warn about for the blog collection.
**How to avoid:** Verify that presentations are NOT routed to per-deck pages (they are listed on `src/pages/{en,ru}/presentations/index.astro` as cards only — there is no `/presentations/<slug>` route). If verified, draft flipping produces no orphan URLs. If Phase 5 adds a per-deck route (it does NOT per CONTEXT.md), extend the sitemap filter.
**Warning signs:** `dist/sitemap-*.xml` contains any deck-slug URLs after the build.

### Pitfall 7: Submodule drift between superproject branches
**What goes wrong:** Working on a feature branch `feat/slidev-integration`, you bump the submodule pointer. Switching to `main` (or merging) creates a stale `slidev/` directory state. `git status` shows `slidev/` as modified without showing what changed.
**Why it happens:** Submodules track commits, not branches — checking out `main` doesn't automatically run `git submodule update` to re-sync `slidev/` to the main-side pinned SHA.
**How to avoid:** After every branch switch, run `git submodule update --init --recursive`. Document this in the onboarding runbook.
**Warning signs:** `git status` shows `modified: slidev (new commits)` immediately after `git checkout main`.

### Pitfall 8: PresentationCard external-URL override semantics
**What goes wrong:** D-04 says "PresentationCard prefers `data.slides` if set (for external overrides like SpeakerDeck)". If the implementation writes `data.slides ?? \`/slides/${slug}/\``, an existing MDX with `slides: "https://s.vedmich.dev/..."` will CONTINUE to render the s.vedmich.dev link — potentially surviving the D-14 grep check.
**Why it happens:** The 12 MDX files all carry `slides: "https://s.vedmich.dev/<slug>/"` today. After draft flipping, they are hidden, but if any ghost-deck MDX is un-drafted in the future without also removing/updating the `slides:` URL, the card will point at the old domain.
**How to avoid:** (a) In Phase 5, when flipping to `draft: true`, consider whether to also clear the `slides:` field to the empty string or remove it — verify with the planner whether D-11 + D-03 intend to keep the URL for "future authoring" or clear it. (b) The D-14 grep check MUST scope `s.vedmich.dev` hits to i18n + components + search-index; hits inside draft MDX frontmatter are permitted only if D-03 explicitly accepts them.
**Warning signs:** `grep -rn 's\.vedmich\.dev' src/` after the phase returns hits in `src/content/presentations/**`.

### Pitfall 9: Large submodule impact on shallow clones
**What goes wrong:** `vedmichv/slidev`'s local `.git` is ~33 MB. CI clones use `actions/checkout@v4` which defaults to a shallow fetch (`fetch-depth: 1`) — but the submodule flag triggers `git submodule update --init --recursive` which does NOT inherit the shallow depth by default. A full submodule clone is ~33 MB + ~30 MB working tree.
**Why it happens:** GH Actions submodule flag is broadly documented but shallow-vs-deep semantics are subtle.
**How to avoid:** Accept the ~30 MB overhead per build; this is within D-07's "+5 s" budget (~1-2 s on fast GH runners). If budget becomes a concern, add `fetch-depth: 1` on submodules via `with: submodules: recursive\nfetch-depth: 1` — but verify no regression first.
**Warning signs:** CI time jumps more than +5 s over baseline.

## Code Examples

### Exact git submodule add command

```bash
# Source: [CITED: git-submodule(1) + D-02]
# Run from vedmich.dev repo root. Creates .gitmodules + slidev/ directory.
git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev

# Verify:
git config -f .gitmodules --get submodule.slidev.branch  # should print: gh-pages
git config -f .gitmodules --get submodule.slidev.url     # should print: https://github.com/vedmichv/slidev.git
git config -f .gitmodules --get submodule.slidev.path    # should print: slidev
ls slidev/                                                # should list: 404.html CNAME index.html slurm-ai-demo slurm-prompt-engineering
git submodule status                                      # should print:  <SHA> slidev (heads/gh-pages)
```

Resulting `.gitmodules` (byte-exact):
```
[submodule "slidev"]
	path = slidev
	url = https://github.com/vedmichv/slidev.git
	branch = gh-pages
```
(Tab-indented; git writes tabs by default.)

### Exact `.github/workflows/deploy.yml` delta

Before (current 50 LOC file):
```yaml
# Source: [VERIFIED: .github/workflows/deploy.yml lines 20-40]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

After (with both edits — submodule flag + cp step):
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro
        run: npm run build

      - name: Copy Slidev decks to dist/slides
        run: |
          mkdir -p dist/slides
          # Whitelist — uncomment a line as each deck migrates to vedmich.dev/slides/<slug>/.
          # The deck must be pre-built in vedmichv/slidev:gh-pages with
          # `slidev build --base /slides/<slug>/` (NOT just --base /<slug>/).
          # See docs/slides-onboarding.md for the full flow.
          # for slug in slurm-prompt-engineering slurm-ai-demo; do
          #   cp -r slidev/$slug dist/slides/
          # done

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

### Exact `PresentationCard.astro` diff

```astro
// Source: [VERIFIED: src/components/PresentationCard.astro:11-13]
// Before:
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = `https://s.vedmich.dev/${slug}/`;
const displayUrl = `s.vedmich.dev/${slug}`;

// After (D-04, with data.slides override):
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = data.slides ?? `/slides/${slug}/`;
// displayUrl: choose ONE of:
//  (a) Drop entirely — the row at lines 41-44 that renders {displayUrl} gets removed
//  (b) Show derived path: `vedmich.dev/slides/${slug}` (matches previous s.vedmich.dev/${slug} style)
// Claude's discretion per CONTEXT.md. Recommend (b) for visual continuity.
const displayUrl = `vedmich.dev/slides/${slug}`;
```

**Planner note on `data.slides` semantics:** if a presentation has `slides: "https://external.example.com/deck/"` in its frontmatter, that URL wins. If `slides:` is absent, fall back to the computed internal path. This preserves the ability to link to external-hosted decks (SpeakerDeck, Notist, etc.) in future.

### Exact `search-index.ts` diff

```typescript
// Source: [VERIFIED: src/data/search-index.ts:30-42]
// Before:
const slideItems: SearchItem[] = decks.map((entry) => {
  const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
  const dateStr = entry.data.date.toISOString().slice(0, 10);
  return {
    kind: 'slides',
    title: entry.data.title,
    sub: `${dateStr} · ${entry.data.event}`,
    url: `https://s.vedmich.dev/${slug}`,
    tags: entry.data.tags,
    body: entry.data.description,
    date: dateStr,
  };
});

// After (D-16, symmetric with D-04 for data.slides override):
const slideItems: SearchItem[] = decks.map((entry) => {
  const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
  const dateStr = entry.data.date.toISOString().slice(0, 10);
  return {
    kind: 'slides',
    title: entry.data.title,
    sub: `${dateStr} · ${entry.data.event}`,
    url: entry.data.slides ?? `/slides/${slug}/`,
    tags: entry.data.tags,
    body: entry.data.description,
    date: dateStr,
  };
});
```

Note the trailing slash on `/slides/${slug}/` — the old URL had NO trailing slash (`https://s.vedmich.dev/${slug}`). Adding the slash is consistent with GH Pages directory serving and with D-04's `/slides/${slug}/` pattern.

### Exact i18n subtitle edits

```jsonc
// Source: [VERIFIED: src/i18n/en.json:63-67]
// Before:
"presentations": {
  "title": "Recent decks",
  "subtitle": "{N} talks · all slides at s.vedmich.dev",
  "all_decks": "All decks"
}
// After (D-15):
"presentations": {
  "title": "Recent decks",
  "subtitle": "{N} talks · all on vedmich.dev/slides",
  "all_decks": "All decks"
}
```

```jsonc
// Source: [VERIFIED: src/i18n/ru.json:63-67]
// Before:
"presentations": {
  "title": "Свежие доклады",
  "subtitle": "{N} докладов · все слайды на s.vedmich.dev",
  "all_decks": "Все доклады"
}
// After (D-15):
"presentations": {
  "title": "Свежие доклады",
  "subtitle": "{N} докладов · все на vedmich.dev/slides",
  "all_decks": "Все доклады"
}
```

### Exact frontmatter flip (12 MDX files)

```yaml
# Source: [VERIFIED: src/content/presentations/en/slurm-prompt-engineering.md]
# Template — apply to all 12 files ({en,ru}/{slurm-prompt-engineering, slurm-ai-demo,
# karpenter-prod, eks-multi-az, mcp-platform, dkt-workflow}).
---
title: "..."
event: "..."
city: null
date: 2026-02-14
description: "..."
tags: [...]
slides: "https://s.vedmich.dev/<slug>/"   # D-03: preserve for future real-deck authoring
draft: true                                 # ← this line is new; D-11
---
```

**Planner note:** `slides:` URL preservation is intentional per D-03 (frontmatter skeleton retained) but creates a tension with D-14 verification (grep for `s.vedmich.dev` should return zero hits in `src/`). Recommend the planner either (a) explicitly scope D-14 grep to `src/` excluding `src/content/presentations/`, or (b) strip the `slides:` field as part of the draft flip and re-add when the deck is authored.

### `Presentations.astro` empty-state addition

```astro
// Source: [VERIFIED: src/components/Presentations.astro:24-52 current shape]
// Current template assumes homepageDecks.length > 0. After D-11, it's 0.
// Suggested pattern mirrors BlogPreview.astro:36-47:

<section id="presentations" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
    <div class="flex items-baseline justify-between gap-6 mb-2 animate-on-scroll">
      <h2 class="font-display text-3xl font-bold">{i.presentations.title}</h2>
      {totalCount > 0 && (
        <a
          href={`/${locale}/presentations`}
          class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
        >
          {i.presentations.all_decks} →
        </a>
      )}
    </div>
    {totalCount > 0 ? (
      <>
        <p class="text-text-muted mb-12 animate-on-scroll">{subtitle}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-on-scroll-stagger">
          {homepageDecks.map((deck) => (
            <PresentationCard deck={deck} />
          ))}
        </div>
        <div class="mt-10 animate-on-scroll">
          <a
            href={`/${locale}/presentations`}
            class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
          >
            {i.presentations.all_decks} →
          </a>
        </div>
      </>
    ) : (
      <p class="text-text-muted animate-on-scroll">
        {locale === 'ru' ? 'Слайды появятся скоро...' : 'Decks coming soon...'}
      </p>
    )}
  </div>
</section>
```

**Planner note:** empty-state copy is bilingual hardcoded inline (matching BlogPreview). Could be i18n'd as `presentations.coming_soon` if the planner prefers — either pattern is acceptable per Phase 3 precedent.

### Runbook outline: `docs/slides-onboarding.md`

```markdown
# Slidev Deck Onboarding — vedmich.dev/slides/<slug>/

Source: [CITED: D-09 — full runbook]

## When to use this flow
<!-- Context — what problem this solves -->

## Prerequisites
<!-- vedmichv/slidev cloned, theme repo cloned, vedmich.dev checked out -->

## Step 1: Build the deck with the correct --base
<!-- slidev build --base /slides/<slug>/  (trailing slash required) -->
<!-- Context7-verified: `slidev build --base /talks/my-cool-talk/` pattern from Slidev hosting docs -->

## Step 2: Publish the dist to vedmichv/slidev:gh-pages
<!-- Refers to vv-slidev skill references/deployment.md for the rename-slot pattern -->

## Step 3: Pump the submodule in vedmich.dev
<!-- git submodule update --remote --merge slidev -->
<!-- git add slidev && git commit -m "chore(slides): bump <slug>" && git push -->

## Step 4: Uncomment the slug in .github/workflows/deploy.yml
<!-- One-line edit — append to the whitelist loop -->

## Step 5: (Optional) Un-draft the MDX
<!-- Flip draft: false in src/content/presentations/{en,ru}/<slug>.md -->
<!-- Optionally remove or update the `slides:` external URL -->

## Step 6: Verify
<!-- npm run build → check dist/slides/<slug>/ exists -->
<!-- After push, curl https://vedmich.dev/slides/<slug>/ and check 200 + assets -->
<!-- Test Vue Router: navigate to /slides/<slug>/5 -->

## Gotchas
<!-- --base flag must have trailing slash -->
<!-- Don't copy 404.html / CNAME / index.html from slidev/ root -->
<!-- package.json must NOT get @slidev/cli (it's an artifact, not a source) -->

## Further reading
<!-- Links to vv-slidev skill, Slidev hosting docs, .planning/research/* -->
```

Target length: 150-200 LOC (similar to `diagrams-source/README.md` which is 118 LOC with 6 H2 sections).

### `vv-slidev/references/publish-to-vedmich-dev.md` outline

```markdown
# Publishing a deck to vedmich.dev/slides/<slug>/

Short pointer to `docs/slides-onboarding.md` in vedmich.dev repo — that's the SSoT.

## TL;DR
[4-line summary of the flow]

## Quick commands

# In slidev-theme-vv:
pnpm slidev build presentations/<slug>/slides.md --base /slides/<slug>/

# In vedmichv/slidev (gh-pages branch):
rm -rf <slug> && cp -r ~/Documents/GitHub/vedmichv/slidev-theme-vv/dist <slug>
git add <slug> && git commit -m "deploy: <slug>" && git push

# In vedmich.dev:
git submodule update --remote --merge slidev
git add slidev && git commit -m "chore(slides): bump <slug>"
# Then uncomment <slug> in .github/workflows/deploy.yml
git push

## Full workflow
See `docs/slides-onboarding.md` in `vedmichv/vedmich.dev` repo.

## Related skill references
- `references/deployment.md` — the gh-pages side (slidev-theme → slidev repo)
- `references/architecture-grid.md` — deck authoring
```

Target length: 30-50 LOC per D-10. Single source of truth is `docs/slides-onboarding.md`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Serve Slidev decks from separate subdomain `s.vedmich.dev` with its own GH Pages + CNAME | Serve under `vedmich.dev/slides/<slug>/` via git submodule + whitelist cp at main-site CI time | Phase 5 (Pipeline now, content migration later) | Unified domain, better for SEO and brand cohesion; external backlinks preserved via deferred SLIDES-05 redirect |
| Build Slidev decks in main-site CI (hypothetical pattern rejected) | Pre-build in separate `vedmichv/slidev` repo, commit dist to `gh-pages` branch, submodule from main site | Phase 5 (this is the foundational decision from ARCHITECTURE.md Option A) | CI budget preserved at ~90s + ~2-5s; no Slidev deps in main-site package.json |
| Explicit `git submodule update --init` step as a separate CI step | `actions/checkout@v4 with: submodules: recursive` in the same checkout step | Phase 5 | `[CITED: Context7 /websites/sli_dev "GitHub Pages Deployment Workflow"]` Fewer CI steps; Slidev's own docs use this pattern |

**Deprecated / outdated:**
- **`vv-slidev/references/deployment.md`** describes deploying to `https://vedmichv.github.io/slidev/<slug>/` — this path is *still valid* (via `s.vedmich.dev` CNAME) but becomes *secondary* to `vedmich.dev/slides/<slug>/` after Phase 5. The new `publish-to-vedmich-dev.md` complements (not replaces) the existing deployment.md. Plan to keep both during the transition; the existing reference still documents the slidev-repo side correctly.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `[ASSUMED]` `actions/checkout@v4` with `submodules: recursive` does a shallow submodule clone by default | Common Pitfalls §Pitfall 9 | CI time may be longer than the stated +2 s if the submodule clone is actually deep by default — verify empirically after first CI run. If too slow, add explicit `fetch-depth: 1` per the GitHub Actions docs |
| A2 | `[ASSUMED]` The GH Pages 404 behaviour for an empty `dist/slides/` directory is "return GitHub's default 404 page" — not a server error | Common Pitfalls §Pitfall 2 | If GH Pages returns a 500 or otherwise breaks, the empty-whitelist strategy needs a placeholder `dist/slides/index.html`. Verify post-deploy by `curl -I https://vedmich.dev/slides/` |
| A3 | `[ASSUMED]` `Presentations.astro` empty-state pattern `(totalCount === 0) => show "Decks coming soon..."` matches Deep Signal design expectations | Code Examples §Presentations.astro empty-state | Minor — pattern is copied verbatim from BlogPreview which already shipped. Visual nit at most |
| A4 | `[ASSUMED]` Preserving `slides:` URL as `https://s.vedmich.dev/...` in draft MDX (per D-03) is compatible with D-14 verification | Code Examples §MDX frontmatter flip + Pitfall 8 | If D-14 grep is run without scoping to exclude draft MDX, the phase exit gate will fail. Either scope the grep or strip the URL — planner must decide |
| A5 | `[ASSUMED]` Sitemap filter does NOT need updating because presentations have no per-deck route (`/presentations/<slug>` does not exist) | Common Pitfalls §Pitfall 6 | If a future phase adds per-deck routes, sitemap orphan URLs appear. Not a Phase 5 risk |

**If this table has 5 items:** 5 `[ASSUMED]` claims, all low-risk, all verifiable either during Wave 0 (A2, A3, A5) or by empirical CI run (A1, A4). None blocks planning.

## Open Questions

1. **Should the Phase 5 plan scope the D-14 grep to exclude `src/content/presentations/` draft MDX?**
   - What we know: D-03 preserves `slides:` URLs in draft MDX for future re-authoring. D-14 says grep should return "only results inside `src/content/presentations/` draft MDX frontmatter `slides:` URL overrides (if any survived)".
   - What's unclear: D-14 says "if any survived" — implying the expectation is zero. But D-03 says "preserve frontmatter" — implying they're retained.
   - Recommendation: Planner should resolve by adding a scope to the grep (`grep -rn s.vedmich.dev src/ --exclude-dir=content`) OR by flipping the frontmatter to strip `slides:` on the draft. Note for planner/discuss-phase to confirm with user.

2. **Should the CLAUDE.md existing `s.vedmich.dev` references (lines 123, 270, 314, 320, 321) be rewritten in the same CLAUDE.md edit that adds `## Slidev Integration`?**
   - What we know: `grep -n s.vedmich.dev CLAUDE.md` returns 5 hits — including the "Current presentations are hosted at `s.vedmich.dev`" line and the Slidev Presentations Integration table.
   - What's unclear: D-09 says "add a short pointer block `## Slidev Integration`" — doesn't say whether to rewrite existing references.
   - Recommendation: Treat CLAUDE.md as "add new section + sweep existing `s.vedmich.dev` mentions for consistency" in the same task. This is a single-file edit, low risk.

3. **Is there any concern about GH Actions cache invalidation if the submodule SHA changes?**
   - What we know: `actions/setup-node@v4 with: cache: npm` caches `node_modules`. Submodule changes don't affect npm cache, but they may affect how Astro processes the `slidev/` directory if a future build step traverses it.
   - What's unclear: Whether `astro build` traverses the `slidev/` directory (shouldn't — it's outside `src/` and `public/`, and the `cp -r` step runs AFTER `astro build`).
   - Recommendation: Verify by running `ls -la dist/` in CI after the Astro build step to confirm `dist/slides/` is NOT created by Astro. If it is, move the cp step or add `slidev/` to astro ignore. No known risk.

4. **Does flipping all 6 MDX to draft risk breaking the `/[locale]/presentations/` index page?**
   - What we know: The index page's loader is `allDecks = getCollection('presentations', ({data, id}) => id.startsWith(`${locale}/`) && !data.draft)`. With all drafts, `allDecks` is empty array.
   - What's unclear: Whether the page gracefully renders an empty grid or breaks.
   - Recommendation: Wave 0 smoke test — `npm run build` locally after draft flip, navigate to `/en/presentations/` in `npm run preview`, verify page renders. Page structure at `src/pages/en/presentations/index.astro:37-41` is `<div class="grid">{decks.map(...)}</div>` — an empty grid is a valid render, no exception expected. Low risk but should be verified.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `git` | `git submodule add` | ✓ | 2.50.1 (Apple Git-155) | — |
| `node` | `npm run build` | ✓ | 25.9.0 (CI uses 22) | — |
| `npm` | `npm ci` | ✓ | 11.12.1 | — |
| `gh` CLI | Verify remote state during research | ✓ | Works (used for repo probing 2026-05-07) | — |
| `playwright` | Existing visual test infra | ✓ (per `package.json:33` `@playwright/test ^1.59.1`) | — | — (unused in Phase 5 smoke scope) |
| Network access to `github.com/vedmichv/slidev.git` | `git submodule add` + `actions/checkout submodules: recursive` | ✓ (public repo, `gh api repos/vedmichv/slidev` succeeded) | — | — |
| `~/.claude/skills/vv-slidev/` directory | D-10 live skill edit | ✓ | Exists with `SKILL.md` + `references/` subdir as of 2026-05-07 | — |
| `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/` (vault mirror) | D-10 three-way sync | ✓ | Exists with `SKILL.md` + `LESSONS.md` + `references/` subdir as of 2026-05-07 | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

Every dependency Phase 5 needs is already installed and at a workable version. The only "new" element is the submodule itself, which is public and accessible.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (Node 25 built-in, via `node --experimental-strip-types --test`) — unit tests; `@playwright/test` ^1.59.1 — visual/integration tests |
| Config file | `playwright.config.ts` (visual), none needed for node:test (pattern in `package.json:11`) |
| Quick run command | `npm run test:unit` (~18 s wall time, 69 tests) |
| Full suite command | `npm run test:unit && npm run build` (test + smoke build) |
| Phase gate | All 69 existing unit tests green + `npm run build` exit 0 + `git submodule status slidev/` shows initialized |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SLIDES-01 | `.gitmodules` present and correctly configured | smoke (grep) | `test "$(git config -f .gitmodules --get submodule.slidev.branch)" = "gh-pages"` | N/A (runtime assertion) |
| SLIDES-01 | `.github/workflows/deploy.yml` has `submodules: recursive` | smoke (grep) | `grep -A1 'uses: actions/checkout@v4' .github/workflows/deploy.yml \| grep -q 'submodules: recursive'` | ✅ existing workflow |
| SLIDES-01 | `.github/workflows/deploy.yml` has the Copy Slidev decks step | smoke (grep) | `grep -q 'Copy Slidev decks to dist/slides' .github/workflows/deploy.yml` | ✅ existing workflow |
| SLIDES-02 | Single GH Actions job topology preserved | smoke (yaml inspection) | `grep -c '^  [a-z]*:$' .github/workflows/deploy.yml` returns `2` (build + deploy — unchanged from baseline) | ✅ existing workflow |
| SLIDES-03 | **Deferred** — no test (0/6 migrate) | manual | — | — |
| SLIDES-04 | `PresentationCard.astro` emits `/slides/<slug>/` URL shape | smoke (grep) | `grep -q '/slides/\${slug}/' src/components/PresentationCard.astro` | ✅ will exist after phase |
| SLIDES-04 | `search-index.ts` emits `/slides/<slug>/` URL shape | smoke (grep) | `grep -q '/slides/\${slug}/' src/data/search-index.ts` | ✅ existing file |
| SLIDES-04 | All 6 presentations in both locales set `draft: true` | smoke (grep) | `grep -l 'draft: true' src/content/presentations/en/*.md \| wc -l` returns `6`; same for `/ru/` | ✅ existing files (will flip in phase) |
| SLIDES-04 | Zero remaining `s.vedmich.dev` in i18n + components + search-index | smoke (grep) | `grep -rn 's\.vedmich\.dev' src/i18n/ src/components/ src/data/` returns empty | ✅ scope already narrow |
| SLIDES-05 | **Deferred** — no test | manual | — | — |
| SLIDES-06 | `docs/slides-onboarding.md` exists and has ≥150 LOC | smoke (file check) | `test $(wc -l < docs/slides-onboarding.md) -ge 150` | ❌ Wave 0 must create |
| SLIDES-06 | `CLAUDE.md` has `## Slidev Integration` H2 | smoke (grep) | `grep -q '^## Slidev Integration' CLAUDE.md` | ✅ existing file (section added in phase) |
| CONTENT-04 | `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` exists | smoke (file check) | `test -f ~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` | ❌ Wave 0 must create |
| CONTENT-04 | Vault mirror of above exists | smoke (file check) | `test -f ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md` | ❌ mirror step must create |
| Regression: build green | `npm run build` exits 0 and emits `dist/` | smoke (exit code) | `npm run build && test -d dist` | ✅ existing infra |
| Regression: test suite green | All 69 unit tests still pass | automated | `npm run test:unit` | ✅ 69 tests currently green (verified 2026-05-07) |
| Regression: no Slidev deps leaked into package.json | Main site has no `@slidev/*`, `vue`, or `slidev-theme-*` | smoke (grep) | `! grep -iE '"(@slidev/\|slidev-theme\|^vue)"' package.json` | ✅ current state |
| Regression: dist does not contain Slidev deck artifacts | With empty whitelist, `dist/slides/` either does not exist or is empty | smoke (filesystem) | `! test -d dist/slides \|\| test -z "$(ls -A dist/slides)"` | ✅ expected behaviour |
| Bilingual parity | i18n edits land in both en + ru | smoke (grep) | `grep -q 'vedmich.dev/slides' src/i18n/en.json && grep -q 'vedmich.dev/slides' src/i18n/ru.json` | ✅ keys exist |

### Sampling Rate
- **Per task commit:** `npm run test:unit` — fast, 18 s, covers all 69 existing assertions
- **Per wave merge:** `npm run test:unit && npm run build` — adds ~2 s for full build
- **Phase gate:** Full suite green + all smoke grep assertions above pass + `git submodule status slidev/` shows initialized checkout at `1dfa2ec0` (or a later SHA) — before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `docs/slides-onboarding.md` — covers SLIDES-06 (does not exist; Phase 5 must create)
- [ ] `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` — covers CONTENT-04 (does not exist; Phase 5 must create)
- [ ] Vault mirror of `publish-to-vedmich-dev.md` — covers CONTENT-04 three-way sync (does not exist; Phase 5 must create)
- [ ] `.gitmodules` — covers SLIDES-01 (does not exist; created by `git submodule add`)
- [ ] `slidev/` submodule directory — covers SLIDES-01 (does not exist; created by `git submodule add`)

**Framework install gap:** None. All test infrastructure is installed and green (69/69 pass as of 2026-05-07 17:29 local time).

**Rationale for smoke-level scope (per D-14):**
Phase 5 is infrastructure-only and migrates zero decks. There is no live `/slides/<slug>/` route to exercise via Playwright — the E2E harness for real-deck serving is explicitly deferred to the phase that migrates the first real deck. Smoke-level validation (grep assertions + build exit code + submodule status + unit test regression) is appropriate for the "empty pipeline" contract this phase ships. When a deck later migrates, the phase that does so should add a live curl/Playwright harness per the Deferred Ideas list.

**The Nyquist argument:** the minimum sampling rate to detect Phase 5 regressions is "did any edit produce a change that can't be verified by grep or build-exit-code?" The answer is no — every change (12 frontmatter flips, 2 URL rewrites, 1 i18n edit, 1 CI YAML extension, 1 submodule add, 2 docs creations, 1 skill file with vault mirror) is trivially grep-able and build-gated. There is no runtime behaviour to sample because the whitelist is empty.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static site, no auth layer |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Public site, all content public |
| V5 Input Validation | **yes (partial)** | `astro:content` Zod schema validates MDX frontmatter at build time (`z.string().url().optional()` for `slides:` field) — build fails on malformed URL in presentation MDX. No user input at runtime |
| V6 Cryptography | no | No cryptographic operations in Phase 5 scope |
| V7 Error Handling & Logging | no | Static site; no sensitive error paths introduced |
| V8 Data Protection | no | No PII; all content public |
| V9 Communication | **yes (passive)** | GH Pages enforces HTTPS; any external URLs in frontmatter should be HTTPS (Zod `z.string().url()` permits http/https; consider tightening if any presentation `slides:` URL is ever http-only) |
| V10 Malicious Code | **yes (supply chain)** | See §Known Threat Patterns below |
| V11 Business Logic | no | No business logic in Phase 5 |
| V12 File & Resources | **yes (partial)** | Submodule `cp -r` writes to `dist/` — but only from whitelisted slugs in source-controlled `deploy.yml`. No user-controlled path traversal surface |
| V13 API | no | No APIs |
| V14 Configuration | **yes** | `.gitmodules` + `.github/workflows/deploy.yml` both source-controlled and PR-gated |

### Known Threat Patterns for Astro + GH Actions + Git Submodule stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Submodule URL hijack (push malicious content to `vedmichv/slidev` and have it copied to `dist/slides/`) | Tampering | **Access control on the slidev repo.** Only Viktor has push access (user's own repo). For paranoid threat model: pin a specific SHA in `.gitmodules` and require explicit `--remote --merge` bumps (already the workflow per D-06). CI `actions/checkout@v4` uses the pinned SHA from the superproject tree, not the remote branch HEAD |
| `cp -r slidev/<slug> dist/slides/` with a slug containing path-traversal (`../../../etc/...`) | Tampering / Elevation | Whitelist is hand-edited in `.github/workflows/deploy.yml`; no user input, no dynamic slug construction. Slugs are literals in the shell `for` loop |
| Slidev-built SPA inside `slidev/<slug>/` contains a malicious `<script>` that executes in `vedmich.dev` browser context (same-origin) | XSS / Repudiation | **Same-origin risk is real for shared-domain serving.** Mitigation: (a) Viktor reviews all decks before publishing (editorial control), (b) deck authors use the project's own themes (`slidev-theme-vv`, `slidev-theme-slurm`, `slidev-theme-dkt`) — no third-party theme ingestion. Document this invariant in `docs/slides-onboarding.md` |
| `.gitmodules` URL changed to a different repo (MITM or malicious PR) | Tampering | Standard PR review; GH Actions does not follow `.gitmodules` URL changes without a branch push, which requires repo access |
| Supply-chain risk in `actions/checkout@v4` itself | Elevation | Pin to a SHA instead of `@v4` tag if paranoid (not current practice in this codebase; `@v4` is used throughout). Defer pinning unless a broader repo-wide security policy change happens |

**Conclusion:** No new attack surface introduced by Phase 5 beyond what's already present in the "static site + CI + submodule" pattern. The empty whitelist + editorial control over deck content is the defense in depth. The phase does NOT execute untrusted code at build time; it only copies pre-built static files that Viktor himself built and pushed.

## Project Constraints (from CLAUDE.md)

| Directive | Scope in Phase 5 | How honored |
|-----------|------------------|-------------|
| Zero JS by default | Any code that ships to the browser | No runtime JS added — all edits are build-time (Astro SSR) or CI-time. `/slides/*` sub-routes are Slidev SPAs (their own bundle, not vedmich.dev's) |
| No hardcoded hex; use Deep Signal tokens | Any new styling | No new styling in Phase 5 (pure infra + docs). Empty-state uses existing token classes (`text-text-muted`, `animate-on-scroll`) |
| Never `#06B6D4` / `#22D3EE` (deprecated cyan) | Any styling | No new colors at all; trivially honored |
| Bilingual parity (en + ru in lockstep) | i18n edits | D-15 explicitly bilingual. All 12 MDX draft flips are symmetric across en + ru |
| Build must pass; `npm run build` green | Every commit | Smoke-level gate in Validation Architecture above |
| GSD interactive questions in Russian, artifacts in English | Planner phase discuss (if re-opened) | Already honored in CONTEXT.md (decisions recorded in English) |
| Publishing Workflow: small changes push to main, big changes use PR | Whole phase | Phase 5 touches CI + CLAUDE.md + 12 MDX + CI workflow + skill — **big change, use feature branch + PR** per `code_context.integration_points` note from CONTEXT.md |
| Three-way skill sync: live → vault, with exact `cp -R` form | D-10 deliverable | Explicit in D-10; Common Pitfalls §Pitfall 5 reminds of `cp -R` trailing-slash gotcha |
| Never delete/modify CNAME in `vedmichv/slidev` (per existing vv-slidev deployment.md §Custom domain issue) | Adjacent concern | NOT touched in Phase 5 — D-01 + SLIDES-05 deferral |
| Presentations section sources from `src/data/social.ts` (per CLAUDE.md Architecture) | Data flow | **Note:** CLAUDE.md line 123 says "Presentations — grid cards linking to s.vedmich.dev Slidev decks" — this wording predates the content-collection migration. Presentations are actually sourced from `src/content/presentations/*.md` via Astro Content Collection, not `src/data/social.ts`. `grep -n s.vedmich.dev src/data/social.ts` returns no hits — the file does not contain deck URLs. CLAUDE.md doc drift — the `## Slidev Integration` rewrite should also update this stale line |

## Sources

### Primary (HIGH confidence)
- **Codebase inspection** (direct file reads, 2026-05-07):
  - `src/components/PresentationCard.astro` (57 LOC)
  - `src/components/Presentations.astro` (52 LOC)
  - `src/components/BlogPreview.astro` (59 LOC — pattern reference)
  - `src/data/search-index.ts` (63 LOC)
  - `src/content.config.ts` (49 LOC)
  - `src/i18n/en.json` (101 LOC) + `src/i18n/ru.json` (101 LOC)
  - `src/pages/{en,ru}/presentations/index.astro`
  - `.github/workflows/deploy.yml` (50 LOC)
  - `astro.config.mjs`
  - `package.json` + confirms no Slidev deps
  - `~/.claude/skills/vv-slidev/SKILL.md` + `references/deployment.md`
  - `~/Documents/GitHub/vedmichv/slidev/` local clone (404.html, CNAME, index.html, deck dist dirs)
- **`.planning/research/ARCHITECTURE.md §Slidev Integration Architecture`** (lines 285-418) — Option A rationale, confirmed as locked
- **`.planning/research/PITFALLS.md §Pitfall 3, 7, 10, 12`** — cross-referenced
- **`.planning/phases/05-slidev-integration/05-CONTEXT.md`** — 17 locked decisions
- **Context7 `/websites/sli_dev`** ("hosting base path", "SPA routing"):
  - `slidev build --base /talks/my-cool-talk/` pattern — source for the `--base /slides/<slug>/` invocation
  - GitHub Pages Deployment Workflow template — confirmed `actions/checkout@v4` usage

### Secondary (MEDIUM confidence)
- **`git submodule` man page** (macOS Git 2.50.1) — syntax for `-b <branch>` flag, `.gitmodules` semantics
- **`gh api repos/vedmichv/slidev`** (2026-05-07 probe) — default branch `gh-pages`, HEAD SHA `1dfa2ec0`, size 34 MB

### Tertiary (LOW confidence)
- **`actions/checkout@v4` submodule shallow-vs-deep behaviour** — inferred from GH Actions docs, not directly probed. A1 in Assumptions Log

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every dependency is already installed and empirically green; no new npm deps
- Architecture: HIGH — Option A validated in ARCHITECTURE.md and SUMMARY.md; 17 decisions in CONTEXT.md close all gaps
- Pitfalls: HIGH — 9 pitfalls documented with exact grep commands and detection signals; 3 of them (1, 6, 8) are discovered specifically by this research session and not covered in upstream PITFALLS.md
- Code examples: HIGH — every diff is verified against the actual file contents at named line numbers
- Validation architecture: HIGH — 19 smoke assertions mapped to 7 requirements; all runnable against the current 69-test baseline
- Security: MEDIUM — threat model is standard for the stack; no novel attack surface; editorial control on slidev repo is the main trust boundary

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (30 days for a stable infra phase; no fast-moving APIs involved). Re-verify Slidev HEAD SHA and `actions/checkout@v4` version if planning slips beyond that date.
