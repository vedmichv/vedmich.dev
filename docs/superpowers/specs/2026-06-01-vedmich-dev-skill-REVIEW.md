# Multi-agent review — vedmich-dev slides-deploy autopilot spec

**Date:** 2026-06-01
**Reviewers:** 7 grounded lenses (bash, git/submodule, live-deploy safety, skill arch, Astro content, process/maintainability, adversarial breaker) → 1 synthesizer
**Raw findings:** 72 → **verdict: `revise-before-plan`**
**Spec under review:** `2026-06-01-vedmich-dev-skill-slides-deploy-design.md`

---

## Verdict

The 3-repo architecture and fail-closed intent are sound. Two real design blockers fire on
**run #1** (vv-demo); two more are reconciliation issues (slurm delegation, doc canonicality).
The sharpest worry the user raised about 3-segment deep-links is **REFUTED as safe**. Scope the
autopilot **vv-only** and fix the vv-demo acceptance story before writing the plan.

## MUST-FIX before plan (4)

### B1 — vv-demo run overwrites the LIVE s.vedmich.dev/vv-demo/ artifact; no base-collision preflight
VERIFIED: gh-pages HEAD already serves `vv-demo` at base `/vv-demo/`; CNAME=s.vedmich.dev; root
index.html card → `./vv-demo/`. The first sanctioned run rebuilds base `/slides/vv-demo/` and
`rm -rf vv-demo && cp` to the SAME folder → live legacy surface 404s every asset the instant
step 2 pushes. Preflight checks only working-tree cleanliness.
**Fix:** add preflight collision guard — if `<slug>/index.html` exists on gh-pages, detect its
base and ABORT if it differs from the target base. DECIDE + record the cutover policy (kill legacy
vs distinct folders — one-folder-per-slug cannot host two bases). Fix step-2 rollback to capture
the pre-deploy `<slug>/` tree (tar/stash), not just the prior commit. Acceptance must assert
`/slides/vv-demo/<N>` DEEP-LINKS, not just root. (adversarial + release-eng + git)

### B2 — Step 5 "flip draft→false" is wrong for vv-demo; CREATE path needs talk-only Zod fields a demo lacks
VERIFIED: no `vv-demo.md` card in either locale. Schema requires title/event/city/date/description/
tags (no defaults); a theme self-demo has no honest event/city/date. `slides: z.string().url()` →
internal path `/slides/vv-demo/` FAILS Zod. Build hard-fails at step-6 `npm run build` AFTER 3 repos
mutated. Un-drafting with date:today puts the demo FIRST in the homepage talks grid.
**Fix:** vv-demo stays `draft:true`, run with `--no-undraft` — reachable at `/slides/vv-demo/` by URL,
absent from the grid. DROP "homepage card" from acceptance. CREATE path (future, real deck): source
fields from slides.md frontmatter + explicit flags (NEVER fabricate event/city), validate required
Zod fields at PREFLIGHT, OMIT `slides:` for internal decks. (Astro + git + docs)

### B3 — slurm-slidev delegation as specified will mis-deploy
VERIFIED: live slurm-slidev Phase 8 builds `--base /slidev/{slug}/ --out dist-{slug}`, serves
`vedmichv.github.io/slidev/{slug}/`, repo at `~/Documents/GitHub/vedmich/slidev-theme-slurm`,
uses `git add -A`. D-1 claims s.vedmich.dev/<slug>/ at base /<slug>/. Three incompatibilities
(target/base, dist path, git-add discipline). Single-source-of-truth claim is false while both
authoring skills hardcode their own targets.
**Fix:** scope autopilot **vv-only** now (`--theme` ∈ {slidev-theme-vv}); do NOT advertise slurm
delegation. Make the vv-slidev delegation edit SUBTRACTIVE (remove its hardcoded `--base`/target,
point at vedmich-dev). Defer slurm to a later `--theme` map {repo, base, target, dist, git-mode}. (skill-arch)

### B4 — Spec increases doc scatter (3→5) and the canonical runbook contradicts D-6
VERIFIED: `publish-to-vedmich-dev.md` already declares slides-onboarding.md the SSoT; that runbook's
step 6 uses **feature-branch + PR**, while D-6 + script push **direct to main**. Day-one contradiction
on the most consequential step.
**Fix:** designate ONE canonical: `deploy-deck.sh` = executable HOW; `slides-onboarding.md` = canonical
prose WHY + manual fallback. skill refs + SKILL.md = thin pointers, MUST NOT restate the 6 steps.
Reconcile step 6 to direct-push+local-gate to match D-6. Rule: "process change → edit deploy-deck.sh
+ slides-onboarding.md only." (docs + skill-arch)

