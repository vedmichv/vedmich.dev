# Slidev Deck Onboarding — vedmich.dev/slides/<slug>/

End-to-end runbook for publishing a Slidev deck as a first-party route under `vedmich.dev/slides/<slug>/`. The main site (`vedmich.dev`) and the deck artifact repo (`vedmichv/slidev:gh-pages`) live in two separate repos; this runbook walks through the submodule + CI pipeline that glues them together.

**Ship status:** Phase 5 (milestone v1.0) — SHIPPED + automated. The autopilot `scripts/deploy-deck.sh` drives the whole flow; `vv-demo` is live at `vedmich.dev/slides/vv-demo/` (theme demo, deployed with `--no-undraft`). Current `/slides/*` consumers: `vv-demo`.

> **Normal operation is one command** — you should NOT run the steps below by hand:
> ```bash
> scripts/deploy-deck.sh --slug <slug> --theme slidev-theme-vv [--no-undraft] [--cutover] [--dry-run]
> ```
> Always `--dry-run` first. The script is fail-closed (self-verifies at every seam, aborts + prints rollback on any problem).
>
> **Canonical sources (D-10):** the executable HOW is `scripts/deploy-deck.sh` (its step functions ARE the process); this file is the canonical prose WHY + **manual fallback only if the script is unavailable**. A process change edits **`deploy-deck.sh` + this file only** — the `vedmich-dev` skill, `vv-slidev/references/deployment.md`, and `publish-to-vedmich-dev.md` are thin pointers and must not restate the steps.
>
> **The manual steps below are a fallback. Where they differ from the script, the script wins** — it is hardened against foot-guns the manual recipe is not (exact-SHA submodule pin, drag-gate, clean-cache CI-equivalence, atomic card commit, auto-revert).

***

## When to use this flow

Use this flow when you have a Slidev deck authored in one of the theme repos (`vedmichv/slidev-theme-slurm`, `vedmichv/slidev-theme-vv`, `DKT-AI/slidev-theme-dkt`) and you want it served at `vedmich.dev/slides/<slug>/` instead of (or alongside) `s.vedmich.dev/<slug>/`.

Reasons to prefer the first-party `/slides/` route:

- **SEO + brand cohesion** — the deck lives on the primary domain; search and social linkbacks consolidate on `vedmich.dev`.
- **Internal link hygiene** — `PresentationCard` emits `/slides/<slug>/` automatically once the MDX has `draft: false` and no `slides:` override; no manual URL strings required.
- **Unified hosting** — one deploy, one CDN edge, one certificate, one set of DNS records.

**Alternative:** if you only want to publish to `s.vedmich.dev` and leave the deck there, follow the existing `vv-slidev` skill's `references/deployment.md` — that reference covers the gh-pages side only and does not touch `vedmich.dev`.

***

## Prerequisites

Confirm three local repo checkouts are present:

- `~/Documents/GitHub/vedmichv/slidev-theme-vv/` (or `slidev-theme-slurm`, `slidev-theme-dkt` depending on the deck)
- `~/Documents/GitHub/vedmichv/slidev/` (the gh-pages artifact repo — must be on the `gh-pages` branch)
- `~/Documents/GitHub/vedmich/vedmich.dev/` (this repo, with the `slidev/` submodule initialized)

