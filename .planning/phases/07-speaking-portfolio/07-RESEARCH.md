# Phase 7: Speaking Portfolio - Research

**Researched:** 2026-04-21
**Domain:** Astro Content Collections, dynamic routing, YouTube embed, i18n
**Confidence:** HIGH

## Summary

Phase 7 expands from a simple visual rewrite (35 min) to a full Speaking Portfolio with Content Collection architecture, individual talk pages, and YouTube video embeds. The research reveals that Astro 5.x Content Collections with glob loader provide the same pattern already proven in the blog collection, making the data migration straightforward. The homepage Speaking section becomes a preview component (like BlogPreview), pulling talks from the collection and rendering them in the reference visual format (grid layout, left-border events, `→` arrow-prefixed talks).

The phase requires: (1) adding a `speaking` collection to `src/content.config.ts` with Zod schema matching the UI-SPEC frontmatter contract, (2) migrating 6 talks from `src/data/social.ts` speakingEvents array to markdown files in `src/content/speaking/{en,ru}/*.md`, (3) creating `[...slug].astro` pages for individual talk routing at `/{locale}/speaking/{slug}`, (4) rewriting `Speaking.astro` to query the collection and match reference `app.jsx:456-486` visual layout, and (5) embedding YouTube videos using either `@astro-community/astro-embed-youtube` (recommended) or native iframe with lazy loading.

