# Phase 9: Blog — 3 posts with correct card format — Pattern Map

**Mapped:** 2026-04-26
**Files analyzed:** 28 (Wave 1 = 10, Wave 2 = 11, Wave 3 = 7)
**Analogs found:** 27 / 28 (one Wave 2 reference has no prior analog — `visuals-routing.md` decision tree)

---

## File Classification

### Wave 1 — UI (10 files)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/BlogCard.astro` | component (new) | props-driven | `src/components/PresentationCard.astro` (lines 1-57) | **exact** (drop row 4 → 4-row) |
| `src/components/BlogPreview.astro` | component (rewrite) | build-time query | `src/components/Presentations.astro` (lines 1-43) | **exact** (switch collection + slice(0,3) + empty-state block) |
| `src/pages/en/blog/index.astro` | page (rewrite) | build-time query | `src/pages/en/presentations/index.astro` (lines 1-45) | **exact** |
| `src/pages/ru/blog/index.astro` | page (rewrite) | build-time query | `src/pages/ru/presentations/index.astro` (lines 1-45) | **exact** |
| `src/pages/en/blog/[...slug].astro` | page (update) | build-time query | itself (lines 1-60, current state) + `src/components/PresentationCard.astro` (tag badge class) | **self+exact** |
| `src/pages/ru/blog/[...slug].astro` | page (update) | build-time query | itself (lines 1-60) + PresentationCard tag class | **self+exact** |
| `src/content.config.ts` | collection schema | build-time | `src/content.config.ts` lines 15-29 (speaking, required tags) + itself lines 4-13 (blog, existing) | **exact** |
| `astro.config.mjs` | build config | build-time | itself (lines 1-22, current) + [CITED: docs.astro.build/recipes/reading-time] | **self+recipe** |
| `src/i18n/en.json` | i18n JSON | static | itself (lines 68-72 blog block) | **self-extend** |
| `src/i18n/ru.json` | i18n JSON | static | itself (lines 68-72 blog block) | **self-extend** |

### Wave 2 — Skill (11 files)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.claude/skills/vv-blog-from-vault/SKILL.md` | skill entry (new) | orchestration | `~/.claude/skills/vv-carousel/SKILL.md` (brand-skill + QMD + vault-grounded) | **exact** |
| `.claude/skills/vv-blog-from-vault/scripts/vault-search.py` | script (new) | file-I/O + MCP | `~/.claude/skills/recall/scripts/recall-day.py` (Python + stdlib + CLI argparse) + `~/.claude/skills/vv-carousel/SKILL.md` Step 2 (QMD 2-query pattern) | **composite** |
| `.claude/skills/vv-blog-from-vault/scripts/session-recall.py` | script (new) | file-I/O + MCP | `~/.claude/skills/recall/scripts/recall-day.py` + `~/.claude/skills/recall/workflows/topic.md` | **exact** |
| `.claude/skills/vv-blog-from-vault/scripts/deploy-post.sh` | script (new) | shell orchestration | CLAUDE.md § "Adding a new blog post" steps 1-5 + Phase 8 commit pattern | **derived** |
| `.claude/skills/vv-blog-from-vault/references/voice-guide.md` | reference (new) | static | `~/.claude/skills/vv-carousel/references/typography.md` (locked-spec pattern) + vault `voice-and-tone.md` | **structural** |
| `.claude/skills/vv-blog-from-vault/references/translation-rules.md` | reference (new) | static | `~/.claude/skills/vv-carousel/references/primitives.md` (table-locked) + CONTEXT.md D-30 | **structural** |
| `.claude/skills/vv-blog-from-vault/references/frontmatter-schema.md` | reference (new) | static | `src/content.config.ts` blog block (after Wave 1 tighten) + `~/.claude/skills/sync-claude-sessions/SKILL.md` § "Frontmatter Schema" lines 67-84 | **composite** |
| `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` | reference (new) | static | **no prior analog** — novel decision tree. Structural: `~/.claude/skills/vv-carousel/references/primitives.md` table shape | **structural-only** |
| `.claude/skills/vv-blog-from-vault/references/companion-sources.md` | reference (new) | static | **no prior analog** — novel vault map. Structural: CLAUDE.md § "Obsidian Vault Cross-References" table | **structural-only** |
| `.claude/skills/vv-blog-from-vault/workflows/new-post.md` | workflow (new) | orchestration | `~/.claude/skills/recall/workflows/topic.md` (step-by-step QMD + MCP pattern) + `~/.claude/skills/vv-carousel/SKILL.md` 10-step workflow | **composite** |
| `.claude/skills/vv-blog-from-vault/workflows/update-post.md` | workflow (new) | orchestration | `~/.claude/skills/recall/workflows/temporal.md` (simpler workflow shape) | **structural** |

### Wave 3 — Content (7 files)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content/blog/en/2026-03-20-karpenter-right-sizing.md` | content entry (new) | static | `src/content/blog/en/hello-world.md` (lines 1-26) — frontmatter + body pattern | **exact** |
| `src/content/blog/ru/2026-03-20-karpenter-right-sizing.md` | content entry (new) | static | `src/content/blog/ru/hello-world.md` (lines 1-26) | **exact** |
| `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` | content entry (new) | static | `src/content/blog/en/hello-world.md` | **exact** |
| `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` | content entry (new) | static | `src/content/blog/ru/hello-world.md` | **exact** |
| `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` | content entry (new) | static | `src/content/blog/en/hello-world.md` | **exact** |
| `src/content/blog/ru/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` | content entry (new) | static | `src/content/blog/ru/hello-world.md` | **exact** |
| `public/blog-assets/2026-03-20-karpenter-right-sizing/*.png` | static asset (new) | file copy | **no prior analog** — first `public/blog-assets/` addition. `public/fonts/` serves as the closest convention reference (`public/` root-served, no optimization). | **structural-only** |

---

## Pattern Assignments — Wave 1 (UI)

### 1. `src/components/BlogCard.astro` (component, props-driven) — NEW

**Analog:** `src/components/PresentationCard.astro` (complete file, 57 lines)

**Imports pattern** (lines 1-6 of PresentationCard):
```typescript
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  deck: CollectionEntry<'presentations'>;
}
```

→ Blog adaptation:
```typescript
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/utils';

interface Props {
  post: CollectionEntry<'blog'>;
  locale: Locale;
}
```

**Slug extraction + URL compose** (PresentationCard lines 8-13):
```typescript
const { data, id } = deck;
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = `https://s.vedmich.dev/${slug}/`;
const displayUrl = `s.vedmich.dev/${slug}`;
```

→ Blog adaptation (drop `displayUrl` row entirely, use internal route):
```typescript
const { data, id } = post;
const slug = id.replace(/^(en|ru)\//, '');
const href = `/${locale}/blog/${slug}`;
```

**Date formatting** — PresentationCard uses ISO date (line 15): `const dateStr = data.date.toISOString().slice(0, 10);` — **BlogCard diverges** per D-11 / UI-SPEC "Copywriting Contract" / Q4:
```typescript
// NEW for blog (not in PresentationCard)
const formattedDate = locale === 'ru'
  ? data.date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }).replace(/\s*г\.?$/, '')
  : data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
```

**Whole-card anchor container pattern** (PresentationCard lines 20-25):
```astro
<a
  href={deckUrl}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
```

→ Blog adaptation (internal route, no `target="_blank"`):
```astro
<a
  href={href}
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
```

**Row 1 — Date overline** (PresentationCard lines 26-29):
```astro
<!-- Row 1: Overline -->
<div class="font-mono text-xs text-text-muted mb-2">
  {overlineParts.join(' · ')}
</div>
```

→ Blog: render `{formattedDate}` instead of the joined triple.

**Row 2 — Title** (PresentationCard lines 31-34) — **copy verbatim**:
```astro
<!-- Row 2: Title -->
<h3 class="font-display text-lg font-semibold leading-snug mt-0 text-text-primary group-hover:text-brand-primary transition-colors">
  {data.title}
</h3>
```

**Row 3 — Description** (PresentationCard lines 36-39) — **copy verbatim**:
```astro
<!-- Row 3: Description -->
<p class="font-body text-sm text-text-secondary my-2.5 leading-relaxed flex-1">
  {data.description}
</p>
```

**Row 4 — Slug URL row (DROP for BlogCard)** (PresentationCard lines 41-44):
```astro
<!-- Row 4: Slug URL — DROP in BlogCard per D-11 -->
<div class="font-mono text-[11px] text-brand-primary tracking-[0.06em] mt-2 mb-2.5 truncate">
  {displayUrl}
</div>
```
This row is **removed** in BlogCard (blog posts are internal, no public display URL).

**Tag row (final row)** (PresentationCard lines 46-56) — **copy verbatim, becomes row 4**:
```astro
<!-- Row 4 (was 5): Tags -->
<div class="flex flex-wrap gap-1.5" role="list">
  {data.tags.map((tag) => (
    <span
      role="listitem"
      class="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded text-brand-primary bg-brand-primary-soft/30 border border-brand-primary/40"
    >
      {tag}
    </span>
  ))}
