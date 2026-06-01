# Design — `vedmich-dev` skill + slides-deploy autopilot

**Date:** 2026-06-01
**Status:** Approved + revised after 7-lens review (see `2026-06-01-vedmich-dev-skill-REVIEW.md`)
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
| D-1 | Domain routing policy | **By brand**: `slidev-theme-vv` → `vedmich.dev/slides/<slug>/` (the only target the autopilot drives, D-8); `slidev-theme-slurm` → its existing Phase-8 flow (`vedmichv.github.io/slidev/<slug>/` today; reconcile before automating, review B3); DKT → own org gh-pages (untouched) |
| D-2 | Artifact form | **Umbrella skill `vedmich-dev`** (name reserved for future blog/speaking); the only implemented capability now is slides deploy |
| D-3 | Scope now | Implement **slides deploy only**. NO blog/speaking stub files (review G11) — site `CLAUDE.md` already owns those; future scope signalled in SKILL.md prose, not empty files |
| D-4 | Automation level | **Full autopilot 1→6**, one command |
| D-5 | Autopilot safety | **Fail-closed envelope** (Approach A): runs without prompts, but self-verifies at every seam and aborts cleanly on any detectable problem |
| D-6 | Step-6 push to live main | **Direct push to `main`** + a **CI-equivalent** gate before pushing: local `npm run build` PLUS replicate the whitelist `cp slidev/<slug> dist/slides/<slug>` and grep the submodule copy's asset base (the Astro build alone is blind to the slides pipeline — review G4). No human PR review. |
| D-7 | vv-demo identity | vv-demo is a **theme demo, not a talk** → stays `draft:true`, deployed with `--no-undraft`. Reachable at `vedmich.dev/slides/vv-demo/` by URL, ABSENT from the homepage Presentations grid. No MDX card is created for it. Acceptance asserts the raw `/slides/vv-demo/` artifact + a deep-link, NOT a homepage card. (review B2) |
| D-8 | Autopilot theme scope | **vv-ONLY** for now: `--theme` accepts `slidev-theme-vv` exclusively. Slurm delegation is deferred — the live `slurm-slidev` Phase 8 uses a different base/target/dist-path/git-add discipline (review B3) and must be reconciled separately before the autopilot can drive it. (review B3) |
| D-9 | Legacy vv-demo cutover | Kill the legacy `s.vedmich.dev/vv-demo/` surface: as part of the first run, **remove the vv-demo card from the gh-pages root `index.html`** so it doesn't dangle into a 404. vv-demo lives only at `vedmich.dev/slides/vv-demo/` afterward. One-folder-per-slug on gh-pages cannot host two bases, so this is a true cutover, not a parallel. (review B1, user decision 2026-06-01) |
| D-10 | Canonical docs | `deploy-deck.sh` = executable HOW (its seams ARE the process). `docs/slides-onboarding.md` = canonical prose WHY + manual fallback. Skill `slides-deploy.md` + SKILL.md + `publish-to-vedmich-dev.md` + `deployment.md` = thin pointers that MUST NOT restate the 6 steps. Rule: **a process change edits `deploy-deck.sh` + `slides-onboarding.md` only.** Reconcile the runbook step-6 (currently feature-branch+PR) to direct-push+local-gate to match D-6. (review B4) |

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
├── SKILL.md                  routing table + invocation; thin pointer (NOT the 6 steps)
└── references/
    ├── slides-deploy.md      MODULE 1: script invocation/flags + pointer to slides-onboarding.md
    └── architecture.md       3-repo model, submodule, CI, invariants, why-deep-links-are-safe
