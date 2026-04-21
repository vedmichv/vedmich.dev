# Phase 7: Speaking Portfolio - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 11 new/modified files
**Analogs found:** 10 / 11

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content.config.ts` | config | build-time | `src/content.config.ts` (existing blog collection) | exact |
| `src/content/speaking/en/*.md` | content | static | `src/content/blog/en/hello-world.md` | exact |
| `src/content/speaking/ru/*.md` | content | static | `src/content/blog/en/hello-world.md` | exact |
| `src/components/Speaking.astro` | component | build-time query | `src/components/BlogPreview.astro` | exact |
| `src/pages/en/speaking/[...slug].astro` | page | dynamic routing | `src/pages/en/blog/[...slug].astro` | exact |
| `src/pages/ru/speaking/[...slug].astro` | page | dynamic routing | `src/pages/en/blog/[...slug].astro` | exact |
| `src/pages/en/speaking/index.astro` | page | build-time query | `src/components/BlogPreview.astro` + `Speaking.astro` | role-match |
| `src/pages/ru/speaking/index.astro` | page | build-time query | `src/components/BlogPreview.astro` + `Speaking.astro` | role-match |
| `src/i18n/en.json` | config | static | `src/i18n/en.json` (existing keys) | exact |
| `src/i18n/ru.json` | config | static | `src/i18n/ru.json` (existing keys) | exact |
| `src/data/social.ts` | config | static | `src/data/social.ts` (remove speakingEvents) | exact |

## Pattern Assignments

### `src/content.config.ts` (config, build-time)

**Analog:** `src/content.config.ts` (lines 1-15) — existing blog collection

**Imports pattern** (lines 1-2):
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
```

**Collection registration pattern** (lines 4-13):
```typescript
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
```

**Pattern to replicate for speaking collection:**
```typescript
const speaking = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speaking' }),
  schema: z.object({
    title: z.string(),                    // Talk title
    event: z.string(),                    // Conference/event name
    city: z.string(),                     // Event city
    date: z.coerce.date(),                // Event date
    tags: z.array(z.string()),            // Topic tags (required for speaking)
    video: z.string().url().optional(),   // YouTube URL
    slides: z.string().url().optional(),  // Slidev URL
    rating: z.string().optional(),        // Speaker rating e.g. "4.7/5.0"
    highlight: z.string().optional(),     // Highlight text
    draft: z.boolean().default(false),
  }),
});
```

**Export pattern** (line 15):
```typescript
export const collections = { blog };
```
Replace with:
```typescript
export const collections = { blog, speaking };
```

---

### `src/content/speaking/en/*.md` (content, static)

**Analog:** `src/content/blog/en/hello-world.md` (lines 1-6)

**Frontmatter pattern:**
```yaml
---
title: "Hello World: Launching vedmich.dev"
description: "Why I built a personal site and what to expect here — architecture notes, Kubernetes deep-dives, and lessons from building at scale."
date: 2026-03-03
tags: ["personal", "announcement"]
---
```

**Pattern to replicate for speaking content:**
```yaml
---
title: "Mastering Kubernetes Scalability with Karpenter"
event: "Code Europe"
city: "Krakow"
date: 2026-03-08
tags: ["Kubernetes", "AWS", "Karpenter"]
video: "https://youtu.be/VIDEO_ID"
slides: "https://s.vedmich.dev/karpenter-prod/"
draft: false
---

Talk description goes here. Key takeaways, context, and any relevant notes.
```

**Body text pattern** (lines 8-25):
- Use Markdown (headers, lists, code blocks, links)
- First heading typically matches or expands on title
- Structure: Introduction → Key Points → Conclusion/CTA
- Code blocks use triple backticks with language identifier

---

### `src/pages/en/speaking/[...slug].astro` (page, dynamic routing)

**Analog:** `src/pages/en/blog/[...slug].astro` (lines 1-60)

**Imports pattern** (lines 1-3):
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
```

**getStaticPaths pattern** (lines 5-11):
```astro
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ id }) => id.startsWith('en/'));
  return posts.map((post) => ({
    params: { slug: post.id.replace('en/', '') },
    props: { post },
  }));
}
```

**Pattern to replicate for speaking:**
```astro
export async function getStaticPaths() {
  const talks = await getCollection('speaking', ({ id }) => id.startsWith('en/'));
  return talks.map((talk) => ({
    params: { slug: talk.id.replace('en/', '') },
    props: { talk },
  }));
}
```

**Render pattern** (lines 13-15):
```astro
const { post } = Astro.props;
const { Content } = await render(post);
const locale = 'en';
```

**BaseLayout usage** (lines 18-23):
```astro
<BaseLayout
  title={`${post.data.title} — Viktor Vedmich`}
  description={post.data.description}
  locale={locale}
  path={`/blog/${post.id.replace('en/', '')}`}
>
```

**Back link pattern** (lines 26-28):
```astro
<a href="/en/blog" class="text-sm text-accent hover:text-accent-light transition-colors mb-4 inline-block">
  &larr; Back to blog
</a>
```

**Date formatting pattern** (lines 29-35):
```astro
<time class="block text-sm text-text-muted mb-2">
  {post.data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
</time>
```

**Tags rendering pattern** (lines 38-46):
```astro
{post.data.tags && (
  <div class="flex flex-wrap gap-1.5 mt-4">
    {post.data.tags.map((tag) => (
      <span class="text-xs px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
        {tag}
      </span>
    ))}
  </div>
)}
```

**Prose styling pattern** (lines 49-57):
```astro
<div class="prose prose-invert max-w-none
  prose-headings:font-display prose-headings:font-semibold
  prose-a:text-accent prose-a:no-underline hover:prose-a:underline hover:prose-a:text-accent-light
  prose-code:font-mono prose-code:text-accent-light
  prose-pre:bg-surface prose-pre:border prose-pre:border-border
  prose-hr:border-border
">
  <Content />
</div>
```

---

### `src/components/Speaking.astro` (component, build-time query)

**Analog:** `src/components/BlogPreview.astro` (lines 1-75) — query and sort pattern

**Query and filter pattern** (lines 12-18):
```astro
const allPosts = await getCollection('blog', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const posts = allPosts
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
```

**Pattern to replicate for speaking:**
```astro
const allTalks = await getCollection('speaking', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const talks = allTalks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Group by year for reference grid layout
const talksByYear = talks.reduce((acc, talk) => {
  const year = talk.data.date.getFullYear().toString();
  if (!acc[year]) acc[year] = [];
  acc[year].push(talk);
  return acc;
}, {} as Record<string, typeof talks>);
```

**Analog:** Reference UI kit `app.jsx` (lines 456-486) — visual layout pattern

**Section container pattern** (line 457):
```jsx
<Section id="speaking" title="Speaking" subtitle="30+ technical deep-dives per year. Speaker rating: 4.5–4.7 / 5.0" bg={VV.surface}>
```

**Translated to Astro:**
```astro
<section id="speaking" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
    <h2 class="font-display text-3xl font-bold mb-2 animate-on-scroll">{i.speaking.title}</h2>
    <p class="text-text-muted mb-12 animate-on-scroll">{i.speaking.subtitle}</p>
```

**Year group grid layout** (lines 460-462):
```jsx
<div key={yr.year} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 24 }}>
  <div style={{ fontFamily: VV.fontDisplay, fontSize: 36, fontWeight: 700,
    color: VV.teal, letterSpacing: '-0.02em' }}>{yr.year}</div>
```

**Translated to Astro:**
```astro
<div class="grid grid-cols-[100px_1fr] gap-6 animate-on-scroll">
  <div class="font-display text-4xl font-bold text-brand-primary tracking-[-0.02em]">
    {year}
  </div>
```

**Event rendering pattern** (lines 465-468):
```jsx
<div key={ev.name} style={{ borderLeft: `2px solid ${VV.border}`, paddingLeft: 20 }}>
  <div style={{ fontFamily: VV.fontDisplay, fontSize: 18, fontWeight: 600, color: VV.text }}>
    {ev.name} <span style={{ color: VV.mute, fontWeight: 400 }}>· {ev.location}</span>
  </div>
```

**Translated to Astro:**
```astro
<div class="border-l-2 border-border pl-5">
  <div class="font-display text-lg font-semibold text-text-primary">
    {talk.data.event} <span class="font-normal text-text-muted">· {talk.data.city}</span>
  </div>
```

**Talk link pattern** (lines 469-472):
```jsx
{ev.talks.map(t => (
  <div key={t} style={{ fontFamily: VV.fontBody, fontSize: 14, color: VV.mute, marginTop: 6 }}>
    → {t}
  </div>
))}
```

**Translated to Astro (with link to individual talk page):**
```astro
<a
  href={`/${locale}/speaking/${talk.id.replace(`${locale}/`, '')}`}
  class="font-body text-sm text-text-muted mt-2 block hover:text-brand-primary transition-colors"
>
  <span class="text-brand-primary">→</span> {talk.data.title}
</a>
```

**Highlight pattern** (lines 474-478):
```jsx
{ev.highlight && (
  <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.amber, marginTop: 8 }}>
    ★ {ev.highlight}
  </div>
)}
```

**Translated to Astro:**
```astro
{talk.data.highlight && (
  <div class="font-mono text-xs text-warm mt-2">★ {talk.data.highlight}</div>
)}
```

**Gap pattern** (line 458):
```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
```

**Translated to Astro:**
```astro
<div class="flex flex-col gap-8">
```

---

### `src/pages/en/speaking/index.astro` (page, build-time query)

**Analog:** `src/components/BlogPreview.astro` (query pattern) + `src/components/Speaking.astro` (layout)

**Structure to follow:**
1. Import BaseLayout, getCollection, i18n utils
2. Query all speaking entries for current locale
3. Sort by date descending
4. Group by year
5. Render with same grid layout as homepage Speaking section but full list (not limited to 3)

**Container pattern from BlogPreview** (lines 22-23):
```astro
<div class="max-w-6xl mx-auto px-4 sm:px-6">
```

**Update to match reference (max-w-[1120px]):**
```astro
<div class="max-w-[1120px] mx-auto px-6">
```

---

### `src/i18n/en.json` (config, static)

**Analog:** `src/i18n/en.json` (existing keys structure)

**Existing speaking keys** (lines 49-52):
```json
"speaking": {
  "title": "Speaking",
  "subtitle": "30+ technical deep-dives per year. Speaker rating: 4.5–4.7/5.0"
}
```

**New keys to add:**
```json
"speaking": {
  "title": "Speaking",
  "subtitle": "30+ technical deep-dives per year. Speaker rating: 4.5–4.7/5.0",
  "back_link": "Back to Speaking",
  "watch_video": "Watch on YouTube",
  "view_slides": "View Slides",
  "all_talks": "All talks"
}
```

---

### `src/i18n/ru.json` (config, static)

**Analog:** `src/i18n/ru.json` (existing keys structure)

**Existing speaking keys** (lines 49-52):
```json
"speaking": {
  "title": "Выступления",
  "subtitle": "30+ технических докладов в год. Рейтинг спикера: 4.5–4.7/5.0"
}
```

**New keys to add:**
```json
"speaking": {
  "title": "Выступления",
  "subtitle": "30+ технических докладов в год. Рейтинг спикера: 4.5–4.7/5.0",
  "back_link": "Вернуться к выступлениям",
  "watch_video": "Смотреть на YouTube",
  "view_slides": "Посмотреть слайды",
  "all_talks": "Все выступления"
}
```

---

### `src/data/social.ts` (config, static)

**Analog:** `src/data/social.ts` (lines 52-100) — existing speakingEvents array

**Current pattern:**
```typescript
export const speakingEvents = [
  {
    year: '2026',
    events: [ /* ... */ ]
  },
  // ...
] as const;
```

**Action:** Remove this export after migration to Content Collection is complete. The data will live in markdown files instead.

**Other exports to preserve:**
- `socialLinks` (lines 1-27)
- `certifications` (lines 29-36)
- `skills` (lines 38-50)
- `presentations` (lines 102-163)

---

## Shared Patterns

### Date Formatting (i18n-aware)

**Source:** `src/pages/en/blog/[...slug].astro` (lines 29-35), `src/components/BlogPreview.astro` (lines 44-49)

**Apply to:** All speaking pages and components

```astro
{talk.data.date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})}
```

### Collection Query with Locale Filter

**Source:** `src/pages/en/blog/[...slug].astro` (line 6), `src/components/BlogPreview.astro` (lines 12-14)

**Apply to:** All speaking queries

```astro
const talks = await getCollection('speaking', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});
```

### animate-on-scroll Class

**Source:** `src/components/Speaking.astro` (lines 15, 16, 24)

**Apply to:** All speaking sections and year groups

```astro
<h2 class="font-display text-3xl font-bold mb-2 animate-on-scroll">{i.speaking.title}</h2>
<p class="text-text-muted mb-12 animate-on-scroll">{i.speaking.subtitle}</p>
<div class="animate-on-scroll">
```

### Token-Based Colors

**Source:** All components in the codebase

**Apply to:** All new speaking components and pages

- Use `text-brand-primary` instead of hardcoded teal
- Use `text-warm` instead of hardcoded amber
- Use `bg-surface` for section backgrounds
- Use `border-border` for borders
- Use `text-text-primary`, `text-text-secondary`, `text-text-muted` for text colors

### BaseLayout Props

**Source:** `src/pages/en/blog/[...slug].astro` (lines 18-23)

**Apply to:** All speaking pages

```astro
<BaseLayout
  title={`${talk.data.title} — Viktor Vedmich`}
  description={`Talk at ${talk.data.event} — ${talk.data.city}`}
  locale={locale}
  path={`/speaking/${talk.id.replace(`${locale}/`, '')}`}
