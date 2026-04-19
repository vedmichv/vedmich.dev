# CLAUDE.md — vedmich.dev

Personal portfolio website for Viktor Vedmich.

## Project Overview

| | |
|---|---|
| **Site** | https://vedmich.dev |
| **Repo** | `vedmichv/vedmich.dev` |
| **Stack** | Astro 5.x + Tailwind CSS 4 + GitHub Pages |
| **Languages** | EN (default) / RU — i18n via JSON + utilities |
| **Deploy** | GitHub Actions → `actions/deploy-pages@v4` on push to `main` |
| **Domain** | `vedmich.dev` (A records → GitHub Pages IPs), CNAME in `public/` |

### User Context
- **Name:** Viktor Vedmich
- **Role:** Senior Solutions Architect at AWS
- **Location:** Germany (Timezone: Europe/Berlin)
- **Languages:** Russian (native), English (fluent)
- **Communication:** Respond in the language used by user (Russian or English)
- **GSD workflows (`/gsd-*`):** Ask the user interactive questions in **Russian** (labels, descriptions, option text in AskUserQuestion). Record everything in artifacts (CONTEXT.md, PLAN.md, RESEARCH.md, commit messages, DISCUSSION-LOG.md) in **English**. Technical terms, code, file paths stay in English even inside Russian questions.

---

## Architecture

```
src/
├── components/          # Astro components (Hero, About, Podcasts, Speaking, Book, etc.)
├── content/
│   └── blog/{en,ru}/   # Blog posts (Content Collections with glob loader)
├── data/
│   └── social.ts       # Social links, certs, speaking events, presentations data
├── i18n/
│   ├── en.json         # English translations
│   ├── ru.json         # Russian translations
│   └── utils.ts        # Locale helpers: t(), getLocaleFromUrl(), getLocalizedPath()
├── layouts/
│   └── BaseLayout.astro # HTML shell, meta, OG, fonts, scroll observer
├── pages/
│   ├── index.astro     # Root redirect → /en/
│   ├── en/             # English pages (index, blog/, blog/[...slug])
│   └── ru/             # Russian pages (mirror of en/)
├── styles/
│   └── global.css      # Tailwind 4 @theme + custom animations
└── content.config.ts   # Blog collection schema (title, description, date, tags, draft)
```

### Key Design Decisions

- **Zero JS by default** — Astro islands. Only JS: scroll animations (IntersectionObserver) + mobile menu toggle
- **i18n without deps** — JSON translations + `t(locale)` helper, no `astro-i18n` package
- **Content Collections** — blog posts in `src/content/blog/{locale}/`, glob loader, Zod schema
- **Dark theme default** — "Deep Signal" brand: teal `#14B8A6` primary, amber `#F59E0B` accent, bg `#0F172A`. Light mode tokens available via `.light` class for LinkedIn embeds/OG.
- **Fonts (self-hosted)** — Space Grotesk (headlines), Inter (body), JetBrains Mono (code). WOFF2 files in `public/fonts/`, declared in `src/styles/design-tokens.css`. No Google Fonts CDN.

---

## Deep Signal Design System — LIVE

This site is the reference implementation of the **Deep Signal** personal brand system.
Migration from Electric Horizon (cyan) → Deep Signal (teal + amber) completed 2026-04-19.

### Architecture
- **Canonical token source:** `src/styles/design-tokens.css` — full `:root` block (brand, bg, text, borders, status, topics, 10 gradients, fractalNoise, type scale, spacing, radius, shadows, motion, code syntax). Includes `.light` override for OG/LinkedIn renders.
- **Tailwind bridge:** `src/styles/global.css` — `@theme` block maps both *canonical* utilities (`bg-brand-primary`, `text-text-primary`) and *shim aliases* (`text-accent`, `bg-bg`, `text-warm`) to Deep Signal tokens. Zero breakage during migration — old utility names remain valid.
- **Font loading:** 9 WOFF2 files in `public/fonts/` (Inter 400/500/600/700, Space Grotesk 500/600/700, JetBrains Mono 400/500). Declared via `@font-face` in `design-tokens.css`. `<link rel="preload">` in `BaseLayout.astro` for LCP fonts. **No Google Fonts CDN.**
- **Noise overlay:** `.noise-overlay` utility class in `design-tokens.css` — applies fractalNoise `::after` for gradient banding removal. Used on Hero section.
- **Vault canonical spec:** `40-Content/45-Personal-Brand/45.20-Brand-Kit/DESIGN.md`
- **Handoff bundle (read-only):** `.design-handoff/deep-signal-design-system/` (claude.ai/design, 2026-04-19)

