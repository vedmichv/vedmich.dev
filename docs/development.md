# Development, worktrees, and Paseo

## Prerequisites

Node 22.6+ and npm are required. `.nvmrc` selects Node 22 to match existing CI.
The project retains Astro 5; upgrade the runtime/framework as a deliberate
compatibility change, not as part of setting up a checkout.

```sh
npm run setup
```

`scripts/setup-worktree.sh` changes to its own checkout root, verifies Node,
executes `npm ci --no-audit --no-fund`, runs `astro sync`, and installs the
lockfile-compatible Playwright Chromium. Re-running it is safe but reinstalls
dependencies. Use `SKIP_BROWSER_INSTALL=1` to defer the browser download.

Setup never copies `.env`, credentials, auth, provider configuration, or another
checkout's `node_modules`. No application secrets are required. It neither
publishes nor advances the Slidev submodule. Linux environments may also need
`npx playwright install --with-deps chromium` for system libraries; workstation
setup does not run a privileged OS package installer.

## Paseo project settings

Root `paseo.json` is shared project configuration, verified against installed
Paseo 0.10.3. It provides automatic worktree setup, `dev` and `preview` services,
build/test scripts, English metadata prompts, and Conventional Commit guidance.

The service allocation range for isolated worktrees is 4400-4499. The main
checkout uses declared defaults 4321 (dev) and 4322 (preview). Commands use
Paseo's `PASEO_PORT` and `HOST`. Do not start a second server on an existing
service's port. No teardown hook is needed: Paseo owns service processes and
workspace lifecycle. Do not add hooks that delete data, reset Git, or commit.

```sh
paseo script ls --json
paseo script start dev
paseo script stop dev
paseo workspace create --isolation worktree --path . \
  --new-branch fix/example --base main --title "Example change"
```

New worktrees read committed setup from the selected base branch. Commit
`paseo.json`, the setup script, and required package changes before creating them.
Paseo may require an explicit setup action for an untrusted checkout, such as a
fork PR. Use `paseo workspace setup <id>` only after reviewing it; do not edit
trust storage to bypass that check.

Display names/icons and machine-specific provider settings belong to Paseo's
local state. Do not export desktop registries or auth into this repository.

## Browser verification

```sh
npm run test:smoke
npm run test:visual
```

Playwright builds the site and starts a fresh preview on 4323. It does not
silently reuse another checkout's server. For parallel worktrees:

```sh
PLAYWRIGHT_PORT=4523 npm run test:smoke
```

`PLAYWRIGHT_BASE_URL` deliberately targets an existing server.
`PLAYWRIGHT_CHANNEL=chrome` uses installed Google Chrome instead of bundled
Chromium; browser versions can change screenshot rendering.

Screenshot baselines in `tests/visual/*.spec.ts-snapshots/` are macOS-specific.
Review actual/expected/diff images before updating. Linux CI runs behavior
checks; it does not create or approve visual baselines automatically.

`astro build` checks compilation, not full Astro/TypeScript diagnostics. There
is no `lint` or `check` package script. Adding tooling is a separate dependency
decision. Reports must state which checks actually ran.

## Slidev preview boundary

Astro dev does not serve the submodule at `/slides/`. To preview complete output:

```sh
git submodule update --init --checkout slidev
npm run build
bash -c '
  set -euo pipefail
  source scripts/lib/deploy-lib.sh
  mkdir -p dist/slides
  for slug in $(whitelist_get .github/workflows/deploy.yml); do
    validate_slug "$slug"
    test -f "slidev/$slug/index.html"
    cp -R "slidev/$slug" dist/slides/
  done
'
npm run preview
```

Use a clean/pinned submodule. Never advance the gitlink to the latest remote
head implicitly. The root custom 404 restores Slidev deep links on GitHub Pages;
verify them live after an authorized publication. A local 200 response alone
is not slide-content acceptance.

## CI and publishing

`check.yml` runs units and browser smoke checks on PRs/non-main pushes.
`deploy.yml` runs units and browser smoke checks, builds Astro, copies whitelisted deck artifacts, then
deploys on main pushes/manual dispatch. Existing action major versions and
Node 22 are retained in this review.

The deck deploy script can change and push multiple repositories. Read
`docs/slides-onboarding.md` and inspect a dry run before an authorized publish.
For source work, commit locally and report validation. Publish only when
requested; record CI and live checks separately.