## GUIDANCE the plan MUST encode (11)

1. **Shell hardening (macOS/BSD/bash 3.2):** no `sed -i` GNU-form, no `sed -i ''`, no `timeout`/`gtimeout`.
   Use temp-file rewrite or a node/perl pass for frontmatter (step-4 whitelist, step-5 draft). Pages poll =
   bounded loop keyed on the pushed SHA via `gh run list --commit <sha>`; treat `queued` ≠ `failed`.
   `#!/usr/bin/env bash`, `set -euo pipefail`, `IFS=$'\n\t'`, one `die(){ print_rollback; exit 1; }` + `trap ERR`.
   No bash-4 (assoc arrays, `${v^^}`, mapfile). Every seam `if ! check; then die; fi` — never bare grep under set -e.
2. **cp/rm safety:** `cp -r src/dist <slug>` when `<slug>/` exists NESTS → `<slug>/dist/`. Use contents form:
   `rm -rf -- "$dest"; mkdir -p "$dest"; cp -R "$src/." "$dest/"`, then assert `test -f "$dest/index.html" && ! test -d "$dest/dist"`.
   Reject empty slug BEFORE building paths (`[[ -n "${slug:-}" ]]`), tighten regex to
   `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, `case "$slug" in ''|.|..|/*|*/*) die;; esac`. Theme build is hardcoded
   to vv-demo in package.json — MANDATE `pnpm exec slidev build presentations/<slug>/slides.md --base ...`,
   never `pnpm build`. Reject sibling `presentations/vv-demo-dist/`. `rm -rf presentations/<slug>/dist` before build.
3. **Submodule determinism:** DROP `--merge`. Capture `pushed=$(git -C <gh-pages-clone> rev-parse HEAD)` after
   step-2 push, then `git -C slidev fetch origin gh-pages && git -C slidev checkout <pushed> && git add slidev`.
   SHA-equality seam compares staged gitlink to `$pushed`. Make drag-detection a GATE:
   `git -C slidev diff --name-only <oldpin>..<newpin> | grep -vE '^<slug>/|^(CNAME|404.html|index.html)$'` empty else ABORT.
   Capture `<oldpin>` via `git rev-parse :slidev` in preflight. Preflight: submodule remote reachable + no local-only commits.
4. **Local gate must be CI-equivalent:** CI runs `npm run build` PLUS the whitelist cp loop. D-6 gate runs only
   the Astro half → base/whitelist/submodule failures pass a green local build and still 404. After build, replicate:
   `mkdir -p dist/slides && cp -R slidev/<slug>/. dist/slides/<slug>/`, assert index.html + 404.html exist, grep the
   SUBMODULE copy's asset URLs all start with `/slides/<slug>/`. `bash -n` the uncommented for-slug line. Run this
   BEFORE the irreversible gh-pages push. Non-skippable (main is unprotected — verified).
5. **Base-path grep (load-bearing seam):** spec says `dist/index.html` but Slidev writes
   `presentations/<slug>/dist/index.html` — fix everywhere. `grep -oE '(src|href)="/[^"]*"'`; fail if any
   root-absolute URL does NOT start with `/slides/<slug>/` AND require ≥1 match (empty → ABORT). Exclude
   https:// // data: #. NUANCE: vv-demo index has `/aws-icons/` + `/modules/` root-absolute refs NOT slug-prefixed
   even when correct — whitelist them or the assertion false-aborts every vv deck. Also grep the deck's 404.html.
   Discover a hashed asset for the 200-check, don't hardcode. Add slide-count/title sanity (build script hardcoded to vv-demo).
6. **Preflight cleanliness scoping:** slidev-theme-vv has 16 untracked scratch entries → naive
   `git status --porcelain` aborts every run. Scope to `git status --porcelain presentations/<slug>/`. For
   vedmich.dev use `--ignore-submodules=dirty` + check submodule separately. Parse column 1 of `git submodule status`
   (reject -, +, U). Confirm gh-pages repo `symbolic-ref --short HEAD` = gh-pages. Assert theme repo branch is pushed.
7. **Idempotency + whitelist mechanic:** add step 3 to idempotency list. Guard every commit:
   `git diff --cached --quiet || git commit`. Whitelist is a COMMENTED bash loop in a YAML `run: |` block —
   `grep -c 'for slug'` counts commented+uncommented alike; anchor to UNCOMMENTED line. First-activation REPLACES the
   example list, later decks APPEND. PREFER a sentinel single line `SLUGS="..."  # SLIDES_WHITELIST` +
   `case " $list " in *" $slug "*) noop;; *) append;; esac` over multiline sed. Validate YAML parses before commit.
   Bilingual parity = PRECONDITION (both en+ru exist + both draft:true) before editing either. Gate `slides:` removal
   on `--theme=slidev-theme-vv` only (all 6 cards carry s.vedmich.dev slides:).