</div>
```

**Note on `tags`:** After Wave 1 schema tighten (D-25), `data.tags` is required `string[]` — the `{post.data.tags && …}` guard that exists in current BlogPreview.astro line 55 becomes dead code and must be omitted here.

---

### 2. `src/components/BlogPreview.astro` (component, build-time query) — REWRITE

**Analog:** `src/components/Presentations.astro` (complete file, 43 lines)

**Imports pattern** (Presentations.astro lines 1-4):
```typescript
---
import { getCollection } from 'astro:content';
import { t, type Locale } from '../i18n/utils';
import PresentationCard from './PresentationCard.astro';
```

→ Blog adaptation (drop `getLocalizedPath` currently imported in BlogPreview line 3 since it's unused post-rewrite — `/${locale}/blog` is static inline):
```typescript
---
import { getCollection } from 'astro:content';
import { t, type Locale } from '../i18n/utils';
import BlogCard from './BlogCard.astro';
```

**Collection query + sort + slice pattern** (Presentations.astro lines 13-19):
```typescript
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const sortedDecks = allDecks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const totalCount = sortedDecks.length;
const homepageDecks = sortedDecks.slice(0, 6);
```

→ Blog adaptation (`.slice(0, 3)` per D-20, no `totalCount` needed since no `{N} talks` subtitle):
```typescript
const allPosts = await getCollection('blog', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const posts = allPosts
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
```

**Section wrapper — the key D-15 divergence:** Presentations.astro line 24 uses `class="py-20 sm:py-28 bg-surface"` — blog section **drops** `bg-surface` per D-15 (transparent, inherits `bg-bg-base`):

Presentations.astro lines 24-25:
```astro
<section id="presentations" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
```

→ Blog adaptation (D-15 transparent, D-16 max-width, D-17 padding):
```astro
<section id="blog" class="py-20 sm:py-28">
  <div class="max-w-[1120px] mx-auto px-6">
```

**Header row with "All posts →" link** (Presentations.astro lines 26-35) — **copy verbatim**, swap keys:
```astro
<div class="flex items-baseline justify-between gap-6 mb-2 animate-on-scroll">
  <h2 class="font-display text-3xl font-bold">{i.presentations.title}</h2>
  <a
    href={`/${locale}/presentations`}
    class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
  >
    {i.presentations.all_decks} →
  </a>
</div>
<p class="text-text-muted mb-12 animate-on-scroll">{subtitle}</p>
```

→ Blog adaptation (swap to `i.blog.title` / `i.blog.all_posts`, drop the subtitle `<p>` since blog has no "N talks" counter):
```astro
<div class="flex items-baseline justify-between gap-6 mb-12 animate-on-scroll">
  <h2 class="font-display text-3xl font-bold">{i.blog.title}</h2>
  {posts.length > 0 && (
    <a
      href={`/${locale}/blog`}
      class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
    >
      {i.blog.all_posts} →
    </a>
  )}
</div>
```
Note: `mb-2` + subtitle `mb-12` in Presentations = total `mb-14` gap. Blog collapses to single `mb-12` on the header row since there's no subtitle.

**Grid + card iteration** (Presentations.astro lines 37-41) — **copy verbatim, swap component + var**:
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {homepageDecks.map((deck) => (
    <PresentationCard deck={deck} />
  ))}
</div>
```

→ Blog adaptation:
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {posts.map((post) => (
    <BlogCard post={post} locale={locale} />
  ))}
</div>
```

**Empty state block** (NOT present in Presentations.astro — blog-specific, preserved from current BlogPreview lines 68-72 per UI-SPEC Q1):
```astro
<!-- Fallback when no posts — strings kept INLINE per Q1, NOT in i18n -->
{posts.length === 0 && (
  <p class="text-text-muted animate-on-scroll">
    {locale === 'ru' ? 'Посты появятся скоро...' : 'Posts coming soon...'}
  </p>
)}
```
Planner must preserve these exact Russian/English strings inline.

---

### 3. `src/pages/en/blog/index.astro` (page, build-time query) — REWRITE

**Analog:** `src/pages/en/presentations/index.astro` (complete file, 45 lines)

**Imports pattern** (presentations/index lines 1-5):
```typescript
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';
import PresentationCard from '../../../components/PresentationCard.astro';

const locale = 'en';
const i = t(locale);
```

→ Blog adaptation (swap component import):
```typescript
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';
import BlogCard from '../../../components/BlogCard.astro';

const locale = 'en';
const i = t(locale);
```

**Collection query + sort** (presentations/index lines 10-16) — blog uses no `totalCount` / `subtitle`:
```typescript
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const decks = allDecks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const totalCount = decks.length;
const subtitle = i.presentations.subtitle.replace('{N}', String(totalCount));
```

→ Blog adaptation:
```typescript
const posts = (await getCollection('blog', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
})).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

**BaseLayout shell** (presentations/index lines 19-24) — **copy structure**, swap title + description + path:
```astro
<BaseLayout
  title={`${i.presentations.title} — Viktor Vedmich`}
  description="Conference presentations and Slidev decks on Kubernetes, AWS, MCP, and AI for DevOps"
  locale={locale}
  path="/presentations"
>
```

→ Blog adaptation:
```astro
<BaseLayout
  title={`${i.blog.title} — Viktor Vedmich`}
  description="Architecture notes, Kubernetes deep-dives, and AI for DevOps — from Viktor Vedmich, Senior SA @ AWS."
  locale={locale}
  path="/blog"
>
```

**Container + back-link + header + grid** (presentations/index lines 25-42) — **copy verbatim, swap component + empty-state**:
```astro
<div class="py-20 sm:py-28">
  <div class="max-w-[1120px] mx-auto px-6">
    <a
      href={`/${locale}/`}
      class="font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors mb-6 inline-block"
    >
      ← {i.back_to_home}
    </a>

    <h1 class="font-display text-4xl font-bold mb-2 animate-on-scroll">{i.presentations.title}</h1>
    <p class="text-text-muted mb-12 animate-on-scroll">{subtitle}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {decks.map((deck) => (
        <PresentationCard deck={deck} />
      ))}
    </div>
  </div>
</div>
```

→ Blog adaptation (drop subtitle `<p>`, add empty state conditional, swap card component):
```astro
<div class="py-20 sm:py-28">
  <div class="max-w-[1120px] mx-auto px-6">
    <a
      href={`/${locale}/`}
      class="font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors mb-6 inline-block"
    >
      ← {i.back_to_home}
    </a>

    <h1 class="font-display text-4xl font-bold mb-12 animate-on-scroll">{i.blog.title}</h1>

    {posts.length > 0 ? (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <BlogCard post={post} locale={locale} />
        ))}
      </div>
    ) : (
      <p class="text-text-muted">Posts coming soon...</p>
    )}
  </div>
</div>
```

---

### 4. `src/pages/ru/blog/index.astro` (page) — REWRITE

**Analog:** `src/pages/ru/presentations/index.astro` (45 lines) + `src/pages/en/blog/index.astro` (mirror)

**Delta vs EN index** — only 3 lines differ:
1. `const locale = 'ru';`
2. BaseLayout `title={\`${i.blog.title} — Виктор Ведмич\`}` (matches ru/presentations/index.astro line 20 which uses "— Viktor Vedmich" in English despite being the RU page — **NOTE**: planner choice whether to use "Виктор Ведмич" or "Viktor Vedmich" here. Current ru/blog/[...slug].astro uses "Виктор Ведмич"; ru/presentations/index.astro uses "Viktor Vedmich". Recommendation: **match current ru/blog/[...slug].astro** → "Виктор Ведмич" for consistency inside blog namespace).
3. Empty state string: `"Посты появятся скоро..."` (RU per UI-SPEC Q1).

All other code identical to EN index.

---

### 5. `src/pages/en/blog/[...slug].astro` (page) — UPDATE (minor visual tweaks)

**Analog:** itself (current state, lines 1-60) — 6 targeted edits per D-23, D-24, D-28 + UI-SPEC "Component Inventory" table.

**Current imports** (lines 1-3) — **unchanged**:
```typescript
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
```

**New imports needed** (Wave 1 adds `t` for i18n + no new helper since research recommends remark plugin over `src/lib/reading-time.ts`):
```typescript
import { t } from '../../../i18n/utils';
// After line 13 where locale is set:
const i = t(locale);
```

**Current date block** (lines 29-35) — **edit to mono xs + short month + RU "г." strip**:
```astro
<!-- Current (lines 29-35): -->
<time class="block text-sm text-text-muted mb-2">
  {post.data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
</time>
```

→ New per D-23 row 1 + Q4:
```astro
<time class="font-mono text-xs text-text-muted mb-2 block">
  {post.data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}
</time>
```
(RU variant uses `'ru-RU'` + `month: 'long'` + `.replace(/\s*г\.?$/, '')` on the output.)

**Current h1** (line 36) — **edit to +1 size + tighter tracking**:
```astro
<!-- Current: -->
<h1 class="font-display text-3xl sm:text-4xl font-bold mb-4">{post.data.title}</h1>
```

→ New per D-23 row 2:
```astro
<h1 class="font-display text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-4">{post.data.title}</h1>
```

