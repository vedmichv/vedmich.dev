---
phase: 2
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/search-index.ts
autonomous: true
requirements: [REQ-001]
must_haves:
  truths:
    - "buildSearchIndex('en') returns all presentations + EN-only blog posts"
    - "buildSearchIndex('ru') returns all presentations + RU-only blog posts"
    - "fuzzyScore returns 100 for title substring match, 60 for haystack substring, 30 for token-all-present, 0 otherwise"
    - "Presentations with locale_urls.ru use that override when locale === 'ru'"
  artifacts:
    - path: "src/data/search-index.ts"
      provides: "SearchItem type + buildSearchIndex(locale) + fuzzyScore(q, item)"
      exports: ["SearchItem", "buildSearchIndex", "fuzzyScore"]
  key_links:
    - from: "src/data/search-index.ts"
      to: "src/data/social.ts (presentations)"
      via: "static import + map to SearchItem"
    - from: "src/data/search-index.ts"
      to: "astro:content (blog collection)"
      via: "getCollection('blog') filtered by id prefix"
---

# Plan 01: Search index module (SearchItem + buildSearchIndex + fuzzyScore)

<objective>
Create the pure-data foundation for the ⌘K palette: a single TypeScript module that exports the `SearchItem` shape, an async `buildSearchIndex(locale)` that merges presentations (shared) and blog posts (locale-filtered) into one list, and a `fuzzyScore(q, item)` function that mirrors `app.jsx:184-195` exactly. This module has zero DOM dependencies so it can be called from any Astro component frontmatter at build time. Per D-02 (per-locale index), D-03 (slide URL locale override), D-04 (blog from Content Collection).
</objective>

<tasks>

<task id="1.1" type="execute">
<action>
Create `src/data/search-index.ts` with the following exports:

1. Type `SearchItem`:
```ts
export type SearchItem = {
  kind: 'slides' | 'post';
  title: string;
  sub: string;          // "YYYY-MM-DD · Event" for slides; "YYYY-MM-DD" for posts
  url: string;          // absolute https URL for slides, root-relative /{locale}/blog/... for posts
  tags: readonly string[];
  body: string;         // description for slides, description for posts — used in fuzzy haystack
  date: string;         // ISO date string for sorting (YYYY-MM-DD)
};
```

2. Function `fuzzyScore(q: string, item: SearchItem): number` — replicate `app.jsx:184-195` EXACTLY:
```ts
export function fuzzyScore(q: string, item: SearchItem): number {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const hay = `${item.title} ${item.body} ${item.tags.join(' ')} ${item.kind}`.toLowerCase();
  if (item.title.toLowerCase().includes(needle)) return 100 - item.title.length * 0.1;
  if (hay.includes(needle)) return 60;
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.every(t => hay.includes(t))) return 30;
  return 0;
}
```

3. Function `buildSearchIndex(locale: Locale): Promise<SearchItem[]>` — async because it uses `getCollection`:

```ts
import { getCollection } from 'astro:content';
import type { Locale } from '../i18n/utils';
import { presentations } from './social';

export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
  // Slides (shared across locales; URL can be overridden per D-03)
  const slideItems: SearchItem[] = presentations.map((p) => {
    // D-03: optional locale_urls override. presentations entries today don't have it;
    // cast to any to access optional field without widening the shared tuple type.
    const override = (p as any).locale_urls?.[locale] as string | undefined;
    const url = override ?? `https://s.vedmich.dev/${p.slug}`;
    return {
      kind: 'slides',
      title: p.title,
      sub: `${p.date} · ${p.event}`,
      url,
      tags: p.tags,
      body: p.description,
      date: p.date,
    };
  });

  // Blog posts — filter by locale subfolder (`en/` or `ru/`) and exclude drafts.
  // Content Collection IDs look like "en/2026-03-20-slug" or "ru/2026-03-20-slug".
  const blog = await getCollection('blog', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const postItems: SearchItem[] = blog.map((entry) => {
    // entry.id = "en/2026-03-20-karpenter-right-sizing"
    // strip locale prefix + leading date to get the slug Astro uses for routing.
    const idWithoutLocale = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return {
      kind: 'post',
      title: entry.data.title,
      sub: dateStr,
      url: `/${locale}/blog/${idWithoutLocale}`,
      tags: entry.data.tags ?? [],
      body: entry.data.description,
      date: dateStr,
    };
  });

  // Merge; sort order is handled by the consumer (empty state sorts by date desc).
  return [...slideItems, ...postItems];
}
```

Notes:
- Import `Locale` type from `../i18n/utils`.
- Import `presentations` from `./social`.
- Import `getCollection` from `astro:content`.
- Export ALL three: `SearchItem`, `fuzzyScore`, `buildSearchIndex`.
- Do NOT hardcode a locale prefix anywhere else — downstream consumer passes it.
- The `(p as any).locale_urls` cast is intentional: today no presentations carry the override, so the tuple type doesn't include the field. Adding the field later to `social.ts` will not break this module (D-03 forward-compatible).
- Blog `entry.id` in Astro 5 is the path minus `.md` extension (e.g. `en/2026-03-20-foo`). Strip the `{locale}/` prefix to get the slug segment Astro routes at `/[locale]/blog/[...slug]`.
</action>
<read_first>
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/data/social.ts (presentations array shape)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/content.config.ts (blog schema: title, description, date, tags, draft)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/utils.ts (Locale type)
- /Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx (lines 160-195 — fuzzyScore + buildSearchIndex reference source of truth)
- /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/.planning/phases/02-search-palette/02-CONTEXT.md (D-02, D-03, D-04)
</read_first>
<acceptance_criteria>
- `test -f /Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/data/search-index.ts` exits 0
- `rg "export (type SearchItem|async function buildSearchIndex|function fuzzyScore)" src/data/search-index.ts` returns 3 matches
- `rg "kind: 'slides'" src/data/search-index.ts` matches at least once
- `rg "kind: 'post'" src/data/search-index.ts` matches at least once
- `rg "100 - item\.title\.length \* 0\.1" src/data/search-index.ts` matches (exact formula from app.jsx:189)
- `rg "locale_urls" src/data/search-index.ts` matches (D-03 override path present)
- `rg "id\.startsWith\(\`\$\{locale\}/\`\)" src/data/search-index.ts` matches (D-04 locale filter)
- `rg "tokens\.every" src/data/search-index.ts` matches (token-all-present scoring branch)
- `npm run build` exits 0 — module compiles, Content Collection API resolves, no TS errors
- No hardcoded hex colors (`rg "#[0-9a-fA-F]{3,6}" src/data/search-index.ts` returns zero matches)
</acceptance_criteria>
</task>

</tasks>

<verification>
- `npm run build` must pass (7 pages, ~800ms).
- Module is a pure data layer — no DOM, no imports from components.
- `fuzzyScore('karp', { title: 'Karpenter in production…', body: '', tags: [], kind: 'slides', sub: '', url: '', date: '' })` returns 100 - 'Karpenter in production: right-sizing at scale'.length * 0.1 ≈ 95.7 (title substring).
- `buildSearchIndex('en')` returns 6 slide items (6 presentations today, 0 EN blog posts today) → length 6. `buildSearchIndex('ru')` returns the same 6 slides (posts not yet seeded) → length 6.
- Covers **REQ-001 (upgraded)**: the search mechanism now has a functional data backbone — the Phase 1 pill becomes wired in Plan 04 via the component built in Plan 03 against this index.
</verification>