### Key constraints
- **Tailwind 4 `@theme` inlines colors statically** — `.light`/`[data-theme="light"]` override only affects raw CSS rules that use `var(--brand-*)` directly (e.g. `.typing-cursor`, `.card-glow`, `body`). Tailwind utilities like `bg-surface` compile to hex literals and do NOT follow the class toggle. Light mode is therefore intended only for OG/LinkedIn image rendering via dedicated preview templates, not for a user-facing toggle.
- **Never add hardcoded hex** to components — always reference a token. Especially avoid `#06B6D4`/`#22D3EE` (deprecated cyan).

### Color Tokens (canonical)

**Brand (dark default):**
- `--brand-primary: #14B8A6` · `--brand-primary-hover: #2DD4BF` · `--brand-primary-deep: #0D9488` · `--brand-primary-soft: #134E4A`
- `--brand-accent: #F59E0B` · `--brand-accent-hover: #FBBF24` · `--brand-accent-soft: #451A03`

**Surfaces:** `--bg-base: #0F172A` · `--bg-surface: #1E293B` · `--bg-elevated: #334155` · `--bg-code: #0D1117`

**Text:** `--text-primary: #E2E8F0` · `--text-secondary: #94A3B8` · `--text-muted: #78909C`

**Borders:** `--border: #334155` · `--border-strong: #475569`

### Anti-Patterns — MUST avoid

| Never use | Reason |
|---|---|
| `#06B6D4` / `#22D3EE` | Deprecated cyan from old Electric Horizon palette |
| `#7C3AED` / `#10B981` | DKT podcast brand (keep separation) |
| `#FF9900` / `#232F3E` | AWS employer brand (keep separation) |
| Pure `#000` / `#FFF` body text | Causes glare — use `#0F172A` / `#E2E8F0` |

### Typography

- **Display/headlines:** `Space Grotesk` 500/600/700
- **Body/UI:** `Inter` 400/500/600/700
- **Code (brand DNA):** `JetBrains Mono` 400/500
- Type scale: display 48px → h1 36 → h2 28 → h3 22 → body 18 → small 16 → caption 14
- Spacing: 4px base (1,2,3,4,5,6,8,10,12,16 → 4..64px)
- Radius: sm 4 · md 8 · lg 12 · xl 16 · full 9999

---

## Homepage Sections

1. **Hero** — terminal-style greeting, name, role, cert badges, social links, CTA
2. **About** — bio, skill pills, certifications (CNCF Kubernaut + all 5 K8s certs)
3. **Podcasts** — DKT (91+ eps, 10K+ subs) + AWS RU Podcast (65+ eps, 70K+ listens)
4. **Speaking** — timeline by year: re:Invent, Summits, Code Europe, Community Days
5. **Book** — "Cracking the Kubernetes Interview" + Amazon link
6. **Presentations** — grid cards linking to s.vedmich.dev Slidev decks
7. **Blog** — latest 3 posts from Content Collection
8. **Contact** — social links grid

---

## Content Workflow

### Adding a Blog Post

1. Create `src/content/blog/{en,ru}/my-post.md` with frontmatter:
   ```yaml
   ---
   title: "Post Title"
   description: "Short description"
   date: 2026-03-15
   tags: ["kubernetes", "architecture"]
   draft: false
   ---
   ```
2. Post appears at `/{locale}/blog/my-post`
3. Shows in homepage BlogPreview section (latest 3 non-draft posts)

### Adding a Speaking Event

Edit `src/data/social.ts` → `speakingEvents` array. Group by year, add events with talks array.