**NEW byline block** (insert after description `<p>` at line 37, before tag row at line 38) — per D-28 + UI-SPEC Q2/Q3:
```astro
<!-- NEW: insert between description and tags -->
{(() => {
  const readingTime = post.data.reading_time ?? remarkPluginFrontmatter.minutesRead;
  return (
    <p class="text-sm text-text-muted mt-3">
      {post.data.author} · {readingTime} {i.blog.min_read}
    </p>
  );
})()}
```
Requires upstream (top of file, line 14): change `const { Content } = await render(post);` to `const { Content, remarkPluginFrontmatter } = await render(post);` per RESEARCH.md Pattern 2 code example.

**Current tag row** (lines 38-46) — **replace tag span class with teal Badge pattern** (source: PresentationCard.astro line 51):
```astro
<!-- Current tag span class (line 41): -->
<span class="text-xs px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
  {tag}
</span>
```

→ New per D-23 row 6 (identical to BlogCard + PresentationCard tag class):
```astro
<span
  role="listitem"
  class="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded text-brand-primary bg-brand-primary-soft/30 border border-brand-primary/40"
>
  {tag}
</span>
```
Also: add `role="list"` to the wrapping `<div>` per accessibility pattern.

**Drop the `post.data.tags &&` guard** (line 38) once schema tightens `tags` to required (D-25). The current:
```astro
{post.data.tags && (
  <div class="flex flex-wrap gap-1.5 mt-4">
    ...
```
becomes:
```astro
<div class="flex flex-wrap gap-1.5 mt-4" role="list">
  ...
```

**Preserved sections** (D-24):
- Back-link `<a>` (line 26-28) — **unchanged** (uses `text-accent` which aliases to teal)
- Description `<p>` (line 37) — **unchanged**
- Container `max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20` (line 24) — **unchanged**
- `.prose prose-invert` block (lines 49-56) + `<Content />` (line 56) — **unchanged**

---

### 6. `src/pages/ru/blog/[...slug].astro` — UPDATE

**Analog:** itself + EN slug page mirror above.

**Delta vs EN slug page** — 3 lines differ:
1. `const locale = 'ru';`
2. Date `toLocaleDateString('ru-RU', { ..., month: 'long', ... }).replace(/\s*г\.?$/, '')`.
3. Back-link text `&larr; Назад к блогу` (line 27, unchanged).

All other edits identical to EN slug page.

---

### 7. `src/content.config.ts` (schema) — UPDATE (additive tighten)

**Analog:** itself — blog block lines 4-13 (current) + speaking block lines 15-29 (pattern for required `tags`).

**Current blog schema** (lines 4-13):
```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),      // ← TIGHTEN: drop .optional()
    draft: z.boolean().default(false),
  }),
});
```

**Required-tags pattern** (speaking block line 22):
```typescript
tags: z.array(z.string()),
```

**New blog schema** (D-25, additive + tighten):
```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),                 // CHANGED: required (was .optional())
    draft: z.boolean().default(false),
    // NEW (additive):
    author: z.string().default('Viktor Vedmich'),
    reading_time: z.number().optional(),
    cover_image: z.string().optional(),
  }),
});
```

**Non-breaking check** (D-26): `src/content/blog/en/hello-world.md` line 5 already declares `tags: ["personal", "announcement"]` — satisfies new required constraint. No migration.

**Clean-up pitfall** (RESEARCH.md Pitfall 1): `src/data/search-index.ts` line 56 uses `tags: entry.data.tags ?? []` — this `?? []` becomes dead code after tighten. Planner should remove the `??` fallback to keep code lean.

---

### 8. `astro.config.mjs` (build config) — MODIFY (add remark-reading-time + optional mermaid excludeLangs)

**Analog:** itself (current, 22 lines) + [CITED: docs.astro.build/en/recipes/reading-time]

**Current config** (lines 1-22):
```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://vedmich.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
```

**New additions** (RESEARCH.md Pattern 2 + Pattern 3):

1. Add import of remark plugin (top of file):
```javascript
import { remarkReadingTime } from './remark-reading-time.mjs';
```

2. Add `markdown` key inside `defineConfig({...})`:
```javascript
markdown: {
  remarkPlugins: [remarkReadingTime],
  // Optional: only if a Wave 3 post ships a mermaid fenced block
  syntaxHighlight: {
    type: 'shiki',
    excludeLangs: ['mermaid'],
  },
},
```

3. **New companion file** `./remark-reading-time.mjs` at repo root (12-line official recipe):
```javascript
// Source: docs.astro.build/en/recipes/reading-time
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = Math.ceil(readingTime.minutes);
  };
}
```

4. New dev dependencies:
```bash
npm install --save-dev reading-time mdast-util-to-string
```

---

### 9. `src/i18n/en.json` (i18n) — EXTEND (add `blog.min_read`)

**Analog:** itself — blog block lines 68-72 (current):
```json
"blog": {
  "title": "Blog",
  "read_more": "Read more",
  "all_posts": "All posts"
},
```

**New blog block** (D-42 revised — only `blog.min_read`, NOT `blog.by_author` which was dropped by Q2):
```json
"blog": {
  "title": "Blog",
  "read_more": "Read more",
  "all_posts": "All posts",
  "min_read": "min read"
},
```

---

### 10. `src/i18n/ru.json` (i18n) — EXTEND

**Analog:** itself — blog block lines 68-72 (current):
```json
"blog": {
  "title": "Блог",
  "read_more": "Читать дальше",
  "all_posts": "Все посты"
},
```

**New blog block**:
```json
"blog": {
  "title": "Блог",
  "read_more": "Читать дальше",
  "all_posts": "Все посты",
  "min_read": "мин чтения"
},
```

---

## Pattern Assignments — Wave 2 (Skill)

### 11. `.claude/skills/vv-blog-from-vault/SKILL.md` — NEW

**Analog:** `~/.claude/skills/vv-carousel/SKILL.md` (302 lines, brand-skill with vault-ground + QMD + multi-step workflow)

**Frontmatter pattern** (vv-carousel lines 1-4) — **structural copy, adapt description for blog**:
```yaml
---
name: vv-carousel
description: Generate LinkedIn carousels for Viktor Vedmich's Deep Signal personal brand. Produces 1080×1350 PNG slides + LinkedIn-ready PDF + caption.md — all saved to the Obsidian vault at 45.20-Brand-Kit/carousel-templates/<slug>/, ready for MANUAL upload by Viktor (no API automation). Use when the user says "make a carousel about X", "new LinkedIn carousel", "сделай карусель про...", "/vv-carousel", or asks to produce a slide deck specifically for his LinkedIn feed. ...
---
```

→ Blog adaptation (per D-32 / D-35 / D-36):
```yaml
---
name: vv-blog-from-vault
description: |
  Generate and publish Viktor Vedmich's Deep Signal brand blog posts at vedmich.dev — grounded in the Obsidian vault (QMD search) and Claude Code session history (recall + episodic-memory). Produces EN + RU markdown files in src/content/blog/{en,ru}/ with Zod-valid frontmatter (title, description, date, tags, author, reading_time, cover_image), optional inline visuals (reuses vault carousel PNGs first; delegates to mermaid-pro / excalidraw / art / viktor-vedmich-design), companion-link suggestions (talks in 44-Speaking, carousels in 45.20-Brand-Kit), and a verify+push pipeline that runs npm run build, captures a playwright screenshot, and commits with the CLAUDE.md template "Post: <title>" (no Co-Authored-By for content). Use when user says: "write a blog post", "new post about X", "новый пост", "новая статья", "статья из vault", "пост из доклада", "publish post", "deploy post", "blog from vault". NOT for: LinkedIn carousels (use vv-carousel), Slidev presentations (use dkt-slidev/slurm-slidev), confidential AWS client content (hard-excluded from vault search).
---
```

**Skill top sections** (vv-carousel lines 6-35) — adapt "Context + Where everything lives" pattern:

vv-carousel "Context" (lines 10-14):
```markdown
## Context

- **Viktor**: Senior AWS Solutions Architect in Germany. Audience: other senior engineers (K8s, AWS, DevOps, AI). Tone: technical, precise, no fluff.
- **Publishing**: Viktor uploads **manually** — skill must produce everything he needs in the vault, nothing more.
```

→ Blog adaptation:
```markdown
## Context

- **Viktor**: Senior AWS SA @ AWS Germany. Audience for vedmich.dev blog: senior engineers interested in K8s, AWS, AI-for-DevOps. Voice: tech-expert from first person ("I've seen this fail in production" / "На клиентах я видел…").
- **Publishing**: git push to main. GH Actions auto-deploys in ~2 min. CLAUDE.md §"Adding a new blog post" is authoritative. Commit template is `Post: <title>` with NO Co-Authored-By trailer.
- **Confidential exclusion**: vault search MUST hard-exclude `10-AWS/11-Active-Clients/`, `10-AWS/14-Tips-AWS-Internal/`, `10-AWS/16-Amazon-Employer/` (CLAUDE.md §"Obsidian Vault Cross-References" + Phase 9 D-05).
```

vv-carousel "Where everything lives" (lines 16-34) — shows directory tree:
```markdown
## Where everything lives

All infrastructure is in the vault — never recreate it, never write to `/tmp/`:

\`\`\`
40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/
├── APPROACH.md
├── ...
\`\`\`
```

