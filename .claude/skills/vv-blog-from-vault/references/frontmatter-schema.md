# Frontmatter Schema — blog post

**Source:** `src/content.config.ts` (blog collection, post-Wave 1). Zod-enforced at build time; any violation fails `npm run build`.

## Required

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Sentence case, descriptive. Becomes `<h1>` on slug page + card title. |
| `description` | string | 15-30 words. Becomes card excerpt + `<p class="text-lg text-text-muted">` on slug page + OG description. |
| `date` | ISO YYYY-MM-DD | Drives sort order on homepage BlogPreview + /blog/ index. |
| `tags` | array of strings | At least 1 tag. Lowercase in source; rendered UPPERCASE via CSS. 2-4 tags typical. |

## Optional (with defaults)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `draft` | boolean | `false` | If `true`, post excluded from all collection queries. |
| `author` | string | `"Viktor Vedmich"` | Rendered on slug page byline. **OMIT FROM EN AND RU FRONTMATTER** unless it's a guest post — see RU author-field note below. |
| `reading_time` | number | (absent) | If absent, the `remark-reading-time` plugin computes `Math.ceil(wordCount/200)` at build. Override only when measured reading deviates significantly. |
| `cover_image` | string | (absent) | Root-absolute path like `/blog-assets/{slug}/cover.png`. Not rendered on cards in Phase 9 — schema-ready for future UI. |

## RU author-field note — CRITICAL

The schema default for `author` is Latin `"Viktor Vedmich"`. The RU slug page (`src/pages/ru/blog/[...slug].astro`, produced by Wave 1 Task 3) contains a locale-aware `authorDisplay` constant that translates `"Viktor Vedmich"` to Cyrillic `"Виктор Ведмич"` at render time. This means:

- **EN RU frontmatter: do NOT set `author:`**. Both locales inherit the Latin default; the RU template translates it to Cyrillic automatically. This is the reason `src/content/blog/ru/hello-world.md` has no `author:` field and still renders `Виктор Ведмич · 1 мин чтения` on `/ru/blog/hello-world/`.
- **Guest-author posts**: set `author: "Guest Name"` in BOTH EN and RU frontmatter (same value). The locale-aware render only translates when `post.data.author === 'Viktor Vedmich'` — every other value passes through unchanged.
- **Why not a separate `author_ru` field?** Because it's extra schema surface every post would need to set correctly, and the common case (Viktor wrote it) becomes boilerplate. Render-layer translation is the cleanest pattern.

See `references/translation-rules.md` § "Author frontmatter note" for the same guidance framed from the translation perspective.

## Examples by post type (D-06)

### Karpenter deep-dive (EN)

```yaml
---
title: "Karpenter in production: right-sizing at scale"
description: "How Salesforce cut 70% of cluster cost with Karpenter — the 3 traps and the 4-step rollout."
date: 2026-03-20
tags: ["kubernetes", "aws", "karpenter"]
---
```

### MCP explainer (EN)

```yaml
---
title: "MCP servers, plainly explained"
description: "What a Model Context Protocol server actually does — and the difference between AWS Knowledge MCP and AWS Documentation MCP."
date: 2026-03-02
tags: ["ai", "mcp", "agents"]
---
```

### Manifests opinion (EN)

```yaml
---
title: "Why I still write Kubernetes manifests by hand"
description: "Helm and Kustomize are great. Here's why I don't reach for them first."
date: 2026-02-10
tags: ["kubernetes", "opinion"]
---
```

### RU equivalents

Only `title` and `description` translate. `date`, `tags`, `slug` stay identical. `author` is OMITTED (inherits Latin default; RU slug page translates to Cyrillic at render). Example:

```yaml
---
title: "Karpenter в продакшне: right-sizing в масштабе"
description: "Как Salesforce сократили 70% стоимости кластеров с Karpenter — 3 ловушки и 4-шаговый rollout."
date: 2026-03-20
tags: ["kubernetes", "aws", "karpenter"]
---
```

Note the absence of `author:` — the RU byline will render `Виктор Ведмич · N мин чтения` automatically via the Wave 1 Task 3 locale-aware render.

## Rules

- File path: `src/content/blog/{en,ru}/YYYY-MM-DD-slug.md`.
- Slug MUST match between EN and RU — a post is one slug with two locales.
- Image references inside the body MUST be root-absolute: `![alt](/blog-assets/{slug}/file.png)`. Relative paths break at `/ru/blog/{slug}` (Pitfall 5 in RESEARCH.md).
- `draft: true` is the escape valve while drafting — flip to `false` (or omit) on commit.
- Do NOT set `author:` in either locale unless it's a guest post (then set same value in both).

## Validation

`npm run build` enforces the Zod schema. Any field violation = build fails with a readable error naming the field and file.