### Adding a Presentation

Edit `src/data/social.ts` → `presentations` array. Add slug matching the Slidev deployment path.

---

## Obsidian Vault Cross-References

This site's content is sourced from Viktor's Obsidian PKM vault (`~/Documents/ViktorVedmich/`). The vault is searchable via **QMD** MCP (BM25 + vector hybrid search).

> **IMPORTANT:** NEVER use `10-AWS/11-Active-Clients/`, `14-Tips-AWS-Internal/`, or `16-Amazon-Employer/` — these contain confidential internal AWS data.

### Site Section → Vault Source

| Site Section | Vault Source Path | Notes |
|---|---|---|
| Bio / About | `30-Projects/34-Personal-Brand/2026-02-23-JetBrains-CV-Draft.md` | Skills, certs, experience |
| Project tracking | `30-Projects/34-Personal-Brand/vedmich.dev Website.md` | Roadmap, TODO, content candidates |
| DKT podcast data | `30-Projects/32-DKT/+ DKT.md` | 91+ eps, 10K+ subs, episode MOC |
| AWS podcast data | `10-AWS/15-Content-YT-Podcat-Talks/15.10-AWS-RU-Podcast/` | 65+ eps, 70K+ listens |
| Speaking / CFPs | `15-Content-YT-Podcat-Talks/15.30-Conference-CFPs/15.31-Talks-Materials/` | Talk titles, ratings |
| Speaking portfolio | `15-Content-YT-Podcat-Talks/15.50-Speaking-Portfolio/` | Bio, speaker rating |
| Book | `30-Projects/33-Book-Kubernetes/` | 128 files, 17 chapters, 50+ diagrams |

### Blog Content Sources (Vault → Blog)

All vault areas below are fair game for blog posts. Organized by priority.

#### HIGHEST priority — rich, ready-to-publish content

| Source | Vault Path | ~Files | Blog Use |
|---|---|---|---|
| **Kubernetes Book** | `33-Book-Kubernetes/` | 128 | Chapter extracts → tutorial series (Karpenter, GitOps, HA, troubleshooting) |
| **Tech KB — AWS** | `73-KB-Tech/73.10-AWS/` | 80+ | Service deep-dives (Lambda, EKS, DynamoDB, VPC, Karpenter) |
| **Tech KB — K8S** | `73-KB-Tech/73.50-K8S/` | 10+ | ETCD, networking, tools, troubleshooting |
| **Tech KB — Architect** | `73-KB-Tech/73.30-Architect/` | 8+ | System design, database selection, consistency |
| **Tech KB — AI/ML** | `73-KB-Tech/73.20-AI/` | 10+ | Claude Code, agents, prompt engineering |
| **Tech KB — SRE/DevOps** | `73-KB-Tech/73.60-SRE-DevOps/` | 20+ | Interview prep, networking, Linux |

#### HIGH priority — podcast episodes → companion blog posts

| Source | Vault Path | ~Files | Blog Use |
|---|---|---|---|
| **DKT episodes** | `32-DKT/` | 111 | Episode companion posts, tool reviews, interview guides |
| **AWS RU Podcast** | `15.10-AWS-RU-Podcast/` | 24 | Episode summaries, agentic AI patterns, architecture trends |
| **AI for DevOps course** | `37-AI-DevOps-Course/` | 54 | n8n automation, Claude Code agents, prompt engineering tutorials |

**Podcast → Blog workflow:**
When a new DKT or AWS podcast episode is published, create a companion blog post:
1. Find episode notes via QMD: `qmd search "DKT91"` or `qmd search "episode topic"`
2. Extract key technical insights, code examples, diagrams
3. Write blog post expanding on the episode's topic
4. Link to YouTube/Spotify episode in the post
5. Tag with `podcast`, `dkt` or `aws-podcast`, + topic tags

#### MEDIUM priority — learning & research content