```

- **No stub modules (review G11):** `blog-posts.md` / `speaking.md` are NOT created — they would
  rot and duplicate the site `CLAUDE.md`, which already owns those workflows in detail. Future
  scope is signalled in SKILL.md prose + a one-line pointer to `CLAUDE.md`, not empty files that
  mis-trigger and bloat three-way sync. The umbrella name stays (`vedmich-dev`) so blog/speaking
  can join later, but the only implemented capability now is slides deploy.
- **SKILL.md frontmatter (review G11 — highest-leverage artifact for trigger accuracy across ~88
  skills, 4 of which carry "Viktor"/"Deep Signal"/"slides"):** description leads with the
  publish/deploy verb scoped to "to vedmich.dev / to /slides/"; standalone triggers ("deploy this
  deck to vedmich.dev", "опубликуй презу на сайт", "deploy-deck", "/vedmich-dev") so it's enterable
  directly, not only via authoring skills; explicit NOT-FOR lines naming `vv-slidev`/`slurm-slidev`
  (authoring), `viktor-vedmich-design` (brand/mocks), `vv-carousel` (LinkedIn). Keep < 600 chars (Bedrock).
- **Delegation (SUBTRACTIVE — review B3):** in `vv-slidev`, replace the Tree-1 Build `--base /<slug>/`
  line and the `s.vedmich.dev` target strings with "base+target owned by `vedmich-dev`; do not hardcode
  `--base` here." Only then is "routing lives ONLY in vedmich-dev" true. `slurm-slidev` is NOT wired to
  delegate yet (D-8) — its Phase 8 stays as-is until reconciled.
- **Three-way sync:** skill backed up to vault (live + `85.20-Claude-Code/skills/vedmich-dev/`); no
  source-repo copy. The script `deploy-deck.sh` is site-repo-only (NOT synced to the skill). A
  "Sync surface" note in SKILL.md lists every file a routing change touches.
- **Known issue, out of scope:** `PresentationCard.astro` `displayUrl` is hardcoded
  `vedmich.dev/slides/${slug}` even for slurm cards whose deck lives on s.vedmich.dev — flag it; fixing
  is out of the vv-only autopilot scope.

## Component 2 — script `scripts/deploy-deck.sh`

Lives in `~/Documents/GitHub/vedmich/vedmich.dev/scripts/` (versioned with the site,
beside `excalidraw-to-svg.mjs` + `generate-icons.mjs`). Skill invokes it by absolute path.

**Invocation (vv-only per D-8):**
```bash
scripts/deploy-deck.sh --slug <slug> --theme slidev-theme-vv \
                       [--no-undraft] [--dry-run]
```
Base+target are owned here (NOT hardcoded in the authoring skills). No interactive prompts.

**Shell contract (macOS/BSD/bash 3.2 — verified on this box; review G1):**
`#!/usr/bin/env bash`, `set -euo pipefail`, `IFS=$'\n\t'`. One `die(){ print_rollback; exit 1; }`
+ `trap ERR`. NO `sed -i` (GNU) / `sed -i ''` (BSD-only) / `timeout` / `gtimeout`; rewrite files
via temp-file `sed '…' f > tmp && mv -- tmp f` or a small node pass (script lives beside `.mjs`
helpers). No bash-4 features (assoc arrays, `${v^^}`, mapfile). Every seam is an explicit
`if ! check; then die; fi` — never a bare `grep` under `set -e`. All mutations go through one
`run()` helper so `--dry-run` truly mutates nothing yet can COMPUTE+SHOW every diff.

**Preflight envelope (before ANY mutation — aborts clean, touches nothing):**
1. all 3 repos exist; clean **scoped** to the work: theme = `git status --porcelain presentations/<slug>/`
   empty (repo has untracked scratch — review G6); site = clean `--ignore-submodules=dirty`; submodule
   checked separately (`git -C slidev status --porcelain` empty + no local-only commits)
2. `.gitmodules` → `branch = gh-pages`; submodule remote reachable (`ls-remote --exit-code origin gh-pages`)
3. slug regex `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` (forbids bare/leading/trailing dash) **and**
   `[[ -n "${slug:-}" ]]` + `case "$slug" in ''|.|..|/*|*/*) die;; esac` (rm -rf safety — review G2)
4. `--theme` ∈ {`slidev-theme-vv`}; theme repo path exists; deck exists `presentations/<slug>/slides.md`
5. submodule initialized (parse col-1 of `git submodule status`: reject `-`/`+`/`U`); gh-pages repo
   `symbolic-ref --short HEAD` == `gh-pages`; capture `<oldpin>=$(git rev-parse :slidev)` for drag-detection
6. **base-collision guard (review B1):** if `<slug>/index.html` already exists on gh-pages, detect its
   built base; if it differs from `/slides/<slug>/`, **ABORT** naming the surface conflict — UNLESS
   `--cutover` is passed (see D-9 first-run handling)