→ Blog adaptation — show both the site repo structure AND the vault sources:
```markdown
## Where everything lives

Blog markdown + assets live in the SITE repo:
\`\`\`
src/content/blog/{en,ru}/YYYY-MM-DD-slug.md     ← posts (both locales)
public/blog-assets/YYYY-MM-DD-slug/*.png        ← inline images
\`\`\`

Source material lives in the VAULT (`~/Documents/ViktorVedmich/`):
\`\`\`
40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/*/out/*.png  ← reusable slide PNGs
40-Content/44-Speaking/44.20-Talk-Materials/*.md                             ← talk notes
20-Calendar/25-diary/25.70-Claude-Summaries/YYYY-MM-DD.md                    ← session summaries
70-PKM/73-KB-Tech/                                                           ← curated tech KB
70-PKM/77-Connections/YYYY/                                                  ← topical notes
\`\`\`
```

**"Workflow" step-table pattern** (vv-carousel lines 37-221, 10 steps) — adapt to blog's 9-step orchestration per RESEARCH.md Architecture diagram "Wave 2 skill":

vv-carousel Step 2 (lines 52-73) is the canonical QMD 2-query pattern — **direct copy template** into blog skill, swap the prioritized sources:
```markdown
### Step 2 — Source real material from the vault

Carousels must be grounded in Viktor's actual experience — **never invent stats, client names, or technical claims.**

Use `mcp__qmd__query` with a 2-query pattern (lex + vec) against the vault:

\`\`\`
searches = [
  {type: 'lex', query: '<exact terms, e.g. "S3 security MFA Delete">'},
  {type: 'vec', query: '<natural question, e.g. "what do candidates miss on S3 audits">'}
]
intent = '<one-line context for the ranker>'
\`\`\`

Prioritize these sources:
- `20-Calendar/27-Research/` — his own research notes
- `40-Content/41-DKT-Podcast/41.10-Episodes/*/mock-review-*`
- ...

If nothing credible surfaces, STOP and tell the user — don't fabricate facts.
```

→ Blog adaptation — same shape, different priority list per CONTEXT.md D-04/D-10:
```markdown
### Step 2 — Source real material from the vault

Use `mcp__qmd__query` with a 2-query pattern (lex + vec):
\`\`\`
searches = [
  {type: 'lex', query: '<exact terms>'},
  {type: 'vec', query: '<natural question>'}
]
intent = '<one-line context>'
\`\`\`

Prioritize (in order):
- `40-Content/44-Speaking/44.20-Talk-Materials/` — talk notes, stats, technical claims
- `40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/<slug>/` — carousels = companion sources
- `30-Projects/33-Book-Kubernetes/` — book chapters (if K8s topic)
- `70-PKM/73-KB-Tech/` — curated tech KB
- `20-Calendar/25-diary/25.70-Claude-Summaries/*.md` — session summaries (opinion posts)
- `30-Projects/37-AI-DevOps-course/` — AI/MCP/Claude Code source material

Run `scripts/vault-search.py "<topic>"` which wraps the 2-query pattern AND applies the confidential-path post-filter.

If nothing credible surfaces, STOP and either ask the user or suggest reframing the topic — do not fabricate.
```

**"Hard rules" table pattern** (vv-carousel lines 223-236, 9 rules) — adapt to blog:
```markdown
| Rule | Why |
|------|-----|
| ONE primitive per slide | Multiple viz per slide = unreadable on phone |
| ...
```

→ Blog adaptation (derived from CONTEXT.md D-05, D-30, D-31, D-39, D-40, D-43, CLAUDE.md):
```markdown
| Rule | Why |
|------|-----|
| Never fabricate stats/claims | Must come from vault or session-history; blog = Viktor's credibility |
| Exclude confidential vault paths | `10-AWS/11-Active-Clients/*`, `14-Tips-AWS-Internal/*`, `16-Amazon-Employer/*` — CLAUDE.md + D-05 |
| Voice: tech-expert, first person | "I've seen this fail" / "На клиентах я видел" — D-31 |
| Tech terms stay in English in RU | `Karpenter`, `NodePool`, `MCP server`, flag names — D-30 |
| RU body is a full translation, not frontmatter-only | Blog prose is meant to be read — D-29 |
| Reuse vault visuals FIRST | karpenter-1000-clusters PNGs before regenerating — D-39 |
| Zero JS in posts | Only CSS/SVG animations if any (deferred) — CLAUDE.md |
| Commit: `Post: <title>`, no Co-Authored-By | Content commits differ from code — CLAUDE.md |
| Image paths root-absolute `/blog-assets/...` | Relative paths break at `/ru/blog/...` — RESEARCH.md Pitfall 5 |
| Both locales in same commit | Bilingual constraint — CLAUDE.md |
| No hardcoded hex in components | Use Deep Signal tokens — CLAUDE.md (Wave 1 scope; Wave 3 markdown prose is exempt) |
```

**"References" section pattern** (vv-carousel lines 237-252) — direct analog for blog's references/ directory:
```markdown
## References

For deeper context, read these files as needed:

- **`references/voice-guide.md`** — voice rules (D-31) + ban list (anti-AI vocabulary)
- **`references/translation-rules.md`** — EN→RU rules (D-30) with examples
- **`references/frontmatter-schema.md`** — full schema with examples
- **`references/visuals-routing.md`** — decision tree: flowchart → mermaid-pro, sketch → excalidraw, etc.
- **`references/companion-sources.md`** — vault map: carousels at 45.20, talks at 44.20, podcast at 41.10
```

---

### 12. `.claude/skills/vv-blog-from-vault/scripts/vault-search.py` — NEW

**Analog:** `~/.claude/skills/recall/scripts/recall-day.py` (Python CLI structure) + vv-carousel SKILL.md Step 2 (QMD 2-query pattern) + RESEARCH.md Pitfall 4 (confidential filter)

**Shebang + docstring pattern** (recall-day.py lines 1-13):
```python
#!/usr/bin/env python3
"""Recall sessions by date from native Claude Code JSONL files.

Usage:
    recall-day.py list DATE_EXPR [--project PATH] [--all-projects] [--min-msgs N]
    recall-day.py expand SESSION_ID [--project PATH] [--all-projects] [--max-msgs N]
...
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
```

→ Blog adaptation:
```python
#!/usr/bin/env python3
"""Vault search wrapper for vv-blog-from-vault skill.

Uses QMD MCP (via CLI fallback) for hybrid lex+vec search, then post-filters
results to exclude confidential paths per CLAUDE.md and Phase 9 D-05.

Usage:
    vault-search.py <topic> [--limit N] [--collection vault|sessions]
    vault-search.py --check PATH  # policy check: is PATH allowed?

Examples:
    vault-search.py "karpenter right sizing"
    vault-search.py "mcp protocol chalk talk" --collection vault --limit 10
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
```

**Confidential-path filter** (RESEARCH.md Pitfall 4, lines 558-565 of RESEARCH.md):
```python
CONFIDENTIAL_PREFIXES = (
    "10-AWS/11-Active-Clients/",
    "10-AWS/14-Tips-AWS-Internal/",
    "10-AWS/16-Amazon-Employer/",
)

def allowed(path: str) -> bool:
    return not any(path.startswith(p) or f"/{p}" in path for p in CONFIDENTIAL_PREFIXES)
```

**QMD 2-query orchestration** (vv-carousel SKILL.md Step 2 pattern) — implemented via `mcp__qmd__query` if MCP tool is wired into runtime, else subprocess to `qmd` CLI:
```python
# Two-query pattern per vv-carousel precedent
searches = [
    ("lex", lex_query),   # exact terms
    ("vec", vec_query),   # natural question
]
```

**CLI shape with argparse** (recall-day.py pattern around main section — not shown above but exists around line 200+):
```python
def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd')
    # ... subparsers for search, check, etc.
```

---

### 13. `.claude/skills/vv-blog-from-vault/scripts/session-recall.py` — NEW

**Analog:** `~/.claude/skills/recall/scripts/recall-day.py` + `~/.claude/skills/recall/workflows/topic.md` (TOPIC mode orchestration)

**Topic workflow pattern** (recall/workflows/topic.md lines 1-40):
```markdown
# Topic Recall Workflow

## Step 2: Query Expansion
Generate 3-4 keyword variants for BM25 search.

## Step 3: Parallel Search
mcp__qmd__search(query="variant_1", collection="sessions", limit=5)
mcp__qmd__search(query="variant_1", collection="vault", limit=5)
mcp__plugin_episodic-memory_episodic-memory__search(query="topic keywords")
```

→ Blog adaptation — wrap in Python CLI callable from the `new-post.md` workflow. Since recall skill already provides this, the `session-recall.py` script should **delegate to the recall skill's `recall-day.py`** for TOPIC mode, then parse output. Or alternatively: directly shell out to `qmd search` + `qmd vsearch` with the 3-4 variants, following `recall/scripts/recall-day.py` argparse + output structure.

Minimum viable shape (based on RESEARCH.md Environment Availability — falls back to grep over diary files if MCP tools unavailable):
```python
#!/usr/bin/env python3
"""Session recall wrapper for vv-blog-from-vault skill.

For a topic, aggregates:
  1. QMD search over 'vault' collection (includes diary files)
  2. QMD search over 'sessions' collection (exported Claude sessions)
  3. Episodic memory search (if MCP available)
  4. Fallback: grep over ~/Documents/ViktorVedmich/20-Calendar/25-diary/25.70-Claude-Summaries/*.md

Outputs top N candidate quotes/paragraphs grounded in real experience.
"""

import argparse
import subprocess
import sys
from pathlib import Path

DIARY_DIR = Path.home() / "Documents/ViktorVedmich/20-Calendar/25-diary/25.70-Claude-Summaries"
```

---

### 14. `.claude/skills/vv-blog-from-vault/scripts/deploy-post.sh` — NEW

**Analog:** CLAUDE.md § "Adding a new blog post" (lines inside the project CLAUDE.md "Publishing Workflow" section) + Phase 8 commit patterns + RESEARCH.md "Architectural Responsibility Map" row "Publish pipeline".

**CLAUDE.md publishing workflow reference** (canonical text already in project CLAUDE.md):
```markdown
### Adding a new blog post
1. Create `src/content/blog/{en,ru}/YYYY-MM-DD-slug.md` (both locales ideally).
2. Frontmatter: `title`, `description`, `date`, `tags`, `draft: false`.
3. Write content in markdown.
4. `git commit -m "Post: <title>"` → `git push origin main`.
5. Post appears at `/{locale}/blog/<slug>` + top 3 in homepage BlogPreview.
```

→ Script adaptation (bash, runs from repo root):
```bash
#!/usr/bin/env bash
# deploy-post.sh — verify + commit + push a new blog post
# Usage: deploy-post.sh <slug> <title>

set -euo pipefail

SLUG="$1"
TITLE="$2"

# 1. Build succeeds
npm run build

# 2. Verify no relative image paths (Pitfall 5)
if grep -rnE '\]\(blog-assets/' src/content/blog/ 2>/dev/null; then
  echo "ERROR: found relative blog-assets path(s). Use /blog-assets/..." >&2
  exit 1
fi

# 3. Playwright screenshot (verify live card shape)
# Assumes dev server is running at localhost:4321
# (planner decides: start server here, or require caller to have it running)

# 4. Git commit (NO Co-Authored-By for content per CLAUDE.md)
git add "src/content/blog/en/${SLUG}.md" \
        "src/content/blog/ru/${SLUG}.md" \
        "public/blog-assets/${SLUG}/" 2>/dev/null || true
git commit -m "Post: ${TITLE}"

# 5. Push to main (auto-deploys via GH Actions)
git push origin main

# 6. Report status
gh run list --branch main --limit 3
```

**CRITICAL rule** (CLAUDE.md + CONTEXT.md D-43): commit message is `Post: <title>` plain — NO `Co-Authored-By` trailer. This is different from Wave 1/Wave 2 infrastructure commits which DO use `docs/feat(09-XX):` with the trailer.

---

### 15. `.claude/skills/vv-blog-from-vault/references/voice-guide.md` — NEW

**Analog:** `~/.claude/skills/vv-carousel/references/typography.md` (30 lines — locked-spec pattern with a single mandate up top)

**Locked-spec pattern** (typography.md lines 1-6):
```markdown
# Typography Scale — locked

**Do not deviate.** User feedback on v1 was "очень мелкий контент" (too small) and "лучше меньше но крупнее" (less content, bigger). Typography is intentionally XL for phone readability.

All sizes below are **CSS px at 1080×1350 canvas**. ...
```

→ Blog voice-guide adaptation (D-31 + vv-carousel SKILL.md § "Caption writing rules (anti-AI, human voice)" lines 184-199, which is the canonical ban-list):
```markdown
# Voice Guide — locked

**Do not deviate.** Voice is **tech-expert from first person** (CONTEXT.md D-31). Audience is senior engineers (K8s, AWS, AI-for-DevOps). Never neutral tutorial; never punchy-opinionated-for-its-own-sake.

## Stance

- "I've seen this fail in production" over "Some teams find…"
- Ground every claim in either the vault (QMD source) or session history (recall/episodic-memory)
- Acknowledge when you'd use the opposite approach (manifests post: "I'd use helm for large platforms anyway")

## Rules

1. No Unicode bold/italic. Markdown `**bold**` only.
2. Zero em dashes (`—`). Use periods, commas, colons.
3. Ban AI vocabulary: **delve, landscape, tapestry, harness, leverage, utilize, pivotal, seamless, groundbreaking, realm**. Plain English.
4. Open with a concrete detail only Viktor would know: a number, a date, a client reaction.
5. Use contractions: "I've", "don't", "it's", "Here's".
6. Vary sentence length.
7. End the lede with a question or a promise of what comes next.
```

---

### 16. `.claude/skills/vv-blog-from-vault/references/translation-rules.md` — NEW

**Analog:** `~/.claude/skills/vv-carousel/references/primitives.md` (table-locked reference, 150+ lines) — same shape (table of rules) + CONTEXT.md D-30.

**Table-locked reference shape** (primitives.md excerpt):
```markdown
# 6 Visualization Primitives

Every content slide (not cover/CTA) uses exactly ONE primitive.

## 1. Big Number
**Pattern file:** `k8s-interview/c03-mistake1.html`
**When to use:** Stat-driven mistake slides
**Key styles:** ...
```

→ Blog adaptation — rule table per D-30:
```markdown
# Translation Rules (EN → RU) — locked

**Source:** CONTEXT.md D-30. Follow `src/content/blog/{en,ru}/hello-world.md` precedent — tech terms stay English, prose translates to natural Russian.

## Rules

| # | Rule | Example |
|---|------|---------|
| 1 | Tech terms stay in English | `Karpenter`, `NodePool`, `MCP server`, `YAML`, `Cluster Autoscaler`, flag names |
| 2 | Concepts translate if natural | "cluster" → "кластер" in natural RU phrasing; but "Karpenter cluster" stays as-is |
| 3 | Code blocks identical | Never translate variable names, CLI commands, or fenced code contents |
| 4 | Upstream quotes preserved | If the source (carousel, talk) is English, keep quote in English, mark `*(original English)*` if needed |
| 5 | Both locales in same commit | CLAUDE.md bilingual constraint |
| 6 | Frontmatter fields translate | `title`, `description` translate; `date`, `tags`, `slug` do NOT |
| 7 | Common idiomatic mappings | "in production" → "в продакшне"; "at scale" → "на масштабе"; "right sizing" stays EN if term of art |

## Validation

- RU file must not contain the EN `<!-- TODO: translate -->` marker
- RU title + description should read naturally to a Russian-native reader
- Code blocks diff must be empty (bytewise identical)
```

---

### 17. `.claude/skills/vv-blog-from-vault/references/frontmatter-schema.md` — NEW

**Analog:** `src/content.config.ts` blog block (post-Wave 1) + `~/.claude/skills/sync-claude-sessions/SKILL.md` lines 67-84 (Frontmatter Schema reference pattern)

**Frontmatter reference pattern** (sync-claude-sessions SKILL.md lines 66-84):
```markdown
## Frontmatter Schema

\`\`\`yaml
type: claude-session
date: YYYY-MM-DD
session_id: uuid
title: "..."
summary: "..." # auto-generated from Claude Code or first user message
skills: [skill1, skill2]
messages: 42
last_activity: ISO timestamp
status: active | done | blocked | handoff
tags: []          # see schema/tags.yaml
rating: null      # 1-10
comments: |
  [2026-02-05 14:30] Comment here
projects: []
\`\`\`
```

→ Blog adaptation (mirrors post-Wave 1 Zod schema):
```markdown
# Frontmatter Schema — blog post

**Source:** `src/content.config.ts` (blog collection, post-Wave 1).

## Required

\`\`\`yaml
title: "Karpenter in production: right-sizing at 1000 clusters"
description: "How Salesforce cut 70% of cluster cost with Karpenter — the 3 traps and the 4-step rollout"
date: 2026-03-20
tags: ["kubernetes", "aws", "karpenter"]
\`\`\`

## Optional (with defaults)

\`\`\`yaml
draft: false                                         # default: false
author: "Viktor Vedmich"                             # default: "Viktor Vedmich"
reading_time: 8                                      # optional — if absent, computed at build
cover_image: "/blog-assets/2026-03-20-karpenter-right-sizing/cover.png"  # optional
\`\`\`

## Rules

- `title` — sentence case, descriptive, no clickbait. Becomes `<h1>` on slug page + card title.
- `description` — 15-30 words. Becomes card excerpt + `<p class="text-lg text-text-muted">` on slug page + OG description.
- `date` — ISO `YYYY-MM-DD`. Drives sort order on homepage BlogPreview + /blog/ index.
- `tags` — required array, 2-4 tags, lowercase. Render UPPERCASE via CSS.
- `reading_time` — omit and let the remark plugin compute (official Astro recipe).
- `cover_image` — root-absolute path `/blog-assets/{slug}/file.png` (never relative).

## Validation

Zod schema at `src/content.config.ts` — `npm run build` enforces. Any violation = build fails.
```

---

### 18. `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — NEW

**Analog:** No prior analog (novel decision tree per D-37). **Structural** borrowing from `vv-carousel/references/primitives.md` (table-of-choices shape) + RESEARCH.md Code Example 6.

**Example 6 from RESEARCH.md** (lines 693-705):
```markdown
## Visuals Routing Decision Tree

| Section content signal | Route |
|------------------------|-------|
| "flow", "sequence", "pipeline", 3+ enumerated steps | mermaid-pro → request flowchart/sequence |
| "architecture", component diagram | mermaid-pro → architecture (subgraphs) + palette `cloud` if AWS |
| hand-sketched style, whiteboard | excalidraw |
| physical metaphor, illustration, hero image | art → prompt for NanoBanana/GPTImage |
| brand-consistent visual (carousel slide style) | viktor-vedmich-design |
| opinion/reflection section | no visual |
```

→ Reference file content structure:
```markdown
# Visuals Routing — decision tree

**Source:** CONTEXT.md D-37 + D-38 + D-39 + RESEARCH.md Pattern 5 (skill delegation).

## Priority 0: reuse FIRST (D-39)

Before routing to a generation skill, check vault for existing assets:

| Topic | Vault path to check |
|-------|---------------------|
| Karpenter / cluster autoscaling | `45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/out/*.png` |
| K8s interview | `45.20-Brand-Kit/carousel-templates/k8s-interview/out/*.png` |
| S3 security | `45.20-Brand-Kit/carousel-templates/s3-security-8point/out/*.png` |
| AWS Summit talk diagrams | `44-Speaking/44.20-Talk-Materials/*/diagrams/` |

If a slide fits the section: copy to `public/blog-assets/{slug}/<descriptive-kebab-name>.png`, skip generation.

## Priority 1: route to a skill (only if reuse failed)

| Section content signal | Delegate to | Invocation |
|------------------------|-------------|------------|
| "flow", "sequence", "pipeline", 3+ enumerated steps | `mermaid-pro` | Natural-language: "use mermaid-pro to generate a flowchart of X (palette: midnight, platform: astro)" |
| "architecture", component diagram | `mermaid-pro` | "architecture diagram with subgraphs, palette cloud if AWS" |
| hand-sketched / whiteboard style | `excalidraw` | "sketch of X in excalidraw style" |
| physical metaphor, hero illustration | `art` | "generate prompt for NanoBanana showing X" |
| brand-consistent visual (Deep Signal palette) | `viktor-vedmich-design` | "generate visual using viktor-vedmich-design UI kit" |
| opinion / reflection / pure prose section | (no visual) | — |

## Invocation pattern

Per RESEARCH.md Pattern 5 — natural-language references trigger SKILL description match. Do NOT use `Skill()` call syntax (agent-only pattern).

## Image path rule

All inline images use root-absolute paths: `/blog-assets/{slug}/file.png`. Relative paths break at `/ru/blog/...` (RESEARCH.md Pitfall 5).
```