8. **Rollback honesty + post-push window:** fail-closed BEFORE the step-2 gh-pages push; best-effort-alert AFTER.
   Revert = a SECOND ~2.5-min deploy QUEUING behind the bad one (concurrency cancel-in-progress:false) → 2-5 min public
   breakage. Either make rollback executable (`git revert --no-edit <sha> && git push`) or bound the window and say so.
   Un-draft the MDX in a SEPARATE push AFTER /slides/<slug>/ confirms 200, so a deck failure never takes down the
   homepage. Order the single main commit LAST. Advisory lockfile against interleaved runs.
9. **Record WHY 3-segment deep-links are SAFE (refuted defect):** the root 404.html (2-segment) lives ONLY in
   gh-pages root (serves s.vedmich.dev) and is NEVER copied (whitelist-only). vedmich.dev serves the deck's own
   per-dir `dist/slides/<slug>/404.html`. Add one sentence to architecture.md so a maintainer doesn't "fix"
   deep-links by copying the root 404 in and actually break them. Step-1 seam also greps the deck 404.html base.
10. **Testing strategy for a 3-repo-mutating script:** `--dry-run` runs preflight + a real build (dirties theme tree —
    confirm dist gitignored or build to mktemp). Gate every mutation behind one `run()` helper so --dry-run mutates
    nothing but COMPUTES the YAML diff + MDX diffs + local Astro build. Add `--repo-root` / file:// bare-repo sandbox for
    end-to-end against disposable clones. `shellcheck` + `bash -n` pre-commit. Extract whitelist-edit + base-grep as
    functions with a bats harness. Idempotency test (run twice in sandbox).
11. **Skill description/triggers + drop stubs:** spec gives the file tree but no SKILL.md frontmatter — the highest-leverage
    artifact for trigger accuracy across 88 skills (4 carry Viktor/Deep Signal/slides). Narrow description: lead with
    publish/deploy verb scoped to "to vedmich.dev / to /slides/", standalone triggers ("deploy this deck to vedmich.dev",
    "опубликуй презу на сайт", "deploy-deck", "/vedmich-dev"), NOT-FOR lines naming vv-slidev/slurm-slidev/viktor-vedmich-design/
    vv-carousel. <600 chars (Bedrock). DROP blog-posts.md/speaking.md empty stubs (D-3 → they rot / duplicate site CLAUDE.md);
    signal future scope in prose, not empty files. Flag PresentationCard.astro displayUrl (hardcoded vedmich.dev/slides even
    for slurm cards) as known issue, out of vv-only scope. Add a "Sync surface" note listing every file a routing change touches.

## REFUTED / DISMISSED (adversarial filter worked)

- **3-segment 404 breaks deep-links** — REFUTED safe (root 404 never copied; deck per-dir 404 serves). Record WHY (guidance 9).
- **Rollback to 1dfa2ec deletes the deck** — overstated; autopilot commits ON TOP of HEAD that already has vv-demo; reverting THAT restores it. Real issue = the breakage window (B1).
- **Hardcoded gh-pages SHA (1604cbe)** — stale at synth time (live 5d8387b); use captured-pushed-SHA pattern, not any literal.
- **Branch-protection "PR needed" path** — real but dead code (main unprotected); keep defensive, not plan-blocking.
- **--dry-run dist dirtiness / concurrency self-race** — low-probability; cores folded into guidance 10 / 8.
