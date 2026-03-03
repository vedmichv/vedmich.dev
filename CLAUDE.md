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
- **Dark theme only** — colors defined in `@theme` (Tailwind 4): bg `#0F172A`, accent `#06B6D4`, warm `#F59E0B`
- **Fonts** — Inter (body) + JetBrains Mono (code) via Google Fonts

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

- All custom colors/fonts defined in `src/styles/global.css` via `@theme`
- Custom CSS classes: `.animate-on-scroll`, `.card-glow`, `.typing-cursor`
- Blog prose styling uses `@tailwindcss/typography` (prose-invert prose-cyan)

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