---

### 19. `.claude/skills/vv-blog-from-vault/references/companion-sources.md` — NEW

**Analog:** No prior analog (novel vault map per D-10). **Structural** borrowing from CLAUDE.md § "Obsidian Vault Cross-References" table shape.

**CLAUDE.md vault table pattern** (already in project CLAUDE.md):
```markdown
| Site Section | Vault Source Path | Notes |
|---|---|---|
| Bio / About | `30-Projects/34-Personal-Brand/2026-02-23-JetBrains-CV-Draft.md` | Skills, certs, experience |
| ...
```

→ Reference file content — map of "topic → companion artifact" for D-10 scan:
```markdown
# Companion Sources — vault map

**Source:** CONTEXT.md D-08, D-09, D-10. When a draft is ready, scan the vault for related carousels, talks, and podcast episodes — suggest end-of-post "Related" section (NOT in the intro per D-09).

## Carousel companions (LinkedIn)

Source dir: `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/`

| Slug | Topic match signal |
|------|--------------------|
| `karpenter-1000-clusters/` | karpenter, cluster autoscaling, right-sizing |
| `k8s-interview/` | kubernetes interview, CKA/CKS prep |
| `s3-security-8point/` | S3, AWS security, MFA Delete |
| `kubectl-apply-path/` | kubectl, declarative config, API server |

## Talk companions (conferences)

Source dir: `~/Documents/ViktorVedmich/40-Content/44-Speaking/44.20-Talk-Materials/` + CFPs in `44.10-CFPs/15.31-Talks-Materials/`.

| Talk ID / note | Topic match signal |
|----------------|--------------------|
| `DOP202-Warsaw-Summit-Speaker-Notes.md` | karpenter, cost optimization, AWS Summit |
| `2026-05-06-Warsaw-Summit-MCP-Chalk-Talk.md` | MCP, Claude Code, AI DevOps |

## Podcast companions

Source dir: `~/Documents/ViktorVedmich/30-Projects/32-DKT/` (DKT) + `~/Documents/ViktorVedmich/10-AWS/15-Content-YT-Podcat-Talks/15.10-AWS-RU-Podcast/`.

Scan for episodes on the same topic via `qmd search "<topic>"` over the `vault` collection.

## Placement rule (D-09)

"Related" section goes at end-of-post, never in intro or lede. Example closing:

\`\`\`markdown
## Related

- LinkedIn carousel: [Karpenter at 1000 clusters — 3 traps you hit before you cut cost](https://linkedin.com/in/vedmich/posts/...)
- AWS Summit Warsaw 2026 chalk talk: "MCP Servers Plainly Explained" — May 6, session DOP202
\`\`\`
```