| Source | Vault Path | ~Files | Blog Use |
|---|---|---|---|
| **Certifications** | `72-Learn/72.20-Certification/` | 120+ | CKA/CKS/CKAD guides, AWS cert tips |
| **Research** | `20-Calendar/27-Research/YYYY/` | 35 | Tech evaluations, architectural decisions |
| **Conference talks** | `15.31-Talks-Materials/` | 7 | Expanded talk write-ups |
| **Community / UGs** | `10-AWS/17-UG/` | 4 | Community event summaries |

#### LOWER priority — niche but valuable

| Source | Vault Path | ~Files | Blog Use |
|---|---|---|---|
| **Homelab** | `35-Homelab-Infrastructure/` | 10 | Proxmox setup, network guides |
| **Tech KB — CS/prog** | `73-KB-Tech/73.40-CS-programming/` | 5+ | Go, Python, uv package manager |
| **PKM / Obsidian** | `76-KB-Non-Tech/76.10-PKM-Obsidian/` | 30+ | Personal knowledge management, second brain |

### QMD Search Patterns

```bash
# Find content by topic
qmd search "karpenter autoscaling"
qmd vector_search "kubernetes cost optimization"
qmd deep_search "agentic AI patterns"

# Find DKT episode notes
qmd search "DKT91"
qmd search "DevOps Kitchen Talks mock interview"

# Find AWS podcast episodes
qmd search "AWS на русском agentic"

# Find book chapters
qmd search "kubernetes rolling update"

# Find certification notes
qmd search "CKA RBAC practice"
```

### Vault → Blog Post Workflow

1. **Find source:** Use QMD to locate vault note(s) on the topic
2. **Read & synthesize:** Combine multiple vault notes if needed
3. **Adapt for web:**
   - Remove `[[internal links]]` — replace with explanations or external links
   - Expand abbreviations and context (vault notes assume background knowledge)
   - Add introduction and conclusion for standalone reading
   - Convert Excalidraw references to inline diagrams or descriptions
4. **Create post:** `src/content/blog/{en,ru}/YYYY-MM-DD-slug.md`
5. **Set frontmatter:** title, description, date, tags, draft
6. **Build & verify:** `npm run build`
7. **Push:** Auto-deploys via GitHub Actions

---

## Publishing Workflow (small updates — links, presentations, articles)

**Small changes** (adding a new presentation link, a blog post, updating a bio) are fast — **no design work, no PR review needed**, push straight to `main` and GitHub Pages redeploys in ~2 min.

### Adding a new presentation

1. Edit `src/data/social.ts` → `presentations` array. Add an entry:
   ```ts
   { title: '...', slug: 'deck-slug', description: '...', tags: ['AI', 'DevOps'] }
   ```
2. The `slug` must match the Slidev deployment path (e.g. `s.vedmich.dev/<slug>/`).
3. `git commit -m "Add <Talk Name> presentation"` → `git push origin main`.
4. GH Actions deploys in ~2 min. Verify live at `vedmich.dev/en/#presentations`.

### Adding a new blog post

1. Create `src/content/blog/{en,ru}/YYYY-MM-DD-slug.md` (both locales ideally).
2. Frontmatter: `title`, `description`, `date`, `tags`, `draft: false`.
3. Write content in markdown. Code blocks get Deep Signal syntax highlighting automatically via Shiki + prose-invert.
4. `git commit -m "Post: <title>"` → `git push origin main`.
5. Post appears at `/{locale}/blog/<slug>` + top 3 in homepage BlogPreview.

### Adding a new speaking event

1. Edit `src/data/social.ts` → `speakingEvents` array. Add to the correct `year` group or create a new year.
2. `git commit && git push`.

### Small text/bio edits

- English strings: `src/i18n/en.json`
- Russian strings: `src/i18n/ru.json`
- Keys: `hero.tagline`, `about.bio`, `speaking.subtitle`, etc.
- `git commit && git push` — auto-deploy.

### Big changes (design tokens, layout, new sections)

These need a PR + visual review:
1. `git checkout -b <feature-branch>`
2. Iterate locally with `npm run dev`
3. `npm run build` must pass with zero errors
4. Capture before/after screenshots of affected sections (Playwright MCP: "screenshot localhost:4321/en/ at 1440px")
5. Push branch, open PR to `main`, attach screenshots in PR body
6. Review → merge → auto-deploy

