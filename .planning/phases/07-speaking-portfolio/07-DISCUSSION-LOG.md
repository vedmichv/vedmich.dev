# Phase 7: Speaking Portfolio - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 07-speaking-portfolio
**Areas discussed:** Section background, Cards vs left-border, Scroll animations, Speaking Portfolio scope, Data model, Talk pages, Frontmatter, Granularity

---

## Section Background

| Option | Description | Selected |
|--------|-------------|----------|
| bg-surface as reference | Creates visual separation between Book (amber band) and Speaking. Rhythm: Hero→About→Podcasts→Book(amber)→Speaking(surface)→Presentations | ✓ |
| transparent as now | Keeps current look but diverges from reference | |

**User's choice:** bg-surface as reference
**Notes:** Follows reference `app.jsx:457` `bg={VV.surface}`

---

## Cards vs Left-border

| Option | Description | Selected |
|--------|-------------|----------|
| Left-border as reference | Clean minimal — borderLeft 2px separates year from events. Remove card-glow and timeline dots. Grid 100px 1fr replaces timeline. | ✓ |
| Cards as now | Keep card-glow + background cards but change content to reference format | |

**User's choice:** Left-border as reference
**Notes:** Full reference match — removes timeline dot/line, card backgrounds, card-glow

---

## Scroll Animations

| Option | Description | Selected |
|--------|-------------|----------|
| Keep animate-on-scroll | All sections use it — removing only from Speaking breaks consistency. Reference just doesn't model animations. | ✓ |
| Remove | Cleaner code but inconsistent with other sections | |

**User's choice:** Keep animate-on-scroll

---

## Speaking Portfolio Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Deferred to v0.5 | Visual match to reference now, full portfolio in next milestone | |
| Expand Phase 7 to portfolio | Both visual + content collection + pages. ~3-4 hours instead of 35 min. | ✓ |

**User's choice:** Expand Phase 7 to full portfolio
**Notes:** User wants a "speaking log" — like a blog but for talks. Show where they spoke, link video recordings, shareable pages.

---

## Data Model

| Option | Description | Selected |
|--------|-------------|----------|
| Content Collection | src/content/speaking/{en,ru}/*.md — like blog. Each talk = md file with frontmatter. Separate pages /speaking/slug. Scalable. | ✓ |
| social.ts as now | Add video/slides fields to current array. Simpler but no separate pages. | |
| social.ts + /speaking page | Data in social.ts but add listing page without individual talk pages. | |

**User's choice:** Content Collection

---

## Talk Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Full page | /speaking/slug — title, event, date, city, description, YouTube embed, slides link, body text. Like a blog post for talks. | ✓ |
| Expandable card | No separate pages — click to expand inline with video + slides. Less work, no SEO. | |

**User's choice:** Full page

---

## Frontmatter Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Full set | title, event, city, date, tags, video, slides, rating, highlight, draft. Video/slides/rating optional. | ✓ |
| Minimal | title, event, date, city, tags, video only. | |

**User's choice:** Full set

---

## Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| 1 file = 1 talk | Each talk = separate md. Code Europe with 2 talks = 2 files. Better for SEO, individual sharing. | ✓ |
| 1 file = 1 event | Code Europe 2026 = 1 md with 2 talks inside. Fewer files. | |

**User's choice:** 1 file = 1 talk

---

## Claude's Discretion

- Talk page layout design
- YouTube embed approach (lite-youtube-embed vs lazy iframe)
- Homepage preview count vs "View all" link
- i18n key additions
- Slug generation
