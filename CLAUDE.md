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

This site's content is sourced from Viktor's Obsidian PKM vault. When working in the vault context, these paths map to site content:

| Site Section | Vault Source Path | Notes |
|---|---|---|
| Bio / About | `30-Projects/34-Personal-Brand/2026-02-23-JetBrains-CV-Draft.md` | Skills, certifications, experience |
| Project tracking | `30-Projects/34-Personal-Brand/vedmich.dev Website.md` | Roadmap, TODO, content candidates |
| DKT podcast data | `30-Projects/32-DKT/+ DKT.md` | Episode count, stats, links |
| AWS podcast data | `10-AWS/15-Content-YT-Podcat-Talks/15.10-AWS-RU-Podcast/` | Episode stats, format |
| Speaking / CFPs | `10-AWS/15-Content-YT-Podcat-Talks/15.30-Conference-CFPs/15.31-Talks-Materials/` | Talk titles, ratings |
| Speaking portfolio | `10-AWS/15-Content-YT-Podcat-Talks/15.50-Speaking-Portfolio/` | Bio, speaker rating |
| Book | Amazon link: `https://www.amazon.com/dp/1835460038` | |

### Blog Content Candidates (Vault → Blog)

When user asks to publish a vault note as a blog post, source content from these KB areas:

| Topic | Vault KB Path | QMD Search |
|---|---|---|
| AWS services | `73-KB-Tech/73.10-AWS/` | `qmd search "topic" --collection vault` |
| Kubernetes | `73-KB-Tech/73.50-K8S/` | Search for CKA/CKS/CKAD content |
| Architecture patterns | `73-KB-Tech/73.30-Architect/` | Distributed systems, microservices |
| AI/ML | `73-KB-Tech/73.20-AI/` | GenAI, LLM, agents |
| SRE/DevOps | `73-KB-Tech/73.60-SRE-DevOps/` | Observability, reliability |
| Conference write-ups | `15.31-Talks-Materials/` | Expanded talk versions |
| Research | `20-Calendar/27-Research/YYYY/` | Deep research outputs |

**Workflow: Vault note → Blog post:**
1. Use QMD to find source note(s) in vault
2. Read and synthesize content
3. Adapt for web audience (remove internal links, expand context)
4. Create `src/content/blog/{en,ru}/YYYY-MM-DD-slug.md`
5. Set frontmatter (title, description, date, tags)
6. Build and verify: `npm run build`

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