Verify the submodule is initialized inside vedmich.dev:

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev/
git submodule status slidev
# Expected: "<SHA> slidev (heads/gh-pages)"
# If the line is empty or prefixed with "-", run:
git submodule update --init --recursive
```

Verify Plan 01 Task 2 has landed (submodule checkout + whitelist step exist in CI):

```bash
grep -q 'Copy Slidev decks to dist/slides' .github/workflows/deploy.yml && echo "OK" || echo "MISSING — Plan 01 Task 2 not landed"
grep -A2 'actions/checkout@v4' .github/workflows/deploy.yml | grep -q 'submodules: recursive' && echo "OK" || echo "MISSING — Plan 01 Task 2 not landed"
```

Both probes must print `OK`. If either prints `MISSING`, stop and re-run Plan 01 first — this runbook assumes the scaffolding is already on `main`.

***

## Step 1: Build the deck with --base /slides/<slug>/

Build the deck from its theme repo with an explicit base path that matches the target URL. The trailing slash is load-bearing — Slidev's hosting docs are unambiguous about this.

```bash
cd ~/Documents/GitHub/vedmichv/slidev-theme-vv
pnpm slidev build presentations/<slug>/slides.md --base /slides/<slug>/
# Output lands in ./dist/
```

`--base` tells Slidev what base path every asset URL should be rewritten to. Without it (or with a mismatched base), the SPA router expects one URL prefix but the hosting URL serves another — every asset 404s.

**Critical note:** the legacy deploy path uses `--base /<slug>/` (deck served at the root of `s.vedmich.dev/<slug>/`). For `vedmich.dev/slides/<slug>/` serving, the base MUST include the extra `slides/` segment — `--base /slides/<slug>/`. This is the single most common foot-gun when migrating a deck from `s.vedmich.dev` to `vedmich.dev`. If in doubt: open the built `dist/index.html` and grep for `href=` — every asset reference should start with `/slides/<slug>/`, not `/<slug>/`.

***

## Step 2: Publish dist/ to vedmichv/slidev:gh-pages

Push the built `dist/` as a top-level `<slug>/` folder inside the gh-pages artifact repo.

```bash
cd ~/Documents/GitHub/vedmichv/slidev/
git checkout gh-pages    # default branch for this repo
git pull origin gh-pages
rm -rf <slug>
cp -r ~/Documents/GitHub/vedmichv/slidev-theme-vv/dist <slug>
git add <slug>
git commit -m "deploy: <slug> (N slides) --base /slides/<slug>/"
git push origin gh-pages
```

This mirrors the existing gh-pages deploy flow documented in the `vv-slidev` skill's `references/deployment.md` — the only difference is the `--base` argument (hence the per-deck base-path commit-message convention, so future submodule bumps show which deck was rebuilt for which target at a glance).

**Do NOT** touch `CNAME` in the gh-pages root — that file carries `s.vedmich.dev` and belongs to the legacy artifact surface, which stays live until the user manually closes it per SLIDES-05 deferral. Likewise **do NOT** touch the gh-pages root `index.html` or `404.html`; they still serve legacy `/<slug>/` navigation at `s.vedmich.dev`. Only the `<slug>/` folder you just created (or replaced) is in scope for this step.

***

## Step 3: Pump the submodule in vedmich.dev

Bring the submodule pointer in `vedmich.dev` up to the **exact SHA you pushed in Step 2**.

```bash
cd ~/Documents/GitHub/vedmich/vedmich.dev/
PUSHED=$(git -C ~/Documents/GitHub/vedmichv/slidev rev-parse HEAD)   # the SHA from Step 2
git -C slidev fetch origin gh-pages
git -C slidev checkout "$PUSHED"
git add slidev
git commit -m "chore(slides): bump <slug>"
```

**Do NOT use `git submodule update --remote --merge`** (as an earlier version of this runbook said). `--remote` re-resolves to the *current* `gh-pages` HEAD, which on the SHARED artifact repo may include co-tenant decks (slurm, dkt) pushed from another machine since your Step 2 — pinning a SHA that is NOT the one you built. The script (`step_bump_submodule`) deliberately `checkout`s the captured `$PUSHED` and then **asserts the staged gitlink equals `$PUSHED`**, and runs a drag-gate that aborts if the bump would change a *different whitelisted* (served) deck. The exact-SHA checkout is what makes that gate meaningful — `--remote --merge` silently defeats it.

`git add slidev` stages the updated gitlink (mode `160000`) — NOT the submodule's working-tree contents, just the SHA pointer.

Verify the pointer matches the commit you pushed in Step 2:

```bash
git submodule status slidev
# The SHA on the left must equal "$PUSHED" above.
```

***

## Step 4: Add the slug to the whitelist in .github/workflows/deploy.yml

The CI step `Copy Slidev decks to dist/slides` has a single **active sentinel line** that lists the served slugs. The autopilot's `whitelist_add` (in `scripts/lib/deploy-lib.sh`) appends to it idempotently; manually, you add your slug to the space-separated list inside the quotes.

Current shape of the step:

```yaml
- name: Copy Slidev decks to dist/slides
  run: |
    mkdir -p dist/slides
    # Active whitelist managed by scripts/deploy-deck.sh — it edits the sentinel line below.
    # Each slug must be pre-built in vedmichv/slidev:gh-pages with --base /slides/<slug>/.
    # See docs/slides-onboarding.md for the full flow.
    SLIDES_WHITELIST="vv-demo"  # DEPLOY_DECK_SENTINEL
    for slug in $SLIDES_WHITELIST; do
      cp -r "slidev/$slug" dist/slides/
    done