---

### 20. `.claude/skills/vv-blog-from-vault/workflows/new-post.md` — NEW

**Analog:** `~/.claude/skills/recall/workflows/topic.md` (7-step workflow, 68 lines) + `~/.claude/skills/vv-carousel/SKILL.md` 10-step workflow structure.

**Workflow structure pattern** (recall/workflows/topic.md):
```markdown
# Topic Recall Workflow

## Step 1: Extract Topic
Parse user input...

## Step 2: Query Expansion
Generate 3-4 keyword variants...

## Step 3: Parallel Search
Run ALL variants across collections...

## Step 4: Deduplicate and Rank
...

## Step 5: Fetch Documents
...

## Step 6: Present Results
Organize by source type: Sessions / Vault Notes / Episodic Memory

## Step 7: One Thing
Generate concrete next action.
```

→ Blog adaptation — 9 steps matching RESEARCH.md Wave 2 skill orchestration diagram (lines 226-258):
```markdown
# Workflow — new post

## Step 1 — Clarify topic + slug + companions

Ask 3 questions:
1. Topic (e.g., "karpenter right-sizing")
2. Slug (kebab-case, date-prefixed: `YYYY-MM-DD-topic`)
3. Companion artifacts? (carousel / talk / podcast episode — run Step 2 check first)

## Step 2 — Vault search (QMD + confidential filter)

Run `scripts/vault-search.py "<topic>"`. Present top 5 results. Operator selects 2-3 to read via `mcp__qmd__get`.

## Step 3 — Session history (recall)

Delegate to `recall` skill with topic mode:
"recall <topic>" → scans sessions + episodic memory + diary files.

Extract: quotes, decisions, client anecdotes (stripped of identifying detail if needed).

## Step 4 — Companion link check

Per `references/companion-sources.md`, scan for:
- Carousel at `45.20-Brand-Kit/carousel-templates/<topic-match>/`
- Talk at `44-Speaking/44.20-Talk-Materials/`
- Podcast episode via `qmd search "<topic>" --collection vault`

## Step 5 — Draft generation EN

Per `references/voice-guide.md` (voice) + `references/frontmatter-schema.md` (frontmatter) + word-count from D-06.

- Karpenter: ~1500-2500 words, 3 traps + 4-step rollout + stats lede
- MCP: ~800-1200 words, simple arch diagram, 3-4 concrete examples
- Manifests: ~700-1000 words, opinion, 3-4 reasons + counter + heuristic

## Step 6 — Translate RU

Per `references/translation-rules.md`. Full body translation (D-29), NOT frontmatter-only.

## Step 7 — Visuals audit + routing

Per `references/visuals-routing.md`. Priority 0 (reuse) > Priority 1 (delegate). Copy PNGs to `public/blog-assets/{slug}/`.

## Step 8 — Related section

Only if companion exists (D-08). Place at end-of-post per D-09.

## Step 9 — Verify + push

Run `scripts/deploy-post.sh {slug} "{title}"`:
1. `npm run build`
2. Verify image paths are root-absolute
3. `git commit -m "Post: {title}"` (no Co-Authored-By per CLAUDE.md / D-43)
4. `git push origin main`
5. `gh run list --branch main --limit 3` to confirm deploy

Report URL: `https://vedmich.dev/{locale}/blog/{slug}`.
```

---

### 21. `.claude/skills/vv-blog-from-vault/workflows/update-post.md` — NEW

**Analog:** `~/.claude/skills/recall/workflows/temporal.md` (simpler 5-step workflow, 44 lines)

**Temporal workflow pattern** (recall/workflows/temporal.md):
```markdown
# Temporal Recall Workflow

## Step 1: Parse Date Expression
Extract date from user input.