>
```

### Container Width

**Source:** Reference UI kit `app.jsx` + Phase 4 decision

**Apply to:** All speaking sections

```astro
<div class="max-w-[1120px] mx-auto px-6">
```

### Section Padding

**Source:** All sections in the codebase

**Apply to:** All speaking sections

```astro
<section class="py-20 sm:py-28">
```

---

## No Analog Found

All 11 files have close matches in the codebase. No files require patterns from RESEARCH.md external examples.

---

## Migration Data (from `src/data/social.ts`)

### 2026 Talks (2 events, 3 talks)

**Event: Code Europe, Krakow**
- Mastering Kubernetes Scalability with Karpenter
- Building Production GenAI: MCP and Multi-Agent Systems in Action

**Event: AWS Community Day Slovakia, Bratislava**
- Karpenter in Production: Architecting Cost-Efficient K8s Clusters

### 2024 Talks (2 events, 3 talks)

**Event: AWS Summit Amsterdam, Amsterdam**
- New Era of IaC: Effective Kubernetes Management with cdk8s
- Build Verifiable and Effective Application Authorization in 40 Minutes

**Event: AWS Community Day Armenia, Yerevan**
- Kubernetes Security

### 2023 Talks (1 event, 1 talk)

**Event: AWS re:Invent, Las Vegas**
- New Era of IaC: Effective Kubernetes Management with CDK8S (BOA310)
- Highlight: "Speaker rating: 4.7/5.0"

**Total: 6 talks to migrate**

---

## Metadata

**Analog search scope:** 
- `src/content/` (blog collection structure)
- `src/pages/en/blog/` (blog routing patterns)
- `src/components/` (BlogPreview, Speaking)
- `src/i18n/` (translation key patterns)
- `src/data/` (current speakingEvents data)
- Reference UI kit: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 456-486

**Files scanned:** 8 source files

**Pattern extraction date:** 2026-04-21

**Key patterns identified:**
1. Content Collections with glob loader + Zod schema (exact pattern from blog)
2. Dynamic routing via getStaticPaths with locale filtering (exact pattern from blog)
3. Reference UI grid layout (100px | 1fr, border-l-2, arrow-prefix talks)
4. i18n date formatting (existing pattern from blog)
5. Token-based colors (consistent across all sections)
6. animate-on-scroll animations (consistent across all sections)

**Implementation complexity:** LOW — All patterns have exact precedents in the codebase. No new architectural decisions needed. Main work is:
1. Add speaking collection to content.config.ts (copy blog pattern)
2. Create 12 markdown files (6 EN + 6 RU) from speakingEvents data
3. Copy and adapt blog slug routing for speaking
4. Rewrite Speaking.astro to query collection instead of social.ts
5. Add 4 i18n keys per locale
6. Remove speakingEvents from social.ts after verification