```

(There is **no commented-out `for` block** — an earlier version of this runbook described one; it no longer exists.)

To activate a deck manually:

1. Add your slug to the space-separated list inside the quotes on the `SLIDES_WHITELIST="…"  # DEPLOY_DECK_SENTINEL` line. Single deck: `SLIDES_WHITELIST="vv-demo"`. Multiple: `SLIDES_WHITELIST="vv-demo karpenter-prod"`. **Do not remove the `# DEPLOY_DECK_SENTINEL` comment** — `whitelist_add`/`whitelist_has`/`whitelist_get` anchor on it.
2. Confirm the YAML still parses (the script does this via `uv run --with pyyaml python3`):
   ```bash
   uv run --with pyyaml python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"
   ```
3. Stage and commit (the script bundles this into the single final `main` commit — see Step 6):
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "ci(slides): activate /slides/<slug>/"
   ```

**Invariant:** whitelist-only. Never expand the loop to `cp -r slidev/* dist/slides/` — that would copy the gh-pages root files (`404.html`, `CNAME`, `index.html`, and any un-scoped single-file CSS) into `dist/slides/` and break routing. See Gotcha 2 below.

***

## Step 5: (Optional) Un-draft the MDX entry

Flip the presentation's MDX frontmatter from `draft: true` to `draft: false` so the deck appears on the homepage + presentations index + search index.

Files to edit (both locales for bilingual parity per CLAUDE.md):

- `src/content/presentations/en/<slug>.md`
- `src/content/presentations/ru/<slug>.md`

Flip `draft: true` → `draft: false` in the frontmatter of each file (the script matches the `draft:` key regardless of line number or spacing, via `^draft:[[:space:]]+true[[:space:]]*$`). The script also requires **bilingual parity** — both en and ru must exist and both be `draft: true` before it will un-draft either (a MIXED state aborts). Authoring the cards is out of the autopilot's scope: create both (as `draft: true`) first, then deploy.

Optionally remove the `slides:` field from frontmatter — with the field absent, `PresentationCard.astro` falls back to the computed `/slides/<slug>/` path via the `data.slides ?? \`/slides/${slug}/\`` precedence rule in the component. Keeping the field (pointing at an external URL like SpeakerDeck/Notist) is valid too; the field wins over the computed path when present.

```bash
git add src/content/presentations/en/<slug>.md src/content/presentations/ru/<slug>.md
git commit -m "content: un-draft <slug> presentation"
```

***

## Step 6: Verify

Local verification first, then push + check live.

Local:

```bash
npm run build
mkdir -p dist/slides && cp -r slidev/<slug> dist/slides/
ls dist/slides/<slug>/
open dist/slides/<slug>/index.html
```

The `cp -r slidev/<slug> dist/slides/` here is a local preview only — CI does this automatically on push once the whitelist is active. The `open` command launches the built deck in your default browser; click through a few slides, try presenter mode (`/presenter/`), and confirm assets load.

Push + deploy (autopilot policy D-6 — direct to `main`, gated by a local CI-equivalent build):

```bash
# CI-equivalent gate BEFORE pushing (the Astro build alone is blind to the slides pipeline):
rm -rf dist .astro                       # CI builds from a fresh checkout — replicate it; a stale
                                         # Vite/Astro chunk cache makes `npm run build` spuriously die
npm run build
mkdir -p dist/slides && cp -R slidev/<slug>/. dist/slides/<slug>/
test -f dist/slides/<slug>/index.html && test -f dist/slides/<slug>/404.html
grep -oE '(src|href)="/[^"]*"' dist/slides/<slug>/index.html | grep -vE '^(src|href)="//|/(aws-icons|modules)/' | grep -vqE '"/slides/<slug>/' || echo "base OK"

git push origin main   # auto-deploys; main is unprotected
```

`deploy-deck.sh` performs exactly this gate automatically (the `rm -rf dist .astro` is `ci_equiv_gate`'s CI-equivalence cleanup — without it a stale cache fail-closes a legit deploy). It then makes a **single atomic `main` commit** containing the submodule bump + whitelist edit + (for a real talk) the un-drafted `src/content/presentations/{en,ru}/<slug>.md` cards — so a `git revert` of that one SHA cleanly undoes everything, and the homepage card never publishes without its deck. After pushing, the script polls the Pages run keyed on the pushed SHA, then curls the live root (hard gate, auto-reverts on miss) plus a hashed asset and a deep-link (soft warns). The manual PR route is retained only as a fallback when `main` is later branch-protected (the script aborts and says so).

Post-deploy curl checks (run after GitHub Actions finishes):

```bash
curl -I https://vedmich.dev/slides/<slug>/
# Expected: HTTP/2 200

curl -s https://vedmich.dev/slides/<slug>/ | grep -q '<script' && echo "OK: SPA shell served"
```

Browser check for deep-links: visit `/slides/<slug>/`, then a **direct** `/slides/<slug>/10`, and `/slides/<slug>/presenter/`. A direct deep-link is an **HTTP 404 by design** — there is no file at that path on disk — so it is served by `dist/404.html` (built from `src/pages/404.astro`), which fetches the deck's `index.html` and document-writes it in place (without changing `location`) so Slidev's path router boots onto slide 10. See Gotcha 2 and `architecture.md` for the mechanism. The script preflight-aborts if `src/pages/404.astro` is missing.

***

## Gotchas

1. **--base flag requires a trailing slash.** Without a trailing slash the resulting asset URLs break — Slidev concatenates the base string with asset paths literally, and `/slides/<slug>asset.js` is not the same as `/slides/<slug>/asset.js`. Always `--base /slides/<slug>/` in Step 1. Verified against Slidev hosting docs.

2. **Never copy 404.html, CNAME, or index.html from slidev/ root.** The gh-pages root's `404.html` is hardcoded for a 2-segment `/slug/slide` path (breaks when the path is 3-segment `/slides/slug/slide`). `CNAME` points at `s.vedmich.dev` (wrong domain for the vedmich.dev surface). The root `index.html` contains `./<slug>/` relative links that assume the 2-segment structure. The whitelist-only cp step prevents all three from leaking — never change it to `cp -r slidev/* dist/slides/`. This invariant is tracked as decision D-13 in `.planning/phases/05-slidev-integration/05-CONTEXT.md`.

   **How deep-links actually work on this surface:** they do NOT rely on the gh-pages root `404.html` (never copied). They rely on the **site-root** `src/pages/404.astro` → `dist/404.html`: for a `/slides/<slug>/<rest>` path it `fetch`es the deck's own `index.html` and `document.write`s it WITHOUT changing `location`, so Slidev v52's path router boots the right slide. The `?p=/N` query trick does NOT work on Slidev v52 (it normalizes to slide 1). `deploy-deck.sh` preflight aborts if `src/pages/404.astro` is missing — **do not delete it**. Full mechanism: `~/.claude/skills/vedmich-dev/references/architecture.md`.

3. **Never add @slidev/cli, vue, or slidev-theme-* to vedmich.dev/package.json.** Decks are pre-built artifacts, not sources. The entire pipeline depends on the separation — the vedmich.dev CI never runs `slidev build`, only `cp -r`. Adding any Slidev dependency regresses CI from ~90s to 5+ minutes per build and pollutes the Astro toolchain with Vue + vite-plugin-vue internals. Grep guard: `grep -iE 'slidev|slidev-theme' package.json` should return zero hits (other than inside `scripts/` comment lines, which don't affect runtime). This is Pitfall 3 from `.planning/phases/05-slidev-integration/05-RESEARCH.md`.

4. **After `git checkout <branch>`, always run `git submodule update --init --recursive`.** Submodules track commits, not branches — checking out a different branch of vedmich.dev does NOT automatically re-sync the `slidev/` working tree to that branch's pinned SHA. Symptom: `git status` shows `modified: slidev (new commits)` immediately after a branch switch even though you haven't touched the submodule. This is Pitfall 7 from the research doc.

5. **.gitmodules MUST have `branch = gh-pages`.** If the submodule was added without `-b gh-pages`, the `branch = gh-pages` line is missing from `.gitmodules` and `git submodule update --remote` silently follows the remote HEAD — which happens to be `gh-pages` today but will silently follow whatever default-branch the repo is re-pointed to in the future. Verify:
   ```bash
   git config -f .gitmodules --get submodule.slidev.branch
   # Must print: gh-pages
   ```
   This is Pitfall 4 from the research doc, and Plan 01 Task 1 is responsible for making sure it's correct at submodule-creation time.

6. **Three-way sync gotcha — `cp -R` trailing slash.** When syncing the `vv-slidev` skill between `~/.claude/skills/` (live) and `~/Documents/ViktorVedmich/.../skills/` (vault), the macOS `cp -R` gotcha bites: a trailing slash on the source path copies the *contents* into the destination, dropping the `vv-slidev/` directory level itself. CLAUDE.md prescribes the correct form:
   ```bash
   # CORRECT — no trailing slash on source:
   cp -R ~/.claude/skills/vv-slidev ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/
   ```
   For single-file updates (like the publish-to-vedmich-dev.md reference below), use the explicit-file form — it has no trailing-slash hazard at all:
   ```bash
   cp <live>/references/<file>.md <vault>/references/<file>.md
   ```

7. **Ghost decks retain `slides:` frontmatter URLs per D-03.** Currently 6 draft MDX files under `src/content/presentations/{en,ru}/` carry `slides: "https://s.vedmich.dev/<slug>/"` in their frontmatter — preserved skeletons for future real-deck authoring. Phase 5's D-14 verification scope explicitly excludes `src/content/presentations/` from the stale-domain grep (`grep -rn 's\.vedmich\.dev' src/i18n/ src/components/ src/data/`). To eliminate the reference when un-drafting a deck (Step 5), remove the `slides:` field from frontmatter — `PresentationCard.astro` then falls back to `/slides/<slug>/` via the `data.slides ??` precedence rule. Keep the field only if you genuinely want an external-hosted override (SpeakerDeck, Notist, a legacy `s.vedmich.dev` URL).

***

## Further reading

- `.github/workflows/deploy.yml` — the CI pipeline, `Copy Slidev decks` step (Plan 01 Task 2 scaffolding; Step 4 above activates it)
- `.gitmodules` — submodule registration pointing at `vedmichv/slidev:gh-pages` with `branch = gh-pages` (Plan 01 Task 1)
- `~/.claude/skills/vv-slidev/references/deployment.md` — gh-pages side SSoT for Step 2 (what to do inside `vedmichv/slidev` after building the deck)
- `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` — short companion pointer back to this runbook, with TL;DR + quick commands
- `~/.claude/skills/vv-slidev/references/architecture-grid.md` — deck authoring conventions inside `slidev-theme-vv`
- `.planning/phases/05-slidev-integration/05-RESEARCH.md` — full Phase 5 research (decisions, pitfalls, exact diffs, source citations)
- `.planning/phases/05-slidev-integration/05-CONTEXT.md` — 17 locked decisions (D-01..D-17) that scope Phase 5
- Slidev hosting docs: https://sli.dev/guide/hosting.html
- GitHub Actions `actions/checkout@v4` submodule flag: https://github.com/actions/checkout#usage