## Step 2: List Sessions
python3 recall-day.py list <DATE_EXPR>...

## Step 3: Expand Sessions
If 1-2 sessions: auto-expand. If 3+: ask which.

## Step 4: Synthesize
Organize findings.

## Step 5: One Thing
Generate concrete next action.
```

→ Blog adaptation — simpler 5-step flow for editing an existing post:
```markdown
# Workflow — update post

## Step 1 — Identify post
Ask: "which post to update" or parse from user input (slug / title).

## Step 2 — Load EN + RU
Read both `src/content/blog/{en,ru}/<slug>.md`.

## Step 3 — Apply edits
- If typo/fix: direct edit in both locales (one commit).
- If new section: draft in EN, translate to RU per `references/translation-rules.md`.
- If added visual: run Step 7 from new-post.md workflow.

## Step 4 — Verify build
`npm run build` must pass.

## Step 5 — Push
`git commit -m "Post: Update <title> — <reason>"` (NO Co-Authored-By per CLAUDE.md). `git push origin main`.
```

---

## Pattern Assignments — Wave 3 (Content)

### 22–27. Six content files — `src/content/blog/{en,ru}/YYYY-MM-DD-*.md`

**Analog:** `src/content/blog/en/hello-world.md` (lines 1-26) + `src/content/blog/ru/hello-world.md` (lines 1-26)

**Frontmatter pattern — EN** (hello-world.md lines 1-6):
```yaml
---
title: "Hello World: Launching vedmich.dev"
description: "Why I built a personal site and what to expect here — architecture notes, Kubernetes deep-dives, and lessons from building at scale."
date: 2026-03-03
tags: ["personal", "announcement"]
---
```

→ Wave 3 EN posts — example for karpenter (post-schema-tighten, with optional `author`):
```yaml
---
title: "Karpenter in production: right-sizing at 1000 clusters"
description: "How Salesforce cut 70% of cluster cost with Karpenter — the 3 traps and the 4-step rollout"
date: 2026-03-20
tags: ["kubernetes", "aws", "karpenter"]
author: "Viktor Vedmich"  # optional — defaults to this
---
```

**Frontmatter pattern — RU** (hello-world.md RU lines 1-6):
```yaml
---
title: "Hello World: Запуск vedmich.dev"
description: "Зачем я создал персональный сайт и что здесь будет — заметки по архитектуре, Kubernetes, и уроки из работы с enterprise-системами."
date: 2026-03-03
tags: ["personal", "announcement"]
---
```
RU title/description translate; date/tags stay identical between EN and RU (per D-30 rule 6).

**Body prose structure — EN** (hello-world.md body lines 8-25):
```markdown
# Hello World

Welcome to **vedmich.dev** — my corner of the internet where I share what I learn while designing distributed systems, working with Kubernetes, and building cloud architecture at scale.

## What to Expect

- **Architecture notes** — patterns and anti-patterns from real enterprise engagements
- **Kubernetes deep-dives** — from CKA/CKS prep to production cluster design
- ...

## Why a Personal Site?

After years of creating content across YouTube, podcasts, and conferences, I wanted a single place to tie it all together.

