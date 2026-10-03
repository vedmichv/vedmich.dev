# vedmich.dev

Canonical project instructions for Codex and other coding agents. Inherit the
user's global preferences. Read this file, then only the relevant runbooks.

## Start here

- Inspect `git status --short --branch` and recent commits before editing. Other
  sessions may use this checkout; preserve their changes and stage explicit paths.
- Read `package.json`, the relevant source, and `.github/workflows/` before choosing
  commands. Historical `.planning/` documents are context, not current source truth.
- For long work, maintain `plan.md`, `progress.md`, and `decisions.md`.
- Speak Russian with Viktor. Write code, comments, documentation, commit messages,
  and PRs in English. Preserve EN/RU website localization. Do not use U+2014 in new prose.
- Implement clear, reversible fixes and run relevant checks. Ask before adding
  dependencies, editing `.env`, or changing secrets. Do not expose credentials.
- Commit each logical change with a Conventional Commit message, without attribution
  trailers. A local commit is separate from publication: pushing `main` deploys
  automatically and requires publishing authorization in the current task.

## Architecture and ownership

- Static Astro 5 + MDX, Tailwind CSS 4, npm + `package-lock.json`, GitHub Pages.
  `.nvmrc` tracks Node 22 to match CI; use at least 22.6 for TypeScript unit tests.
  Do not upgrade major versions incidentally. Check current stable versions and
  compatibility before a deliberate upgrade.
- `src/pages/en/` and `src/pages/ru/` are mirrored route trees. `/` detects locale;
  `src/i18n/{en,ru}.json` and `utils.ts` own UI strings and locale helpers.
- `src/layouts/BaseLayout.astro` owns the document, SEO, shared navigation/search,
  and scroll reveals. Core content must remain readable without JavaScript.
- Content Collections and schemas: `src/content.config.ts`. Posts live in
  `src/content/blog/{en,ru}/`; talks in `speaking/{en,ru}/`; decks in
  `presentations/{en,ru}/`. Talks and decks are NOT arrays in `src/data/social.ts`.
- `src/data/social.ts` owns social links, certifications, and skill labels.
  `src/data/search-index.ts` builds locale-specific search data.
- `src/styles/design-tokens.css` is the Deep Signal token and font source.
  `global.css` maps Tailwind utilities and prose styles. Preserve teal/amber branding,
  self-hosted fonts, focus visibility, and reduced-motion behavior. Reuse tokens.
- Prefer Astro components and small browser scripts. Do not introduce a client
  framework or import Slidev/Vue into the main site to implement a small feature.

## Setup and checks

```sh
npm run setup              # npm ci, astro sync, Chromium; also used by Paseo worktrees
npm run dev                # Astro dev server
npm run build              # Static Astro output in dist/, without Slidev copies
npm run preview            # Serve existing production output
npm run test:unit          # Node test runner: plugins, visual primitives, SVG export
npx playwright install chromium  # One-time browser preparation
npm run test:smoke         # Builds and tests production pages
npm run test:visual        # Existing macOS screenshot baselines
bash scripts/tests/run.sh # Deployment helper tests; requires uv and PyYAML
```

- Browser tests select `*.spec.ts`; unit tests use `*.test.ts`. Keep the runners separate.
- Playwright starts a fresh production preview on 4323. Set `PLAYWRIGHT_PORT` for
  parallel worktrees. `PLAYWRIGHT_BASE_URL` deliberately tests an existing server;
  `PLAYWRIGHT_CHANNEL=chrome` uses installed Chrome when bundled Chromium is absent.
- Run build after source/content/config changes. Run unit tests for shared logic,
  markdown plugins, visual primitives, or dependency changes. Run smoke checks for
  routing, navigation, search, accessibility, and deployment changes.
- UI changes require EN/RU desktop and narrow-screen browser inspection. Check
  keyboard operation, console errors, missing assets, and horizontal overflow.
- For screenshots, wait for fonts and use reduced motion. Inspect diffs before
  updating baselines; never refresh snapshots simply to make a red test green.
- Shiki palette changes require `npm run test:unit`; locate CSS overrides by
  `SHIKI_TOKEN_OVERRIDES_BEGIN` / `SHIKI_TOKEN_OVERRIDES_END`.
- There is no configured lint or Astro type-check script. `astro build` is not a
  substitute for type checking; do not claim checks that were not run.

## Content and routing contracts

- Preserve public slugs. Keep matching EN/RU slugs for translations. Do not invent
  a translation, advertise a missing hreflang page, or link a language switch to 404.
- The layout supplies the article H1; body content starts at H2. Include useful
  descriptions, tags, dates, alt text, and iframe titles. See `docs/content-workflow.md`.
- Blog `draft: true` means PUBLIC BUT UNLISTED, not private: its direct URL is built,
  but listings, search, and sitemap exclude it and the page emits noindex. Never put
  confidential content in a draft. Fixtures prefixed `__` also stay unlisted.
- Check discovery surfaces together when changing visibility: homepage, indexes,
  search, metadata, and `astro.config.mjs` sitemap filtering.
- Embedded JSON in script elements must escape `<` as `\u003c`. Browser-generated
  result markup must escape text. Treat repository content as authored input, not
  an excuse to emit unsafe HTML.
- Contact is a local mailto handoff, not a server-side submission. Never claim a
  message was sent. Do not send a real message as part of testing.

## Slides, diagrams, and Paseo

- `slidev/` is a pinned git submodule containing PREBUILT decks. Initialize it only
  when needed with `git submodule update --init --checkout slidev`; never use
  `--remote --merge` to silently move the pin. Do not edit generated deck assets.
- `.github/workflows/deploy.yml` copies only `SLIDES_WHITELIST` entries to
  `dist/slides/`. Preserve `# DEPLOY_DECK_SENTINEL`. Do not copy `slidev/*` wholesale.
- `src/pages/404.astro` restores Slidev deep links on GitHub Pages. Keep this route
  working when changing error pages. Astro-only preview does not certify decks.
- Read `docs/slides-onboarding.md` before deck work. `scripts/deploy-deck.sh` can
  commit, push, and deploy across repositories: use `--dry-run` for preparation;
  a real run requires explicit publication authorization.
- Diagram pipeline: `diagrams-source/README.md` and `scripts/excalidraw-to-svg.mjs`.
  Sources stay in `diagrams-source/`, exported SVGs in `public/blog-assets/`.
  Keep the exporter a build-time devDependency and preserve its security tests.
- `paseo.json` owns portable project setup, services, and metadata prompts. Read
  `docs/development.md` for worktree lifecycle details. Keep auth, provider settings,
  local MCP paths, trust, and desktop settings out of repository configuration.
- New worktrees need their own dependency install; never share `node_modules`, copy
  `.env` files, or reset another workspace. No destructive teardown hooks.

## Code Review Rules

- Report reproducible behavior and impact with source references, not speculation.
- Flag leaked drafts, broken locale/deck links, unsafe HTML, unbounded embedded
  animation, inaccessible keyboard flows, and accidental publication commands.
- Distinguish dependency advisories from proven exploitability on a static site.
- Separate source review, passing local tests, committed code, CI results, and live
  acceptance. State limitations explicitly; do not claim deployment from a build.
