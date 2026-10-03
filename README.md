# vedmich.dev

Viktor Vedmich's bilingual portfolio, technical blog, speaking archive, and
presentation directory. Live site: [vedmich.dev](https://vedmich.dev).

Built with Astro 5, MDX, and Tailwind CSS 4. Static output is deployed to GitHub
Pages. Deep Signal branding uses self-hosted fonts and teal/amber tokens.

## Start locally

Use Node 22 (see `.nvmrc`; minimum 22.6) and npm. This retains the runtime used by
CI while dependency upgrades are evaluated separately.

```sh
npm run setup
npm run dev
```

Open `http://localhost:4321/en/` or `/ru/`. Setup installs the exact lockfile,
generates Astro types, and prepares Playwright Chromium. For a lightweight setup,
use `SKIP_BROWSER_INSTALL=1 npm run setup`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run setup` | Prepare this checkout or a new worktree |
| `npm run dev` | Local development with hot reload |
| `npm run build` | Build static Astro pages to `dist/` |
| `npm run preview` | Serve the existing build |
| `npm run test:unit` | Unit and SVG-export regression checks |
| `npm run test:smoke` | Build and check browser behavior |
| `npm run test:visual` | Compare reviewed macOS screenshots |
| `bash scripts/tests/run.sh` | Deployment helper checks (requires uv/PyYAML) |

`npm run build` does not copy prebuilt Slidev decks. Production adds whitelisted
directories from the pinned `slidev/` submodule; see the development runbook
before testing deck embeds locally.

## Repository map

- `src/pages/{en,ru}/`: localized routes.
- `src/content/{blog,speaking,presentations}/`: Content Collections.
- `src/components/`, `src/layouts/`: page components, shell, search, and embeds.
- `src/i18n/`: bilingual UI strings and locale helpers.
- `src/styles/`: Deep Signal tokens, Tailwind mappings, and prose styles.
- `public/`: fonts, icons, images, standalone HTML embeds, and CNAME.
- `slidev/`: pinned prebuilt deck artifacts, not deck authoring sources.
- `scripts/`, `tests/`: setup, publishing helpers, and regression checks.
- `paseo.json`: portable project scripts and automatic worktree setup.

## Instructions and runbooks

- [AGENTS.md](AGENTS.md): canonical coding-agent instructions.
- [Development and Paseo](docs/development.md): worktrees, ports, and checks.
- [Content workflow](docs/content-workflow.md): posts, talks, and presentations.
- [Slide onboarding](docs/slides-onboarding.md): authorized deck publishing.
- [Diagram exports](diagrams-source/README.md): static SVG generation.
- [Site review](docs/reviews/2026-10-03-site-review.md): findings and verification.

Blog drafts are public at direct URLs; `draft: true` removes discovery and adds
noindex. Do not store confidential content in a draft.

Pushes to `main` publish through GitHub Actions. Local edits, tests, and commits
do not imply permission to publish.