This site is built with [Astro](https://astro.build), styled with Tailwind CSS, and deployed to GitHub Pages. Zero JavaScript shipped to the client by default — just the way I like my infrastructure: lean and efficient.

Stay tuned.
```

→ Body patterns (D-06 per-topic calibration):
- **Karpenter** (~1500-2500 words): stats lede ("Salesforce runs Karpenter on 1,000+ clusters. They cut 70% of cluster cost…") → 3 trap sections (from carousel slides 03/04/05) → 4-step rollout (from slide 06) → optional mermaid diagram of consolidation loop → "Related" section linking to carousel.
- **MCP** (~800-1200 words): "plainly explained" register — one-sentence definition → client ↔ server simple diagram → 3-4 concrete examples (AWS Knowledge MCP vs AWS Documentation MCP) → "Related" linking to DOP202 Warsaw Summit chalk talk.
- **Manifests-by-hand** (~700-1000 words): punchy lede ("I still write Kubernetes manifests by hand. Here's why.") → 3-4 reasons with nuance → acknowledgment ("I'd use helm for a 100-service platform anyway") → practical heuristic close.

**Tech term convention** (D-30 rule 1):
- EN: write naturally
- RU: keep `Karpenter`, `NodePool`, `MCP server`, `Cluster Autoscaler`, `YAML`, `kubectl`, flag names in English; translate surrounding prose

**Link pattern** (hello-world.md line 23):
```markdown
built with [Astro](https://astro.build)
```
All external links use standard markdown syntax. Internal cross-links to other posts use root-absolute: `[companion post](/en/blog/slug)` — not yet used in Phase 9 but convention should follow root-absolute rule from Pitfall 5.

**Image pattern** (new to Wave 3 — not in hello-world.md):
```markdown
![Trap 1 — provisioning speed causes cascading timeouts](/blog-assets/2026-03-20-karpenter-right-sizing/trap-1-speed.png)
```
Root-absolute path, descriptive alt text, kebab-case filename.

**Mermaid fence pattern** (optional; only if Wave 3 ships a diagram — astro.config.mjs `excludeLangs: ['mermaid']` must be enabled if used):
```markdown
\`\`\`mermaid
flowchart LR
  A[New pod pending] --> B{Karpenter evaluator}
  B -->|unschedulable| C[Launch node]
  B -->|can consolidate| D[Terminate underused node]
  C --> E[Pod scheduled]
  D --> E
\`\`\`
```

---

### 28. `public/blog-assets/2026-03-20-karpenter-right-sizing/*.png` — NEW (asset copy)

**Analog:** No prior `public/blog-assets/` — first use. Closest convention reference: `public/fonts/` (9 WOFF2 files, root-served by Astro, no optimization, referenced via `<link rel="preload">` root-absolute paths in `BaseLayout.astro`).

**Source files** (vault, pre-existing, 1080×1350 PNG @ 2× retina):
```
~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/out/
├── c01-cover.png       (skip — blog's own lede replaces it)
├── c02-setup.png       (skip — redundant with blog intro)
├── c03-mistake1.png    → REUSE as trap-1-speed.png
├── c04-mistake2.png    → REUSE as trap-2-race.png
├── c05-mistake3.png    → REUSE as trap-3-churn.png
├── c06-answer.png      → REUSE as 4-step-rollout.png
├── c07-cta.png         (skip — blog's "Related" section replaces)
```

**Copy pattern** (RESEARCH.md Code Example 4, lines 653-666):
```bash
SLUG="2026-03-20-karpenter-right-sizing"
SRC="$HOME/Documents/ViktorVedmich/40-Content/45-Personal-Brand/45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/out"
DEST="public/blog-assets/$SLUG"

mkdir -p "$DEST"
cp "$SRC/c03-mistake1.png" "$DEST/trap-1-speed.png"
cp "$SRC/c04-mistake2.png" "$DEST/trap-2-race.png"
cp "$SRC/c05-mistake3.png" "$DEST/trap-3-churn.png"
cp "$SRC/c06-answer.png"   "$DEST/4-step-rollout.png"
```

**Reference in markdown** (RESEARCH.md Pattern 4):
```markdown
![Trap 1 — provisioning speed causes cascading timeouts](/blog-assets/2026-03-20-karpenter-right-sizing/trap-1-speed.png)
```

**Atomicity rule** (D-44): images MUST be committed in the same commit as the markdown file — `deploy-post.sh` stages both together.

**Naming convention** — rename from raw carousel filenames (`c03-mistake1.png`) to descriptive kebab-case (`trap-1-speed.png`) on copy, for maintainability when the post is edited months later.

---

## Shared Patterns

### Whole-card anchor convention

**Source:** `src/components/PresentationCard.astro` lines 20-25 (+ Podcasts.astro, Book.astro site-wide precedent, D-14)
**Apply to:** `BlogCard.astro` (Wave 1)

```astro
<a
  href={href}
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
  <!-- all card rows nested inside -->
</a>
```

No nested interactive elements inside the anchor (WCAG 2.1 SC 2.4.4). Whole card is clickable.

---

### Tag badge (teal Badge) — Deep Signal token chain

**Source:** `src/components/PresentationCard.astro` line 51
**Apply to:** `BlogCard.astro` row 4 (Wave 1) + `src/pages/{en,ru}/blog/[...slug].astro` slug-page tags (Wave 1)

```astro
<span
  role="listitem"
  class="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded text-brand-primary bg-brand-primary-soft/30 border border-brand-primary/40"
>
  {tag}
</span>
```

Wrap in `<div class="flex flex-wrap gap-1.5" role="list">`.

**Tailwind 4 alpha quirk verified** (RESEARCH.md Open Question 3): `bg-brand-primary-soft/30` + `border-brand-primary/40` compiles to `color-mix(in oklab, ...)` via `@theme` bridge. Live in Phase 8 commit `757ed8e`. Zero regression expected.

---

### Collection query + sort + locale filter

**Source:** `src/components/Presentations.astro` lines 13-17 (and `src/pages/en/presentations/index.astro` lines 10-14)
**Apply to:** `BlogPreview.astro` (Wave 1) + both `src/pages/{en,ru}/blog/index.astro` (Wave 1)

```typescript
const allPosts = await getCollection('blog', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const posts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
// Homepage preview adds: .slice(0, 3)
```

---

### i18n usage pattern

**Source:** `src/components/Presentations.astro` lines 10-11 + `src/pages/en/presentations/index.astro` lines 7-8
**Apply to:** `BlogPreview.astro`, `src/pages/{en,ru}/blog/index.astro`, `src/pages/{en,ru}/blog/[...slug].astro` (all Wave 1)

```typescript
import { t, type Locale } from '../i18n/utils';
// ... get locale from props or hardcode per file
const i = t(locale);

// usage:
<h2>{i.blog.title}</h2>
<a>{i.blog.all_posts} →</a>
<p>{post.data.author} · {readingTime} {i.blog.min_read}</p>
```

---

### Date formatting with RU "г." strip

**Source:** RESEARCH.md Code Example 2 + UI-SPEC Q4
**Apply to:** `BlogCard.astro` row 1 + slug page date overline (both Wave 1)

```typescript
function formatCardDate(date: Date, locale: 'en' | 'ru'): string {
  if (locale === 'ru') {
    return date
      .toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
      .replace(/\s*г\.?$/, '');
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
```

Planner may inline inside BlogCard.astro (colocated) OR extract to `src/i18n/utils.ts`. UI-SPEC recommends inline to avoid duplicating `.replace` in every consumer.

---

### Whole-site visual utilities (never duplicate)

**Source:** `src/styles/global.css` lines 109-124
**Apply to:** every new card and scroll-triggered element (Wave 1)

```css
/* .animate-on-scroll — scroll-observer fade-in, respects prefers-reduced-motion */
.animate-on-scroll { opacity: 0; }
.animate-on-scroll.is-visible { animation: fadeInUp 0.6s ease-out forwards; }

/* .card-glow — hover shifts box-shadow to teal, border-color to teal */
.card-glow {
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}
.card-glow:hover {
  box-shadow: var(--shadow-glow);
  border-color: var(--brand-primary);
}
```

IntersectionObserver adds `.is-visible` class from `BaseLayout.astro`. New cards get animation automatically — never hand-roll IntersectionObserver in component.

---

### Bilingual commit rule

**Source:** CLAUDE.md § "i18n without deps" + § "User Context — GSD workflows"
**Apply to:** every file edit in Phases 9 that touches user-facing text

Every i18n or content change MUST edit both EN and RU in the same commit:
- Wave 1: `src/i18n/en.json` + `src/i18n/ru.json` in same commit (single `blog.min_read` key).
- Wave 1: pages `src/pages/en/blog/*` + `src/pages/ru/blog/*` in same commit (mirror edits).
- Wave 3: `src/content/blog/en/{slug}.md` + `src/content/blog/ru/{slug}.md` in same commit per post.

---

### Commit message patterns (two kinds)

**Source:** CLAUDE.md § "Publishing Workflow" + CONTEXT.md D-43 + RESEARCH.md Pitfall 6

**Wave 1 + Wave 2 (infrastructure):**
```
feat(09-01): extract BlogCard + rewrite BlogPreview

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```
Follow GSD convention `docs/feat($PHASE-$PLAN):`.

**Wave 3 (content):**
```
Post: Karpenter in production: right-sizing at scale
```
Plain subject — **NO** `Co-Authored-By` trailer. CLAUDE.md is explicit on this.

One commit per post, covers both EN + RU markdown + `public/blog-assets/{slug}/` images atomically.

---

### Confidential vault exclusion (skill-critical)

**Source:** CLAUDE.md § "Obsidian Vault Cross-References" + CONTEXT.md D-05 + RESEARCH.md Pitfall 4
**Apply to:** `scripts/vault-search.py` (Wave 2) post-filter on every QMD result

```python
CONFIDENTIAL_PREFIXES = (
    "10-AWS/11-Active-Clients/",
    "10-AWS/14-Tips-AWS-Internal/",
    "10-AWS/16-Amazon-Employer/",
)
def allowed(path: str) -> bool:
    return not any(path.startswith(p) or f"/{p}" in path for p in CONFIDENTIAL_PREFIXES)
```

Filter applies to QMD `path` metadata BEFORE result is shown to Claude. Non-negotiable.

---

### Skill delegation pattern — natural language over Skill() call

**Source:** RESEARCH.md Pattern 5 + `~/.claude/skills/recall/workflows/topic.md` line 36-37 + `~/.claude/skills/vv-carousel/SKILL.md` (implicit throughout)
**Apply to:** Wave 2 SKILL.md + all workflows/ files referencing `mermaid-pro`, `excalidraw`, `art`, `recall`, `viktor-vedmich-design`

- **To delegate to a skill:** write a natural-language sentence mentioning the target skill; its description-match will activate it. Example: `"Use mermaid-pro to generate a flowchart showing the Karpenter consolidation loop (palette: midnight)."`
- **To call an MCP tool directly:** use the full tool name. Example: `mcp__qmd__query`, `mcp__qmd__search`, `mcp__qmd__get`, `mcp__plugin_episodic-memory_episodic-memory__search`.
- **Never use `Skill()` syntax** — that is an agent-orchestration pattern, not a user-workflow pattern.

---

### Root-absolute image paths

**Source:** Astro docs + RESEARCH.md Pitfall 5
**Apply to:** every inline image in Wave 3 posts + references/frontmatter-schema.md constraint + `deploy-post.sh` verify step

```markdown
<!-- Correct -->
![Trap 1](/blog-assets/2026-03-20-karpenter-right-sizing/trap-1-speed.png)

<!-- BROKEN at /ru/blog/... -->
![Trap 1](blog-assets/2026-03-20-karpenter-right-sizing/trap-1-speed.png)
```

`deploy-post.sh` enforces with a grep gate:
```bash
if grep -rnE '\]\(blog-assets/' src/content/blog/ 2>/dev/null; then
  echo "ERROR: relative blog-assets path" >&2; exit 1
fi
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` | reference | static | No prior visuals-routing decision tree exists. Structure borrowed from `vv-carousel/references/primitives.md` table shape, but the decision-tree content is new. Planner should author per CONTEXT.md D-37 + RESEARCH.md Code Example 6. |
| `.claude/skills/vv-blog-from-vault/references/companion-sources.md` | reference | static | No prior companion-sources map exists. Structure borrowed from CLAUDE.md § "Obsidian Vault Cross-References" table, but the carousel/talk/podcast cross-reference catalog is new. |
| `public/blog-assets/2026-03-20-karpenter-right-sizing/*.png` | static asset | file copy | First use of `public/blog-assets/` subdirectory. No prior Phase established this convention; `public/fonts/` is the closest precedent (root-served static assets, no optimization). |

All three are structurally derivative of existing patterns but introduce new content. Planner can proceed by following RESEARCH.md code examples directly.

---

## Metadata

**Analog search scope:**
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/` (all Astro components)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/pages/{en,ru}/` (all pages)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/content/` (collections + content files)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/` (utils + JSON)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/styles/` (global + tokens)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/data/search-index.ts` (dead-code cleanup target)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/08-presentations-match-card-format/` (Phase 8 plans as Phase 9 precedent)
- `/Users/viktor/.claude/skills/vv-carousel/` (brand-skill template)
- `/Users/viktor/.claude/skills/sync-claude-sessions/` (Python-script + workflow skill template)
- `/Users/viktor/.claude/skills/recall/` (session recall wrapper, topic workflow)

**Files scanned:** 26 direct reads (PresentationCard, Presentations, BlogPreview, 4 index pages, 2 slug pages, content.config.ts, astro.config.mjs, 2 i18n JSON, utils.ts, hello-world EN+RU, 3 skill SKILL.md files, 3 workflows/topic+temporal, 2 skill references, recall-day.py, claude-sessions script, search-index.ts, 08-PATTERNS.md excerpt, global.css card-glow block)

**Primary analog files — direct mirror targets:**
1. `src/components/PresentationCard.astro` → `src/components/BlogCard.astro` (line-for-line, drop row 4)
2. `src/components/Presentations.astro` → `src/components/BlogPreview.astro` (swap collection, add empty state)
3. `src/pages/en/presentations/index.astro` → `src/pages/en/blog/index.astro` (swap collection + card + title)
4. `src/pages/ru/presentations/index.astro` → `src/pages/ru/blog/index.astro` (mirror EN)
5. `src/content.config.ts` speaking block pattern → blog schema tighten (`tags` required)
6. `src/content/blog/en/hello-world.md` → 3 new EN posts (frontmatter + body pattern)
7. `src/content/blog/ru/hello-world.md` → 3 new RU posts (tech-term preservation)
8. `~/.claude/skills/vv-carousel/SKILL.md` → vv-blog-from-vault SKILL.md (brand-skill shape)
9. `~/.claude/skills/recall/workflows/topic.md` → vv-blog-from-vault/workflows/new-post.md (step shape)

**Pattern extraction date:** 2026-04-26
**Confidence:** HIGH — every file in scope has an explicit analog in the same repo OR in the installed skills ecosystem. The one novel area (visuals-routing decision tree) is fully specified in RESEARCH.md Code Example 6.
