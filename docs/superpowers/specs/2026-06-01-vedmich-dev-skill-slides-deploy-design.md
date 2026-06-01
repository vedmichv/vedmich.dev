# Design — `vedmich-dev` skill + slides-deploy autopilot

**Date:** 2026-06-01
**Status:** Approved (design phase)
**Author:** Viktor Vedmich + Claude

---

## Problem

Publishing a Slidev deck to the personal site is currently a 6-step, 3-repo manual
runbook (`docs/slides-onboarding.md`). Deployment knowledge is scattered across three
files (`vv-slidev/references/deployment.md`, `vv-slidev/references/publish-to-vedmich-dev.md`,
`vedmich.dev/docs/slides-onboarding.md`), there is no skill that owns the process, and
there is no skill that owns `vedmich.dev` content at all (blog, presentations, speaking
are documented only in the repo `CLAUDE.md`).

New policy decision: **all Deep Signal (`vv-slidev`) decks publish to
`vedmich.dev/slides/<slug>/` by default** — the first-party route — not the legacy
`s.vedmich.dev` surface.

## Decisions locked (this brainstorm)

| # | Decision | Value |
|---|----------|-------|
| D-1 | Domain routing policy | **By brand**: `slidev-theme-vv` → `vedmich.dev/slides/<slug>/`; `slidev-theme-slurm` → `s.vedmich.dev/<slug>/` (legacy, wound down over time); DKT → own org gh-pages (untouched) |
| D-2 | Artifact form | **Umbrella skill `vedmich-dev`** owning all site content; slides is the first module |
| D-3 | Scope now | Implement **slides module only**; blog + speaking modules are stub scaffolds for later (YAGNI) |
| D-4 | Automation level | **Full autopilot 1→6**, one command |
| D-5 | Autopilot safety | **Fail-closed envelope** (Approach A): runs without prompts, but self-verifies at every seam and aborts cleanly on any detectable problem |
| D-6 | Step-6 push to live main | **Direct push to `main`** + local `npm run build` as a CI-equivalent gate before pushing (no human PR review) |
| D-7 | vv-demo card target | `vedmich.dev/slides/vv-demo/` (the migration goal); step 5 removes the legacy `slides:` override |

## Why modular (3-repo architecture — context, not a decision)

The existing Phase 5 pipeline (shipped 2026-05-07) is intentionally split across three repos:

```
slidev-theme-vv (sources)  --build--> vedmichv/slidev:gh-pages (artifacts)
                                              |
                                       git submodule (pinned SHA)
                                              v
                                   vedmich/vedmich.dev (Astro site, CI cp -r)
                                              v
                                   vedmich.dev/slides/<slug>/
```

Rationale (verified against `docs/slides-onboarding.md` + `.github/workflows/deploy.yml`):

1. **Toolchain isolation** — the Astro site never runs `slidev build`; decks arrive as
   pre-built static artifacts. Invariant: `vedmich.dev/package.json` must NOT depend on
   `@slidev/cli`, `vue`, or `slidev-theme-*` (CI would balloon ~90s → 5+ min).
2. **Pinned-SHA submodule** — reproducible builds; deck updates are an explicit pointer bump.
3. **Whitelist-per-deck** — `deploy.yml` deck-copy loop is commented out; activated one
   line per deck. No draft leaks to prod.
4. **Zero runtime JS on the site** — `/slides/<slug>/` serves a pre-built SPA.

## Component 1 — skill `vedmich-dev`

```
~/.claude/skills/vedmich-dev/
├── SKILL.md                  routing table + decision-tree; delegates deploy here
├── references/
│   ├── slides-deploy.md      MODULE 1 (implemented now): full process + autopilot usage
│   ├── architecture.md       3-repo model, submodule, CI, invariants (the "why")
│   ├── blog-posts.md         STUB scaffold — en/ru Content Collections (later)
│   └── speaking.md           STUB scaffold — src/data/social.ts speakingEvents (later)
```

- **Delegation:** `vv-slidev` and `slurm-slidev` SKILL.md gain one line each — after their
  Build phase, deployment is delegated to skill `vedmich-dev` (module slides). The
  brand→target routing knowledge lives ONLY in `vedmich-dev` (single source of truth).
- **Three-way sync:** skill is backed up to vault per global CLAUDE.md rule (live +
  `85.20-Claude-Code/skills/vedmich-dev/`); no source-repo copy.