### Deployment monitoring

- Actions tab: `https://github.com/vedmichv/vedmich.dev/actions`
- Typical build time: ~90s · Typical deploy: ~60s
- If deploy fails, check GH Actions log and fix on `main` (`revert` or forward-fix).

---

## Slidev Presentations Integration

Current presentations are hosted at `s.vedmich.dev` (repo `vedmichv/slidev`).

**Phase 7 (future):** Migrate Slidev builds into `public/slides/` so presentations live at `vedmich.dev/slides/`.

| Presentation | Current URL | Theme |
|---|---|---|
| Prompt Engineering for DevOps | `s.vedmich.dev/slurm-prompt-engineering/` | slidev-theme-slurm |
| Slurm AI Demo | `s.vedmich.dev/slurm-ai-demo/` | slidev-theme-slurm |
| DKT demos | `dkt-ai.github.io/slidev/dkt-demo/` | slidev-theme-dkt |

Slidev repos: `vedmichv/slidev`, `DKT-AI/slidev`
Theme repos: `vedmichv/slidev-theme-slurm`, `DKT-AI/slidev-theme-dkt`

---

## Development

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build static site to dist/
npm run preview   # Preview built site locally
```

### Adding New Pages

- EN page: `src/pages/en/page-name.astro`
- RU page: `src/pages/ru/page-name.astro` (mirror)
- Always pass `locale` prop to all components
- Use `t(locale)` for translated strings

### CSS / Styling

- Tokens live in `src/styles/design-tokens.css` (CSS variables + @font-face)
- Tailwind 4 `@theme` in `src/styles/global.css` maps utility names to design tokens
- Custom CSS classes: `.animate-on-scroll`, `.card-glow`, `.typing-cursor`
- Blog prose styling uses `@tailwindcss/typography` (prose-invert, teal accents)
- **Never add hardcoded hex colors to components** — always reference a token

### i18n & Language Detection

- Root `/` auto-detects browser language (ru/be/uk → `/ru/`, else → `/en/`)
- User choice saved in `localStorage('vedmich-lang')` — persists across visits
- Language switcher in header also saves preference
- `<noscript>` fallback redirects to `/en/`

---

## MCP Servers (`.mcp.json`)

| Server | Purpose |
|---|---|
| **Playwright** | Visual testing, screenshots, responsive checks, accessibility |
| **Context7** | Live documentation lookup for Astro, Tailwind, and other deps |

### Usage Examples

```
# Playwright — visual testing
"Take a screenshot of localhost:4321/en/ at 375px width"
"Check if all nav links work on /ru/"
"Verify the blog post renders correctly"

# Context7 — docs lookup
"Show me Astro Content Collections API"
"How does Tailwind 4 @theme work?"
"Astro i18n routing configuration"
```

### TODO: Future MCP / Tooling

- [ ] Lighthouse MCP — Core Web Vitals, SEO, accessibility audits
- [ ] Image optimization pipeline (astro:assets or sharp)
- [ ] RSS feed integration (`@astrojs/rss`)
- [ ] Search integration (Pagefind or similar)
- [ ] Obsidian → blog sync script (watch vault, auto-create posts)

---

## Deployment

**Automatic:** Push to `main` → GitHub Actions builds → deploys to GitHub Pages.

**DNS (Route 53):**

| Record | Type | Value |
|--------|------|-------|
| `vedmich.dev` | A | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| `www.vedmich.dev` | CNAME | `vedmichv.github.io` |
| `s.vedmich.dev` | CNAME | `vedmichv.github.io` (Slidev presentations, keep) |

---

## Social Links

- LinkedIn: https://de.linkedin.com/in/vedmich
- GitHub: https://github.com/vedmichv
- YouTube: https://www.youtube.com/c/DevOpsKitchenTalks
- X: https://x.com/vedmichv
- Telegram: https://t.me/ViktorVedmich
- Book: https://www.amazon.com/dp/1835460038