7. validate required Zod fields for any CREATE path HERE, not at step-6 build (review B2)

**6 steps, each with an inline verification seam (any failure → die + rollback):**

| # | Action | Fail-closed seam |
|---|--------|------------------|
| 1 | `pnpm exec slidev build presentations/<slug>/slides.md --base /slides/<slug>/` (never `pnpm build` — package.json hardcodes vv-demo; review G2) | grep `presentations/<slug>/dist/index.html` (correct path; review G5): every root-absolute `(src\|href)="/…"` starts with `/slides/<slug>/` **except** the deck-root public dirs `/aws-icons/` `/modules/` (whitelist or false-abort); require ≥1 match; exclude `https:` `//` `data:` `#`; also grep the deck's `404.html` base; slide-count/title sanity |
| 2 | snapshot existing `<slug>/` (tar) for rollback → `rm -rf -- <slug>; mkdir -p <slug>; cp -R presentations/<slug>/dist/. <slug>/` → `git diff --cached --quiet \|\| commit` → push `slidev:gh-pages`; capture `pushed=$(rev-parse HEAD)` | path-specific `git add <slug>` (never CNAME/404/index); assert `test -f <slug>/index.html && ! test -d <slug>/dist` (cp-nest guard; review G2) |
| 3 | `git -C slidev fetch origin gh-pages && git -C slidev checkout <pushed> && git add slidev` → commit (NO `--merge`; review G3) | staged gitlink == `$pushed`; **GATE** (not print): `git -C slidev diff --name-only <oldpin>..<pushed> \| grep -vE '^<slug>/\|^(CNAME\|404.html\|index.html)$'` empty else ABORT (drag from co-tenant slurm decks) |
| 4 | add `<slug>` to `deploy.yml` whitelist | prefer a sentinel single line `SLUGS="…"  # SLIDES_WHITELIST` + `case " $list " in *" $slug "*) noop;; *) append;; esac` over sed-uncommenting (the active list is a COMMENTED loop in a YAML `run:\|` block — `grep -c` can't tell commented from active; review G7); validate YAML parses before commit; idempotent |
| 5 | **(skipped for vv-demo via `--no-undraft`, D-7).** Real decks: un-draft MDX en+ru (`draft:true→false`, strip `slides:` ONLY for `--theme=slidev-theme-vv`) | bilingual parity as PRECONDITION (both en+ru exist + both draft:true) before editing either; edit→validate→move both; CREATE path omits `slides:` (Zod `.url()` rejects internal path; review B2) |
| 6 | **CI-equivalent gate (review G4):** `npm run build` THEN replicate CI whitelist `mkdir -p dist/slides && cp -R slidev/<slug>/. dist/slides/<slug>/`, assert `index.html`+`404.html` exist, grep the SUBMODULE copy's base, `bash -n` the uncommented whitelist line → only then `git push` main → poll Pages keyed on the pushed SHA (`gh run list --commit <sha>`, `queued`≠`failed`) → `curl` `/slides/<slug>/` + a discovered hashed asset + a deep-link == 200 | local gate fails → abort BEFORE push (non-skippable; main unprotected); post-deploy 404 → executable rollback (`git revert --no-edit <sha> && git push`), exit 1 |

**Push ordering (review G8):** steps 1-2 (gh-pages artifact) are the irreversible boundary — the
CI-equivalent routing check runs BEFORE the step-2 push. The single `main` commit (submodule bump +
whitelist) lands LAST, after the raw `/slides/<slug>/` artifact is confirmed reachable. For real
decks, the MDX un-draft (homepage cutover) is a SEPARATE push AFTER step-6 confirms 200, so a deck
failure never takes the homepage down. An advisory lockfile prevents two concurrent runs interleaving.

**`--dry-run`:** preflight + step 1 (real build — build to a temp dir or confirm `dist/` is gitignored
so it doesn't poison the next run's cleanliness preflight; review G10) + COMPUTE & SHOW the gh-pages
diff, YAML whitelist diff, MDX diffs, and local Astro build; pushes nothing.

**Rollback honesty (review G8):** fail-closed BEFORE the step-2 gh-pages push; best-effort-alert AFTER.
A post-push revert is a SECOND ~2.5-min deploy that QUEUES behind the bad one
(`concurrency: pages, cancel-in-progress: false`) → expect 2-5 min of public breakage. The script
makes the revert executable and bounds the window; `print_rollback` lists exact reverts for whatever ran.

## Failure-mode review (the process, audited)

Neutralized by the envelope:

| Risk | Caught by |
|------|-----------|
| **vv-demo run overwrites live s.vedmich.dev/vv-demo/ (base mismatch)** | preflight #6 base-collision guard; `--cutover` for the intended D-9 migration; step-2 tar snapshot rollback (review B1) |
| Base-path `/<slug>/` vs `/slides/<slug>/` → all assets 404 | step-1 grep on `presentations/<slug>/dist/index.html` (+ deck 404.html), abort pre-push |
| CNAME / 404.html / index.html leak into `dist/slides/` → routing breaks | whitelist-only + path-specific `git add <slug>` + cp-contents-form |
| Dirty tree false-aborts every run (16 untracked in theme) | scoped cleanliness to `presentations/<slug>/` + `--ignore-submodules=dirty` (review G6) |
| `cp` nests dist into `<slug>/dist/` when slot exists | contents-form cp + positive shape assertion (review G2) |
| `rm -rf` with empty/`.`/`/`-slug | regex + empty-guard + `case` reject BEFORE path build (review G2) |
| Local build green but live 404s (Astro-only gate is blind) | CI-equivalent gate replicates the whitelist cp + submodule-copy base grep (review G4) |
| Submodule `--merge` conflict / chases moving HEAD / drags co-tenant decks | `fetch`+`checkout <pushed>` (no --merge) + drag-detection GATE (review G3) |
| 3-segment `/slides/<slug>/N` deep-links break | **NON-ISSUE — refuted (review G9):** root 2-segment 404 lives only in gh-pages root (s.vedmich.dev), never copied; vedmich.dev serves the deck's own per-dir 404.html. Record so nobody "fixes" it by copying the root 404 in. |
| Post-push public breakage window | reorder routing check before push; un-draft as separate post-200 push; executable bounded revert (review G8) |
| Branch protection on `main` | currently dead code (main unprotected — verified); keep defensive parse of real push exit/stderr (review dismissed) |

Accepted by explicit decision: no human PR review on step 6 (D-6) — replaced by the CI-equivalent
gate (Astro build + replicated whitelist cp + submodule-copy base grep), run before the push.

## Out of scope (YAGNI / later)

- blog-posts and speaking modules — NOT built (no stubs; review G11). Site `CLAUDE.md` already owns them.
- slurm delegation / `--theme slidev-theme-slurm` — deferred until Phase-8 reconciliation (D-8, review B3)
- migrating the 2 existing Slurm decks off `s.vedmich.dev` — separate task
- closing the `s.vedmich.dev` CNAME — user does manually when ready
- `PresentationCard.astro` `displayUrl` slurm bug — flagged, not fixed here
- PPTX / DKT / AWS deck deployment (different orgs / pipelines)

## First real run (acceptance — revised per B1/B2/D-7/D-9)

Run: `scripts/deploy-deck.sh --slug vv-demo --theme slidev-theme-vv --no-undraft --cutover`

`--no-undraft` (D-7): vv-demo is a theme demo, stays out of the homepage Presentations grid — no MDX
card created. `--cutover` (D-9): acknowledges the base migration from the live `/vv-demo/` (s.vedmich.dev)
to `/slides/vv-demo/`, and the run also removes the vv-demo card from the gh-pages root `index.html` so
the legacy URL doesn't dangle into a 404.

**Acceptance assertions (all must pass):**
1. `curl -I https://vedmich.dev/slides/vv-demo/` → 200
2. a discovered hashed asset under `/slides/vv-demo/assets/…` → 200 (base-path correctness)
3. a **deep-link** `https://vedmich.dev/slides/vv-demo/10` renders slide 10 (the base change is exactly
   what fixes/breaks deep-links — review B1)
4. vv-demo does NOT appear in the homepage Presentations grid (draft stays true)
5. legacy `s.vedmich.dev/vv-demo/` root-index card is gone (no dangling 404 from the landing page)

A real card-bearing migration (e.g. `karpenter-prod`, which HAS an MDX card with honest talk metadata)
is the right first test of the un-draft path — tracked as a follow-up, not part of this acceptance.