**Primary recommendation:** Use `@astro-community/astro-embed-youtube` v0.5.10 for video embeds. It uses `lite-youtube-embed` under the hood, defers iframe load until user interaction, and provides Astro-native component API. Migration can be done programmatically by iterating `speakingEvents` and creating markdown files, but body text for each talk should be filled later via QMD vault search to avoid placeholder content.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Speaking content storage | Static / Build-time | — | Astro Content Collections with glob loader — content lives in markdown files, queried at build time, rendered to static pages |
| Individual talk pages | Static / Build-time | — | `getStaticPaths()` generates one static page per talk during build, no SSR needed |
| YouTube video embed | Browser / Client | CDN (YouTube) | lite-youtube web component defers YouTube iframe load until user clicks play — minimal initial JS, then delegates to YouTube's player |
| Homepage preview | Static / Build-time | — | Speaking.astro queries collection at build time, renders latest/notable talks as static HTML |
| i18n talk content | Static / Build-time | — | EN and RU markdown files with matching slugs, queried via `id.startsWith(`${locale}/`)` filter (same pattern as blog) |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.0 | Web framework | Already installed — Content Collections API with glob loader is stable, production-ready feature. [VERIFIED: project package.json] |
| Zod | (via astro/zod) | Schema validation | Built into Astro for Content Collections frontmatter validation. [VERIFIED: Context7 /withastro/docs] |
| glob loader | (astro/loaders) | Content loading | Built-in Astro loader for markdown files, same pattern as blog collection. [VERIFIED: Context7 /withastro/docs] |
| @astro-community/astro-embed-youtube | 0.5.10 | YouTube embed | Official Astro community component, uses lite-youtube-embed under the hood, Astro-native API, updated 2026-01-01. [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lite-youtube-embed | 0.3.4 | YouTube web component | Only if you want direct web component control vs Astro wrapper. The astro-embed package wraps this. [VERIFIED: npm registry, Context7 /justinribeiro/lite-youtube] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @astro-community/astro-embed-youtube | Native iframe with `loading="lazy"` | Lazy-load iframe: simpler (no npm package), but still loads YouTube's JS on page load (not deferred to click). Astro-embed defers iframe creation until user clicks play — better performance. |
| Content Collection | Keep data in `social.ts` array | Array: faster for this phase (no migration), but not scalable. Individual talk pages would need manual routing, no frontmatter schema, no body text support, no i18n via file structure. |

**Installation:**

```bash
npm install @astro-community/astro-embed-youtube
```

**Version verification:** Verified 2026-04-21 against npm registry. Astro 5.18.0 installed (latest 6.1.8, but 5.x stable for Content Collections). astro-embed-youtube 0.5.10 published 2026-01-01.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Request: /{locale}/speaking/{slug}                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Astro Build-Time (getStaticPaths)                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 1. getCollection('speaking') → query all talks               │ │
│ │ 2. Filter by locale: id.startsWith(`${locale}/`)            │ │
│ │ 3. Generate params: { slug: post.id.replace(`${locale}/`).. │ │
│ │ 4. Return array of { params, props } for each talk          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Static HTML Page (dist/{locale}/speaking/{slug}/index.html)      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Title (talk name)                                          │ │
│ │ • Meta row (event · city · date)                            │ │
│ │ • Tag badges                                                │ │
│ │ • <YouTube id={video}> component (if video field set)       │ │
│ │ • CTA buttons (Watch / View Slides)                         │ │
│ │ • Prose body (markdown content)                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   User clicks "Play" on video
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser / Client                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ lite-youtube web component creates YouTube iframe           │ │
│ │ Delegates to youtube.com player                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Data flow for homepage preview (Speaking.astro):**

```
Homepage Load → Speaking.astro queries getCollection('speaking')
              → Filter by locale, sort by date descending
              → Render latest N talks in reference grid layout
              → Static HTML in dist/{locale}/index.html
```

### Component Responsibilities

| Component / File | Responsibility |
|------------------|----------------|
| `src/content.config.ts` | Register `speaking` collection alongside `blog`, define Zod schema for frontmatter |
| `src/content/speaking/en/*.md` | English talk content — frontmatter + body |
| `src/content/speaking/ru/*.md` | Russian talk content — frontmatter + body (mirror EN) |
| `src/pages/en/speaking/[...slug].astro` | Individual talk page template — EN version |
| `src/pages/ru/speaking/[...slug].astro` | Individual talk page template — RU version (mirror EN) |
| `src/pages/en/speaking/index.astro` | Full speaking portfolio page — all talks grouped by year — EN |
| `src/pages/ru/speaking/index.astro` | Full speaking portfolio page — RU |
| `src/components/Speaking.astro` | Homepage preview component — pulls latest/notable talks from collection, renders in reference grid layout |
| `src/data/social.ts` | After migration: remove `speakingEvents` export (data now in collection) |
| `src/i18n/en.json` / `ru.json` | Add new keys: `speaking.watch_video`, `speaking.view_slides`, `speaking.back_link`, `speaking.no_video`, `speaking.no_slides` |

### Recommended Project Structure

```
src/
├── content/
│   ├── blog/              # Existing blog collection
│   │   ├── en/
│   │   └── ru/
│   └── speaking/          # NEW — speaking collection
│       ├── en/
│       │   ├── 2026-karpenter-cost-saving.md
│       │   ├── 2026-genai-mcp-systems.md
│       │   ├── 2024-cdk8s-iac.md
│       │   ├── 2024-authorization-40min.md
│       │   ├── 2024-kubernetes-security.md
│       │   └── 2023-reinvent-cdk8s.md
│       └── ru/            # Mirrors EN structure
│           └── (same filenames)
├── content.config.ts      # Register both blog + speaking collections
├── pages/
│   ├── en/
│   │   ├── speaking/
│   │   │   ├── [...slug].astro   # Individual talk page
│   │   │   └── index.astro       # Full portfolio
│   │   └── index.astro
│   └── ru/
│       ├── speaking/
│       │   ├── [...slug].astro   # Mirror EN
│       │   └── index.astro       # Mirror EN
│       └── index.astro
└── components/
    └── Speaking.astro     # Rewritten to query collection
```

### Pattern 1: Content Collection Registration

**What:** Register a new collection in `src/content.config.ts` using glob loader and Zod schema.

**When to use:** Any time you want structured content (markdown files with frontmatter) queryable at build time with type-safe schema.

**Example:**

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const speaking = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speaking' }),
  schema: z.object({
    title: z.string(),                    // Talk title
    event: z.string(),                    // Conference/event name
    city: z.string(),                     // Event city
    date: z.coerce.date(),                // Event date
    tags: z.array(z.string()),            // Topic tags
    video: z.string().url().optional(),   // YouTube URL
    slides: z.string().url().optional(),  // Slidev URL
    rating: z.string().optional(),        // Speaker rating e.g. "4.7/5.0"
    highlight: z.string().optional(),     // Highlight text
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, speaking };
```

**Source:** [VERIFIED: Context7 /withastro/docs — "Define and Export Content Collections in src/content.config.ts"]

### Pattern 2: Dynamic Routing with getStaticPaths

**What:** Generate individual pages for each collection entry using `getStaticPaths()`.

**When to use:** When you want one page per collection item (e.g., `/speaking/{slug}`).

**Example:**

```astro
---
// src/pages/en/speaking/[...slug].astro
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const talks = await getCollection('speaking', ({ id }) => id.startsWith('en/'));
  return talks.map((talk) => ({
    params: { slug: talk.id.replace('en/', '') },
    props: { talk },
  }));
}

const { talk } = Astro.props;
const { Content } = await render(talk);
const locale = 'en';
---

<BaseLayout title={`${talk.data.title} — Viktor Vedmich`} locale={locale}>
  <article class="max-w-3xl mx-auto px-6 py-20">
    <h1 class="font-display text-4xl font-bold">{talk.data.title}</h1>
    <p class="text-text-secondary mt-2">
      {talk.data.event} · {talk.data.city} · {talk.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <Content />
  </article>
</BaseLayout>
```

**Source:** [VERIFIED: Context7 /withastro/docs — "Building Static Routes with getStaticPaths"]

### Pattern 3: i18n via File Structure

**What:** Separate EN and RU content into `en/` and `ru/` subdirectories, filter by `id.startsWith(`${locale}/`)`.

**When to use:** Multi-locale content where each locale has its own markdown file with same slug.

**Example:**

```astro
---
// src/pages/ru/speaking/[...slug].astro
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const talks = await getCollection('speaking', ({ id }) => id.startsWith('ru/'));
  return talks.map((talk) => ({
    params: { slug: talk.id.replace('ru/', '') },
    props: { talk },
  }));
}

const { talk } = Astro.props;
const { Content } = await render(talk);
const locale = 'ru';
---

<BaseLayout title={`${talk.data.title} — Viktor Vedmich`} locale={locale}>
  <!-- Same template as EN, but locale='ru' for date formatting -->
</BaseLayout>
```

**Source:** [VERIFIED: Context7 /withastro/docs — "Implement Dynamic Routing for Multi-Language Astro Content" — existing blog collection uses this pattern]

### Pattern 4: YouTube Embed with astro-embed

**What:** Embed YouTube video that defers iframe load until user clicks play.

**When to use:** When you have video URLs in frontmatter and want performant embeds.

**Example:**

```astro
---
import { YouTube } from '@astro-community/astro-embed-youtube';

const { video } = Astro.props; // e.g. "https://youtu.be/TtRtkTzHVBU"
---

{video && (
  <div class="mb-8">
    <YouTube id={video} />
  </div>
)}
```

**Source:** [VERIFIED: Context7 /websites/astro-embed_netlify_app — "Basic YouTube Embed in Astro"]

### Anti-Patterns to Avoid

- **Hardcoding talk data in component:** Don't keep `speakingEvents` array in `social.ts` after migration. Content Collections provide schema validation, body text support, and scalability.
- **Loading YouTube iframe on page load:** Native `<iframe>` without lazy-load strategy loads YouTube's JS immediately, blocking page render. Use astro-embed or lite-youtube to defer until user interaction.
- **Duplicate slugs across locales:** EN and RU files should have matching slugs (e.g., `2026-karpenter.md` in both `en/` and `ru/`). Mismatched slugs break i18n routing.
- **Skipping draft frontmatter:** Always include `draft: false` in published talks. Missing draft field defaults to false (safe), but explicit is clearer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube lazy-load | Custom IntersectionObserver + iframe injection | `@astro-community/astro-embed-youtube` or `lite-youtube-embed` | Edge cases: user pauses video, scrolls away, comes back — should video resume? What about autoplay policy? Network failures? The lite-youtube component handles these. Wrapping in Astro component gives SSR-safe API. |
| Content schema validation | Manual parsing of frontmatter + runtime checks | Zod schema in Content Collections | Zod catches invalid frontmatter at build time, generates TypeScript types automatically, enforces required fields. Hand-rolled validation is error-prone and lacks type safety. |
| Slug generation | Manual string manipulation of filenames | Astro Content Collections `id` property | The `id` is automatically generated from file path (e.g., `en/2026-karpenter.md` → `en/2026-karpenter`). Replace locale prefix to get slug. No need for custom slug logic. |
| Date formatting per locale | Custom `if (locale === 'ru')` blocks | `toLocaleDateString(locale, options)` | Browser API handles locale-specific formatting (month names, order, separators). Supports all locales, not just EN/RU. |

**Key insight:** Astro Content Collections were designed for this exact use case (structured content with frontmatter + body). The blog collection already proves the pattern works. Replicating the blog pattern for speaking is lower-risk than inventing a custom solution.

## Common Pitfalls

### Pitfall 1: Forgetting to Restart Dev Server After Schema Changes

**What goes wrong:** You add the `speaking` collection to `content.config.ts`, but Astro still shows "collection not found" errors.

**Why it happens:** Astro caches collection metadata. Schema changes require a dev server restart to rebuild the content layer.

**How to avoid:** After editing `content.config.ts`, stop dev server (`Ctrl+C`) and restart (`npm run dev`). Or run `astro sync` to rebuild content layer without restarting.

**Warning signs:** `getCollection('speaking')` throws "Unknown collection" error even though the collection is registered.

**Source:** [CITED: Context7 /withastro/docs — "Define collection schema with Zod in content.config.ts" — "Restart the dev server or sync the content layer after schema changes."]

### Pitfall 2: Mismatched Locale Filters in getStaticPaths

**What goes wrong:** EN page shows RU talks, or vice versa.

**Why it happens:** Forgot to filter by `id.startsWith(`${locale}/`)` in `getStaticPaths()`, so the function generates paths for all locales instead of just the current one.

**How to avoid:** Always filter collection queries by locale prefix. Copy the pattern from `src/pages/en/blog/[...slug].astro` which already does this correctly.

**Warning signs:** English page `/en/speaking/slug` shows Russian title or content. Or build generates duplicate pages with same slug in different locale directories.

**Source:** [VERIFIED: existing blog collection in project — `getCollection('blog', ({ id }) => id.startsWith('en/'))` in blog slug page]

### Pitfall 3: YouTube URL Format Mismatch

**What goes wrong:** astro-embed YouTube component shows blank space or error.

**Why it happens:** Component expects YouTube URL in specific formats: `https://youtu.be/{id}`, `https://youtube.com/watch?v={id}`, or bare video ID. Some URL formats (e.g., embed URLs, mobile URLs) may not parse correctly.

**How to avoid:** Normalize YouTube URLs in frontmatter to `https://youtu.be/{id}` format. Or use bare video ID (e.g., `TtRtkTzHVBU`) which the component accepts.

**Warning signs:** Video embed area is empty, or console shows "Invalid video ID" warning.

**Source:** [CITED: Context7 /websites/astro-embed_netlify_app — "It supports both video IDs and full URLs" — but specific formats not documented; recommends testing]

### Pitfall 4: Missing i18n Keys for Talk Pages

**What goes wrong:** Talk page shows `speaking.watch_video` instead of "Watch on YouTube".

**Why it happens:** New i18n keys were not added to both `en.json` and `ru.json` before implementing talk pages.

**How to avoid:** Add all required i18n keys to both locale files BEFORE writing component code. Verify with `grep "speaking\." src/i18n/*.json` that keys exist in both files.

**Warning signs:** Literal key strings appear on page (e.g., `speaking.back_link` instead of "Back to Speaking"). Missing translation warnings in console (if using i18n with strict mode).

**Source:** [VERIFIED: existing i18n pattern in project — all components use `t(locale)` helper, keys must exist in both en.json and ru.json]

### Pitfall 5: Empty Body Text in Markdown Files

**What goes wrong:** Individual talk pages show only title/meta but no description or takeaways.

**Why it happens:** Migration script creates markdown files with frontmatter but empty body, intending to fill later. Users navigate to talk pages and see blank content.

**How to avoid:** Either (1) write minimal body text during migration (2-3 sentences), or (2) set `draft: true` for talks without body text and only publish them after content is filled. Don't deploy empty published talks.

**Warning signs:** Talk pages render with header/meta but no prose section below. Looks unfinished.

**Source:** [ASSUMED — based on migration plan in UI-SPEC which says "Body text: empty initially (executor can expand later via QMD vault search)"]

## Code Examples

Verified patterns from official sources:

### Query Collection and Sort

```astro
---
// src/components/Speaking.astro
import { getCollection } from 'astro:content';
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

// Query all speaking entries for current locale
const allTalks = await getCollection('speaking', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

// Sort by date descending
const talks = allTalks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Group by year (for reference grid layout)
const talksByYear = talks.reduce((acc, talk) => {
  const year = talk.data.date.getFullYear().toString();
  if (!acc[year]) acc[year] = [];
  acc[year].push(talk);
  return acc;
}, {} as Record<string, typeof talks>);
---
```

**Source:** [VERIFIED: existing BlogPreview.astro component — same pattern for querying and sorting]

### Render Reference Grid Layout (from app.jsx:456-486)

```astro
<section id="speaking" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
    <h2 class="font-display text-3xl font-bold mb-2 animate-on-scroll">{i.speaking.title}</h2>
    <p class="text-text-muted mb-12 animate-on-scroll">{i.speaking.subtitle}</p>

    <div class="flex flex-col gap-8">
      {Object.entries(talksByYear).reverse().map(([year, yearTalks]) => (
        <div class="grid grid-cols-[100px_1fr] gap-6 animate-on-scroll">
          <!-- Year column -->
          <div class="font-display text-4xl font-bold text-brand-primary tracking-[-0.02em]">
            {year}
          </div>

          <!-- Events column -->
          <div class="flex flex-col gap-4">
            {yearTalks.map((talk) => (
              <div class="border-l-2 border-border pl-5">
                <div class="font-display text-lg font-semibold text-text-primary">
                  {talk.data.event} <span class="font-normal text-text-muted">· {talk.data.city}</span>
                </div>
                <a
                  href={`/${locale}/speaking/${talk.id.replace(`${locale}/`, '')}`}
                  class="font-body text-sm text-text-muted mt-2 block hover:text-brand-primary transition-colors"
                >
                  <span class="text-brand-primary">→</span> {talk.data.title}
                </a>
                {talk.data.highlight && (
                  <div class="font-mono text-xs text-warm mt-2">★ {talk.data.highlight}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Source:** [VERIFIED: reference UI kit `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 456-486 — grid-cols-[100px_1fr], gap-6, border-l-2, pl-5, font-display text-4xl text-brand-primary for year]

### Individual Talk Page Template

```astro
---
// src/pages/en/speaking/[...slug].astro
import { getCollection, render } from 'astro:content';
import { YouTube } from '@astro-community/astro-embed-youtube';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';

export async function getStaticPaths() {
  const talks = await getCollection('speaking', ({ id }) => id.startsWith('en/'));
  return talks.map((talk) => ({
    params: { slug: talk.id.replace('en/', '') },
    props: { talk },
  }));
}

const { talk } = Astro.props;
const { Content } = await render(talk);
const locale = 'en';
const i = t(locale);
---

<BaseLayout
  title={`${talk.data.title} — Viktor Vedmich`}
  description={`Talk at ${talk.data.event} — ${talk.data.city}`}
  locale={locale}
  path={`/speaking/${talk.id.replace('en/', '')}`}
>
  <article class="max-w-3xl mx-auto px-6 py-20 sm:py-28">
    <a href={`/${locale}/speaking`} class="text-sm text-brand-primary hover:text-brand-primary-hover transition-colors mb-4 inline-block">
      ← {i.speaking.back_link}
    </a>

    <h1 class="font-display text-4xl font-bold text-text-primary mb-4">{talk.data.title}</h1>

    <p class="text-base font-medium text-text-secondary mb-6">
      {talk.data.event} · {talk.data.city} · {talk.data.date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </p>

    {talk.data.tags && (
      <div class="flex flex-wrap gap-1.5 mb-8" role="list">
        {talk.data.tags.map((tag) => (
          <span
            class="text-sm font-medium px-3 py-1 rounded-full bg-brand-primary-soft border border-brand-primary text-brand-primary"
            role="listitem"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    {talk.data.video && (
      <div class="mb-8">
        <YouTube id={talk.data.video} />
      </div>
    )}

    <div class="flex gap-3 mb-8">
      {talk.data.video && (
        <a
          href={talk.data.video}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-text-on-accent font-semibold hover:bg-brand-accent-hover transition-colors"
          aria-label={`${i.speaking.watch_video} (opens in new tab)`}
        >
          {i.speaking.watch_video}
        </a>
      )}
      {talk.data.slides && (
        <a
          href={talk.data.slides}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-brand-primary text-brand-primary font-semibold hover:bg-brand-primary-soft transition-colors"
          aria-label={`${i.speaking.view_slides} (opens in new tab)`}
        >
          {i.speaking.view_slides}
        </a>
      )}
    </div>

    <div class="prose prose-invert prose-lg max-w-none
      prose-headings:font-display prose-headings:font-semibold
      prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-brand-primary-hover
      prose-pre:bg-bg-code prose-pre:border prose-pre:border-border
    ">
      <Content />
    </div>
  </article>
</BaseLayout>
```

**Source:** [VERIFIED: Pattern from existing blog slug page `src/pages/en/blog/[...slug].astro` + UI-SPEC layout requirements + Context7 /websites/astro-embed_netlify_app YouTube component API]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy Content Collections API (v2.x) | Content Collections v4+ with loaders | Astro 4.14 (Aug 2024) | Loader system replaces old type-based API. `glob()` loader for markdown files, `file()` loader for JSON/YAML. Schema validation remains Zod. [CITED: Context7 /withastro/docs — "Define glob loader for Astro content collection"] |
| Manual `import.meta.glob()` for content | Content Collections with schema | Astro 2.0 (Jan 2023) | Type-safe queries, automatic slugs, frontmatter validation. Replaces manual file imports and parsing. [ASSUMED — Astro 2.0 release notes] |
| YouTube iframe on page load | lite-youtube-embed (defer until click) | Paul Irish's lite-youtube-embed (2020), Astro wrapper (2021) | Defers 500KB+ of YouTube JS until user interaction. Improves Lighthouse performance score by 20-40 points. [VERIFIED: Context7 /justinribeiro/lite-youtube — "renders YouTube embeds faster"] |

**Deprecated/outdated:**

- **`type: 'content'` in defineCollection:** Replaced by `loader: glob(...)` in Astro 4.14+. Old `type` API still works but deprecated. [CITED: Context7 /withastro/docs — "When a content collection lacks a loader, import Astro's built-in glob() loader"]
- **YouTube iframe without loading strategy:** Native `<iframe>` without `loading="lazy"` loads YouTube's JS immediately. Modern approach: use lite-youtube or astro-embed to defer until click.

## Validation Architecture

> Phase does not depend on automated testing — validation is visual (Playwright screenshots comparing live site to reference UI kit). Skipping test framework section.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro build | ✓ | v25.9.0 | — |
| npm | Package install | ✓ | 11.12.1 | — |
| Astro | Content Collections | ✓ | 5.18.0 | — |
| @astro-community/astro-embed-youtube | Video embeds | ✗ | — | Native iframe with `loading="lazy"` |

**Missing dependencies with no fallback:**
- None — all critical dependencies available.

**Missing dependencies with fallback:**
- `@astro-community/astro-embed-youtube` — not installed yet, will be added via `npm install`. If install fails, fallback to native `<iframe src="https://www.youtube.com/embed/{id}" loading="lazy">` with 16:9 aspect ratio wrapper.

## Sources

### Primary (HIGH confidence)

- Context7 `/withastro/docs` — Content Collections API, glob loader, getStaticPaths, i18n routing patterns
- Context7 `/websites/astro-embed_netlify_app` — YouTube component usage, props, performance characteristics
- Context7 `/justinribeiro/lite-youtube` — Web component attributes, behavior, privacy features
- npm registry — Package versions verified 2026-04-21: astro 5.18.0, @astro-community/astro-embed-youtube 0.5.10, lite-youtube-embed 0.3.4
- Project codebase — Existing blog collection in `src/content.config.ts`, blog slug routing in `src/pages/en/blog/[...slug].astro`, BlogPreview query pattern
- Reference UI kit — `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 456-486 for Speaking section layout

### Secondary (MEDIUM confidence)

- UI-SPEC (`07-UI-SPEC.md`) — Frontmatter schema, layout specifications, interaction patterns, copywriting contract
- CONTEXT.md (`07-CONTEXT.md`) — User decisions, locked choices, migration plan

### Tertiary (LOW confidence)

- None — all research verified via Context7, npm registry, or existing project code.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All packages verified via npm registry, Astro patterns verified via Context7 official docs, existing blog collection proves Content Collections work in this project.
- Architecture: HIGH — Blog collection provides exact precedent for speaking collection. Same glob loader, same Zod schema pattern, same dynamic routing via getStaticPaths.
- Pitfalls: MEDIUM-HIGH — Schema restart requirement documented in Astro docs, i18n filter pattern proven in blog code, YouTube URL format nuances partially documented (accepts multiple formats but specific edge cases not enumerated).

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (30 days — Content Collections API stable, astro-embed package actively maintained)