## Component 2 — script `scripts/deploy-deck.sh`

Lives in `~/Documents/GitHub/vedmich/vedmich.dev/scripts/` (versioned with the site,
beside `excalidraw-to-svg.mjs` + `generate-icons.mjs`). Skill invokes it by absolute path.

**Invocation:**
```bash
scripts/deploy-deck.sh --slug <slug> --theme <slidev-theme-vv|slidev-theme-slurm> \
                       [--no-undraft] [--dry-run]
```
Brand→target is derived from `--theme`. No interactive prompts (it is an autopilot).

**Preflight envelope (before ANY mutation — aborts clean, touches nothing):**
1. all 3 repos exist and working trees are clean
2. `.gitmodules` → `branch = gh-pages`
3. slug matches `^[a-z0-9-]+$`
4. deck exists: `presentations/<slug>/slides.md` in the theme repo
5. submodule initialized (`git submodule status` has no `-` prefix)

**6 steps, each with an inline verification seam (any failure → abort + print rollback):**

| # | Action | Fail-closed seam |
|---|--------|------------------|
| 1 | `slidev build --base /slides/<slug>/` (vv) or `/<slug>/` (slurm) | grep `dist/index.html`: every asset URL starts with the expected base, else ABORT |
| 2 | `rm -rf <slug> && cp -r presentations/<slug>/dist <slug>` → commit → push `slidev:gh-pages` | path-specific `git add <slug>` (never CNAME/404/index); verify clean after |
| 3 | `git submodule update --remote --merge slidev` → commit | submodule SHA == just-pushed gh-pages HEAD; **print which slug folders changed in this bump** (open-risk #2 mitigation) |
| 4 | add/uncomment `<slug>` in `deploy.yml` whitelist loop | grep confirms slug in the ACTIVE (uncommented) line; whitelist-only invariant held; **idempotent** (no dup) |
| 5 | un-draft MDX en+ru (`draft:true→false`, remove `slides:` override); create from Zod schema if card absent | `--no-undraft` skips; bilingual parity enforced (both locales or neither); **idempotent** |
| 6 | `npm run build` (local CI-equivalent gate) → `git push` main → poll Pages build → `curl -I /slides/<slug>/` == 200 + one asset == 200 | local build fails → abort BEFORE push; post-deploy 404 → print rollback, exit 1 |

**`--dry-run`:** preflight + step 1 (build + base check) only; prints intended steps 2-6;
pushes nothing.

**Rollback:** on any failure, prints exact revert commands for whatever steps already ran
(revert gh-pages commit / revert submodule bump / re-comment whitelist line).

**Idempotency:** re-running must not duplicate the whitelist slug nor re-un-draft an
already-published card. Steps 2/4/5 written idempotently.

## Failure-mode review (the process, audited)

Neutralized by the envelope:

| Risk | Caught by |
|------|-----------|
| Base-path `/<slug>/` vs `/slides/<slug>/` → all assets 404 | step-1 grep on `dist/index.html`, abort pre-push |
| CNAME / 404.html / index.html leak into `dist/slides/` → routing breaks | whitelist-only + path-specific `git add <slug>` |
| Dirty working tree → deploy someone's uncommitted edits | preflight cleanliness on all 3 repos |
| Slug with space/junk → broken path | regex validation |
| Broken Astro build reaches live site | step-6 local `npm run build` gate before push (D-6) |
| Submodule bump drags other decks' changes | step-3 prints changed slug folders (informational) |
| Branch protection on `main` | direct push rejected → script aborts honestly, says "PR needed" |

Accepted by explicit decision: no human PR review on step 6 (D-6) — replaced by the local
CI-equivalent build gate.

## Out of scope (YAGNI / later)

- blog-posts and speaking modules: stub scaffolds only, no executable logic yet
- migrating the 2 existing Slurm decks off `s.vedmich.dev` — separate task
- closing the `s.vedmich.dev` CNAME — user does manually when ready
- PPTX / DKT / AWS deck deployment (different orgs / pipelines)

## First real run (acceptance)

After implementation: run `deploy-deck.sh --slug vv-demo --theme slidev-theme-vv` and
confirm `https://vedmich.dev/slides/vv-demo/` serves 200 with the deck rendering and the
homepage presentation card pointing at the new route.
