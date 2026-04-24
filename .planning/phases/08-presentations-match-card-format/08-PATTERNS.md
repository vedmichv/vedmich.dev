# Phase 8: Presentations — match card format + portfolio migration — Pattern Map

**Mapped:** 2026-04-24
**Files analyzed:** 18 new/modified files (1 schema + 12 content + 1 new component + 1 rewritten component + 2 new pages + 1 data cleanup + 2 i18n JSON)
**Analogs found:** 18 / 18 (100% — Phase 7 Speaking is explicit template for all files)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content.config.ts` | collection schema | build-time | `src/content.config.ts` (existing `speaking` collection, lines 15-29) | **exact** |
| `src/i18n/en.json` | i18n JSON | static | `src/i18n/en.json` (existing `presentations` object, lines 63-67) | **exact** |
| `src/i18n/ru.json` | i18n JSON | static | `src/i18n/ru.json` (existing `presentations` object, lines 63-67) | **exact** |
| `src/content/presentations/en/karpenter-prod.md` | content entry | static | `src/content/speaking/en/2026-karpenter-production.md` | **exact** |
| `src/content/presentations/en/mcp-platform.md` | content entry | static | `src/content/speaking/en/2026-genai-mcp-systems.md` | **exact** |
| `src/content/presentations/en/slurm-prompt-engineering.md` | content entry | static | `src/content/speaking/en/2026-karpenter-scalability.md` | **exact** |
| `src/content/presentations/en/slurm-ai-demo.md` | content entry | static | `src/content/speaking/en/2026-karpenter-scalability.md` | **exact** |
| `src/content/presentations/en/eks-multi-az.md` | content entry | static | `src/content/speaking/en/2024-kubernetes-security.md` | **exact** |
| `src/content/presentations/en/dkt-workflow.md` | content entry | static | `src/content/speaking/en/2024-kubernetes-security.md` | **exact** |
| `src/content/presentations/ru/*.md` (6 files) | content entry | static | `src/content/speaking/ru/*.md` (Cyrillic title + English event/city/tags pattern) | **exact** |
| `src/components/PresentationCard.astro` | Astro component (new) | props-driven | Reference `app.jsx:522-551` card body + `src/components/Podcasts.astro` (whole-card `<a>` anchor) | role-match (new DRY extraction) |
| `src/components/Presentations.astro` | Astro component (rewrite) | build-time query | `src/components/Speaking.astro` (getCollection + locale filter + sort by date desc) + existing `Presentations.astro` (card-grid shape) | **exact** |
| `src/pages/en/presentations/index.astro` | Astro page (new) | build-time query | `src/pages/en/speaking/index.astro` | **exact** |
| `src/pages/ru/presentations/index.astro` | Astro page (new) | build-time query | `src/pages/ru/speaking/index.astro` | **exact** |
| `src/data/social.ts` | data cleanup | static | `src/data/social.ts` (lines 52-113 removal — mirror Phase 7 `speakingEvents` removal) | **exact** |
| `src/data/search-index.ts` | utility (modify) | build-time query | `src/data/search-index.ts` (existing blog collection query lines 41-57 — apply same pattern to presentations) | **exact** |

---

## Pattern Assignments

### 1. `src/content.config.ts` (collection schema, build-time) — MODIFY

**Analog:** `src/content.config.ts` lines 15-29 (existing `speaking` collection).

**Imports pattern** (lines 1-2 — no change needed, `defineCollection` + `z` + `glob` already imported):
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
```

**Existing `speaking` collection** (lines 15-29, exact template to copy):
```typescript
const speaking = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speaking' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    city: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    video: z.string().url().optional(),
    slides: z.string().url().optional(),
    rating: z.string().optional(),
    highlight: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

**Pattern to replicate for `presentations` collection** (per D-07, D-08):
```typescript
const presentations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/presentations' }),
  schema: z.object({
    title: z.string(),                       // Deck title (required)
    event: z.string(),                       // Conference/context name (required)
    city: z.string().nullable(),             // Event city — nullable for online/course decks (Slurm)
    date: z.coerce.date(),                   // Deck date (required)
    description: z.string(),                 // Excerpt for card, 15-30 words (required)
    tags: z.array(z.string()),               // Topic tags — required array, 2-4 per deck
    slides: z.string().url().optional(),     // External Slidev URL
    video: z.string().url().optional(),      // YouTube URL (reserved, unused Phase 8)
    draft: z.boolean().default(false),
  }),
});
```

**Export statement update** (line 31, current):
```typescript
export const collections = { blog, speaking };
```

**Replace with:**
```typescript
export const collections = { blog, speaking, presentations };
```

**Migration notes (critical for planner/executor):**
- **Difference from `speaking` schema:** `presentations` has a `description` field (ref calls it `excerpt`) that `speaking` does NOT have — Speaking uses markdown body text for detail; Presentations uses `description` field for short card excerpt per D-08.
- **Difference from `speaking` schema:** `presentations.city` is `z.string().nullable()`, NOT `z.string()` — online/course decks (Slurm) have `city: null` per D-08.
- **No `rating` / `highlight` fields:** Both are Speaking-specific (speaker rating, session highlights). Omit from Presentations schema.
- **`slides` field stores external URL for Phase 8** — when Unified Slides milestone (v0.5) ships, this becomes optional (D-24).
- **`video` reserved but unused Phase 8** — match Phase 7 Plan 2 convention: OMIT the field entirely from frontmatter when empty (do NOT write `video: ""` — z.string().url() will fail on empty string).

---

### 2. `src/content/presentations/en/*.md` (content entries, static) — CREATE × 6

**Analog:** `src/content/speaking/en/2026-karpenter-production.md` (exact frontmatter pattern — 3 KB file, read in full).

**Speaking frontmatter (the exact pattern to replicate):**
```yaml
---
title: "Karpenter in Production: Architecting Cost-Efficient K8s Clusters"
event: "AWS Community Day Slovakia"
city: "Bratislava"
date: 2026-02-15
tags: ["Kubernetes", "AWS", "Karpenter", "Cost Optimization"]
draft: false
---

Real-world lessons from running Karpenter in production environments, focusing on cost optimization and operational best practices.
```

**Note on omitted fields:** Existing Speaking files OMIT `slides:` and `video:` entirely when empty (not `slides: ""`). This is the Phase 7 Plan 2 convention — `z.string().url().optional()` fails on empty strings but succeeds on omitted optionals. **Apply same rule to Presentations.** For the `highlight` pattern on `2023-reinvent-cdk8s.md`, the field is present only when populated.

**Pattern to replicate for Presentations** (extract from `src/data/social.ts` lines 52-113, see Migration Data below):

**File 1: `src/content/presentations/en/karpenter-prod.md`**
```yaml
---
title: "Karpenter in production: right-sizing at scale"
event: "AWS Community Day"
city: "Bratislava"
date: 2026-04-19
description: "Architecting cost-efficient K8s clusters. Lessons from 12 production deployments — what worked, what didn't, and the numbers."
tags: ["Kubernetes", "AWS", "Karpenter"]
slides: "https://s.vedmich.dev/karpenter-prod/"
draft: false
---

```

**File 2: `src/content/presentations/en/mcp-platform.md`**
```yaml
---
title: "MCP servers for platform teams"
event: "Code Europe"
city: "Krakow"
date: 2026-03-08
description: "What the Model Context Protocol actually solves for infrastructure tooling — with three live demos and a reference implementation."
tags: ["AI", "MCP", "Agents"]
slides: "https://s.vedmich.dev/mcp-platform/"
draft: false
---

```

**File 3: `src/content/presentations/en/slurm-prompt-engineering.md`** (city: null for online/course deck)
```yaml
---
title: "Prompt Engineering for DevOps"
event: "Slurm AI for DevOps"
city: null
date: 2026-02-14
description: "AI prompt techniques for infrastructure automation. Patterns, anti-patterns, and a shared vocabulary for reviewing AI-generated IaC."
tags: ["AI", "DevOps", "Prompt Engineering"]
slides: "https://s.vedmich.dev/slurm-prompt-engineering/"
draft: false
---

```

**File 4: `src/content/presentations/en/slurm-ai-demo.md`** (city: null)
```yaml
---
title: "Slurm AI Demo"
event: "Slurm AI for DevOps"
city: null
date: 2026-01-22
description: "Course theme showcase — how the curriculum maps AI capabilities onto the everyday DevOps workflow."
tags: ["AI", "Demo"]
slides: "https://s.vedmich.dev/slurm-ai-demo/"
draft: false
---

```

**File 5: `src/content/presentations/en/eks-multi-az.md`**
```yaml
---
title: "Multi-AZ data on EKS without tears"
event: "KubeCon EU"
city: "Paris"
date: 2025-11-05
description: "Topology-aware routing, cost of cross-AZ traffic, and how we got the p99 back under 50ms after a botched migration."
tags: ["Kubernetes", "AWS", "Networking"]
slides: "https://s.vedmich.dev/eks-multi-az/"
draft: false
---

```

**File 6: `src/content/presentations/en/dkt-workflow.md`** (source has `location: 'online'` — decide during planning: treat "online" as city OR null; recommendation: `city: null` because it's a location descriptor, not a real city)
```yaml
---
title: "The podcast workflow behind DKT"
event: "DevOpsConf"
city: null
date: 2025-09-18
description: "Five years, 91+ episodes, two shows. The tooling, the outreach script, and the editing pipeline."
tags: ["Meta", "Podcasting"]
slides: "https://s.vedmich.dev/dkt-workflow/"
draft: false
---

```

**Migration notes:**
- Source data: `src/data/social.ts` lines 52-113 `presentations` array. Fields: `date` / `event` / `location` / `title` / `description` / `slug` / `tags`.
- **`event` vs `city` mapping:** Source field `location` → target field `city`. When source `location === null` OR `location === 'online'`, set `city: null`. (DKT-workflow has `location: 'online'` — treat as null per Slurm pattern.)
- **`slides` field populated from slug:** `https://s.vedmich.dev/{slug}/` (trailing slash matches current behavior in `Presentations.astro:35`).
- **`draft: false`** — all 6 existing decks are live (mirror Speaking pattern).
- **Empty body text** — per D-09, Phase 8 migrates `description` only, leaves body empty. Executor may expand later via QMD vault search. Keep trailing newline after `---` for valid Markdown.
- **Filename = slug** (per D-10) — NOT `YYYY-slug.md` like Speaking. Speaking uses year-prefix for chronological sorting in file tree; Presentations uses slug directly.

---

### 3. `src/content/presentations/ru/*.md` (content entries, static) — CREATE × 6

**Analog:** `src/content/speaking/ru/2026-karpenter-production.md` (exact pattern for RU mirror files).

**Speaking RU frontmatter pattern** (`2026-karpenter-production.md`):
```yaml
---
title: "Karpenter в продакшене: архитектура экономичных K8s кластеров"
event: "AWS Community Day Slovakia"
city: "Bratislava"
date: 2026-02-15
tags: ["Kubernetes", "AWS", "Karpenter", "Cost Optimization"]
draft: false
---

Реальные уроки эксплуатации Karpenter в production окружениях с фокусом на оптимизацию затрат и операционные best practices.
```

**Localization rules (apply verbatim from Phase 7):**
- **Filename:** identical to EN (slug stays English for URL consistency, e.g. `karpenter-prod.md` both locales).
- **`title`:** Translate to Russian (Cyrillic).
- **`event`:** Keep in English — conference names are proper nouns.
- **`city`:** Keep in English — city names are proper nouns. `null` stays `null`.
- **`date`:** Identical.
- **`description`:** Translate to Russian.
- **`tags`:** Keep in English — topic tags, not UI strings.
- **`slides`:** Identical URL.
- **`draft`:** Identical.
- **Body text:** Empty (per D-09), same as EN.

**Example RU file — `src/content/presentations/ru/karpenter-prod.md`:**
```yaml
---
title: "Karpenter в продакшене: right-sizing на масштабе"
event: "AWS Community Day"
city: "Bratislava"
date: 2026-04-19
description: "Архитектура экономичных K8s кластеров. Уроки из 12 production деплоев — что сработало, что нет, и цифры."
tags: ["Kubernetes", "AWS", "Karpenter"]
slides: "https://s.vedmich.dev/karpenter-prod/"
draft: false
---

```

**Migration notes:**
- 6 RU files = 6 EN files with `title` and `description` translated; all other fields identical.
- Bilingual constraint from CLAUDE.md: both locales edited in same commit.
- Existing Russian subtitle key translations use same pattern (e.g. "Свежие доклады" for `presentations.title`).

---

### 4. `src/components/PresentationCard.astro` (new Astro component, props-driven) — CREATE

**Analog mix (new DRY extraction, no single exact analog):**
- **Whole-card `<a>` anchor pattern:** `src/components/Podcasts.astro` lines 18-22, 53-57.
- **Card base style:** `src/components/Book.astro` lines 54-55 (`card-glow` + `rounded-xl bg-bg border border-border`).
- **Visual contract (5-row structure):** Reference `app.jsx:522-551` — source of truth for spacing, typography, order.
- **Tag badge treatment:** Reference `app.jsx:125-129` `Badge` primitive.
- **Group hover pattern:** `src/components/Speaking.astro` line 51, `Presentations.astro` line 43 (existing — retained).

**Podcasts whole-card anchor excerpt** (Podcasts.astro:18-50, the closest in-codebase pattern):
```astro
<a
  href="https://www.youtube.com/c/DevOpsKitchenTalks"
  target="_blank"
  rel="noopener noreferrer"
  class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
>
  <!-- badge slot -->
  <h3 class="font-display text-[22px] font-semibold text-text-primary mt-3 mb-2">...</h3>
  <p class="font-body text-[15px] text-text-muted leading-relaxed">...</p>
  <div class="font-mono text-xs text-text-muted mt-4">{stats}</div>
</a>
```

**Pattern to build — `PresentationCard.astro`** (apply D-21, D-22 — 5-row card structure per UI-SPEC `## Layout Specifications`):

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  deck: CollectionEntry<'presentations'>;
}

const { deck } = Astro.props;
const { data, id } = deck;

// Slug = filename stem, identical to EN/RU id suffix
// data.id looks like "en/karpenter-prod" — strip locale prefix
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = `https://s.vedmich.dev/${slug}/`;
const displayUrl = `s.vedmich.dev/${slug}`;

// ISO date format per UI-SPEC "Formatting rules" — date display in overline uses YYYY-MM-DD
const dateStr = data.date.toISOString().slice(0, 10);

// Overline: "{date} · {event} · {city}" or "{date} · {event}" when city is null (Slurm decks)
const overlineParts = [dateStr, data.event, data.city].filter(Boolean);
---

<a
  href={deckUrl}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
  <!-- Row 1: Overline — mono 12px muted, mb-2 -->
  <div class="font-mono text-xs text-text-muted mb-2">
    {overlineParts.join(' · ')}
  </div>

  <!-- Row 2: Title — display 18px/600, teal on hover, mt-0 -->
  <h3 class="font-display text-lg font-semibold leading-snug mt-0 text-text-primary group-hover:text-brand-primary transition-colors">
    {data.title}
  </h3>

  <!-- Row 3: Description — body 14px secondary, my-2.5 (10px), flex-1 to push bottom rows down -->
  <p class="font-body text-sm text-text-secondary my-2.5 leading-relaxed flex-1">
    {data.description}
  </p>

  <!-- Row 4: Slug URL — mono 11px SOLID teal, tracking-[0.06em], mt-2/mb-2.5, truncate -->
  <div class="font-mono text-[11px] text-brand-primary tracking-[0.06em] mt-2 mb-2.5 truncate">
    {displayUrl}
  </div>

  <!-- Row 5: Tags — teal Badge style per D-01, gap-1.5 (6px), role=list -->
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
</a>
```

**CRITICAL migration note — Tailwind 4 `@theme` alpha behavior (D-02 verification):**

The design token `--brand-primary-soft` resolves to `#134E4A` (dark teal), NOT a light teal. Applying `/30` alpha (`bg-brand-primary-soft/30`) produces `rgba(19, 78, 74, 0.3)` — which is visually darker/more subdued than the reference `rgba(20,184,166,.1)` (ref's `VV.teal` at 10% alpha).

**Build-time verification required** (D-02, UI-SPEC `## Visual Fidelity Checkpoints` point 8):
1. Run `npm run build` after creating PresentationCard.
2. Inspect compiled CSS: `bg-brand-primary-soft/30` should emit `background-color: rgba(19, 78, 74, 0.3)` or equivalent color-mix expression.
3. Visually verify at 1440px against `reference-1440-full.png`: tag badges should have a visible teal tint on `bg-surface` (#1E293B), with border slightly more saturated than background.

**Fallback if visual doesn't match reference** (per D-02 and UI-SPEC point 8 "verify Tailwind 4 `@theme` alpha behavior"):
- Replace `bg-brand-primary-soft/30` with `bg-brand-primary/10` — applies 10% alpha to BASE token `#14B8A6` (the bright teal), matching ref `rgba(20,184,166,.1)` exactly.
- Border `border-brand-primary/40` already uses base token — no change needed.
- Document the switch in summary as "closer byte-match to reference than soft-variant" if taken.

**Existing codebase evidence Tailwind 4 `@theme` alpha works:**
- `src/components/Hero.astro:44`: `bg-brand-primary-soft` (no alpha, used as solid bg) — confirms soft token maps.
- `src/components/Hero.astro:44`: `hover:bg-brand-primary-hover/20` — confirms `/NN` alpha works on brand tokens.

---

### 5. `src/components/Presentations.astro` (Astro component, REWRITE) — MODIFY

**Analog (primary — query + sort + slice pattern):** `src/components/Speaking.astro` lines 1-27.

**Analog (secondary — existing wrapper shape):** Current `src/components/Presentations.astro` lines 14-28 (header row with inline "All decks →" link — retained per D-04).

**Speaking query + filter pattern** (Speaking.astro lines 12-27 — exact template):
```typescript
// Query all speaking entries for current locale
const allTalks = await getCollection('speaking', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

// Sort by date descending
const talks = allTalks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

**Pattern to replicate (per D-12, D-13):**
```typescript
---
import { getCollection } from 'astro:content';
import { t, type Locale } from '../i18n/utils';
import PresentationCard from './PresentationCard.astro';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);

// Query all presentations for current locale (D-12)
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

// Sort by date descending, total count before slice for subtitle interpolation (D-13)
const sortedDecks = allDecks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const totalCount = sortedDecks.length;
const homepageDecks = sortedDecks.slice(0, 6);

// Dynamic subtitle with N interpolation (D-13) — i18n value contains "{N}" placeholder
const subtitle = i.presentations.subtitle.replace('{N}', String(totalCount));
---
```

**Current `Presentations.astro` header row** (lines 14-28 — retain shape, update link target):
```astro
<div class="flex items-baseline justify-between gap-6 mb-2 animate-on-scroll">
  <h2 class="font-display text-3xl font-bold">{i.presentations.title}</h2>
  <a
    href={slidesBase}  <!-- CHANGE: external s.vedmich.dev → internal /{locale}/presentations -->
    target="_blank"    <!-- REMOVE: internal nav doesn't need target=_blank -->
    rel="noopener noreferrer"  <!-- REMOVE: internal nav -->
    class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
  >
    {i.presentations.all_decks} →
  </a>
</div>
<p class="text-text-muted mb-12 animate-on-scroll">{i.presentations.subtitle}</p>
```

**Updated header (per D-05):**
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

**Full rewrite template** (combining query + header + grid):
```astro
<section id="presentations" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {homepageDecks.map((deck) => (
        <PresentationCard deck={deck} />
      ))}
    </div>
  </div>
</section>
```

**Migration notes:**
- **Remove `import { presentations } from '../data/social';`** — replaced by Content Collection query.
- **Remove `const slidesBase = 'https://s.vedmich.dev';`** — URL construction moved into PresentationCard.
- **Change `max-w-6xl mx-auto px-4 sm:px-6`** (current line 15) → **`max-w-[1120px] mx-auto px-6`** (D-18). Ref byte-match = 1120px; drop `max-w-6xl` (1152px).
- **Change `bg-surface` section background added** (D-17) — ref zebra: Podcasts surface → Speaking surface → Book amber → **Presentations surface** → Blog transparent.
- **Change `gap-4` → `gap-5`** (D-20) — ref gap 20px = `gap-5`.
- **Change inline card markup** → `<PresentationCard deck={deck} />` per D-16 (DRY between section + index page).
- **Update responsive grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (ref uses fixed 3-col, we keep responsive). Current `grid sm:grid-cols-2 lg:grid-cols-3` omits `grid-cols-1` base — fix to explicit mobile 1-col.

---

### 6. `src/pages/en/presentations/index.astro` (Astro page, NEW) — CREATE

**Analog:** `src/pages/en/speaking/index.astro` (exact structure — BaseLayout + collection query + grouped render).

**Speaking index pattern** (speaking/index.astro lines 1-67 — exact template):
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';

const locale = 'en';
const i = t(locale);

// Query all speaking entries for current locale
const allTalks = await getCollection('speaking', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

// Sort by date descending
const talks = allTalks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

// Group by year
const talksByYear = talks.reduce((acc, talk) => {
  const year = talk.data.date.getFullYear().toString();
  if (!acc[year]) acc[year] = [];
  acc[year].push(talk);
  return acc;
}, {} as Record<string, typeof talks>);
---

<BaseLayout
  title="Speaking — Viktor Vedmich"
  description="Conference talks and presentations on Kubernetes, AWS, and cloud architecture"
  locale={locale}
  path="/speaking"
>
  <div class="py-20 sm:py-28">
    <div class="max-w-[1120px] mx-auto px-6">
      <h1 class="font-display text-4xl font-bold mb-2 animate-on-scroll">{i.speaking.title}</h1>
      <p class="text-text-muted mb-12 animate-on-scroll">{i.speaking.subtitle}</p>
      <!-- ... grouped grid render ... -->
    </div>
  </div>
</BaseLayout>
```

**Pattern to replicate for `src/pages/en/presentations/index.astro`** (per D-14, D-15 — NO grouping by year; simple date-desc grid of all decks):
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { t } from '../../../i18n/utils';
import PresentationCard from '../../../components/PresentationCard.astro';

const locale = 'en';
const i = t(locale);

// Query all presentations for this locale, not draft
const allDecks = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

// Sort by date descending — no slice, render ALL decks (D-14)
const decks = allDecks.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const totalCount = decks.length;
const subtitle = i.presentations.subtitle.replace('{N}', String(totalCount));
---

<BaseLayout
  title={`${i.presentations.title} — Viktor Vedmich`}
  description="Conference presentations and Slidev decks on Kubernetes, AWS, MCP, and AI for DevOps"
  locale={locale}
  path="/presentations"
>
  <div class="py-20 sm:py-28">
    <div class="max-w-[1120px] mx-auto px-6">
      <!-- Back link -->
      <a
        href={`/${locale}/`}
        class="font-body text-sm text-brand-primary hover:text-brand-primary-hover transition-colors mb-6 inline-block"
      >
        ← {i.back_to_home}
      </a>

      <h1 class="font-display text-4xl font-bold mb-2 animate-on-scroll">{i.presentations.title}</h1>
      <p class="text-text-muted mb-12 animate-on-scroll">{subtitle}</p>

      <!-- Grid: same as homepage section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {decks.map((deck) => (
          <PresentationCard deck={deck} />
        ))}
      </div>
    </div>
  </div>
</BaseLayout>
```

**Migration notes:**
- **NO "All decks →" footer link** — this IS the full portfolio page (UI-SPEC `## Layout Specifications > Index Page > Difference from homepage`).
- **NO year grouping** (differs from Speaking index) — Presentations are all recent (2025-2026), flat grid is cleaner per D-14.
- **Back link** per UI-SPEC `## Layout Specifications > Index Page > Back link`: uses `text-brand-primary hover:text-brand-primary-hover` (visible teal link, matches Speaking `speaking.back_link` pattern but uses new `back_to_home` key per D-28).
- **Page title** uses same i18n key as homepage section (`presentations.title`) per D-15.
- **BaseLayout path** `"/presentations"` — canonical URL path (BaseLayout prepends locale).

---

### 7. `src/pages/ru/presentations/index.astro` (Astro page, NEW) — CREATE

**Analog:** `src/pages/ru/speaking/index.astro` (exact mirror of EN with `locale = 'ru'`).

**Pattern — identical to EN file with two changes:**
1. Line 6: `const locale = 'ru';`
2. Line 27 (BaseLayout title/description): Russian copy OR keep same (existing Speaking uses English meta — "Speaking — Viktor Vedmich" for both EN/RU).

**Recommendation (matches Phase 7 Speaking pattern):**
```astro
<BaseLayout
  title={`${i.presentations.title} — Viktor Vedmich`}
  description="Conference presentations and Slidev decks on Kubernetes, AWS, MCP, and AI for DevOps"
  locale={locale}
  path="/presentations"
>
```
The `i.presentations.title` will resolve to "Свежие доклады" in RU — yields "Свежие доклады — Viktor Vedmich" title. English description is acceptable (matches Speaking convention; meta isn't localized).

**Alternate (fully localized title per UI-SPEC `## Copywriting Contract > Index Page`):**
- EN: `"Recent decks · Viktor Vedmich"`
- RU: `"Свежие доклады · Виктор Ведмич"`

Planner decision: pick one convention (recommend matching Speaking: `${i.presentations.title} — Viktor Vedmich` for DRY across both locales).

---

### 8. `src/i18n/en.json` (i18n JSON, static) — MODIFY

**Analog:** Existing `src/i18n/en.json` lines 63-67 (current `presentations` object).

**Current state** (lines 63-67):
```json
"presentations": {
  "title": "Recent decks",
  "subtitle": "6 talks · all slides at s.vedmich.dev",
  "all_decks": "All decks"
}
```

**Changes required** (per D-13, D-28):
1. `presentations.subtitle` — replace hardcoded "6 talks" with "{N} talks" placeholder for interpolation at build time.
2. Add new top-level key `back_to_home` (or under a `common` namespace — D-28 says "reuse if present, else add"; grep confirms it does NOT exist, so add it). Verify with `jq '.back_to_home' src/i18n/en.json` before adding — if present in unusual nesting, reuse.

**Target state:**
```json
"presentations": {
  "title": "Recent decks",
  "subtitle": "{N} talks · all slides at s.vedmich.dev",
  "all_decks": "All decks"
},
```

**New top-level key addition** (insert near other top-level keys, e.g. after `"footer"` or between existing sections):
```json
"back_to_home": "Back to Home"
```

**Migration notes:**
- **DO NOT remove the `·` unicode escape** — current pattern uses escaped middot. Keep same encoding.
- **Interpolation at build time:** `i.presentations.subtitle.replace('{N}', String(totalCount))` in `Presentations.astro` and `presentations/index.astro`. No runtime i18n library; manual string replace matches project convention (no `astro-i18n` package, per CLAUDE.md "i18n without deps").
- **`back_to_home` placement:** Top-level key (not nested under any section). Header/Footer components may also use this key in future; keeping it top-level enables reuse. Phase 7 used `speaking.back_link` (nested), but for a generic "back to home" link, top-level is cleaner.

**Alternative placement for `back_to_home`:** Phase 7 convention nested `back_link` under `speaking`. If consistency with Phase 7 is preferred, planner could nest under `presentations.back_link`. Recommendation: top-level `back_to_home` per CONTEXT.md D-28 explicit naming.

---

### 9. `src/i18n/ru.json` (i18n JSON, static) — MODIFY

**Analog:** Existing `src/i18n/ru.json` lines 63-67 (mirror EN structure with Russian values).

**Current state** (lines 63-67, decoded):
```json
"presentations": {
  "title": "Свежие доклады",
  "subtitle": "6 докладов · все слайды на s.vedmich.dev",
  "all_decks": "Все доклады"
}
```

**Target state:**
```json
"presentations": {
  "title": "Свежие доклады",
  "subtitle": "{N} докладов · все слайды на s.vedmich.dev",
  "all_decks": "Все доклады"
},
```

**New top-level key:**
```json
"back_to_home": "Назад на главную"
```

**Migration notes:**
- Keep unicode escape convention (`Све...`) consistent with existing file. Do NOT convert to raw Cyrillic unless the whole file is re-encoded (it isn't).
- Both locale files MUST be edited in the same commit (bilingual constraint from CLAUDE.md).
- Russian plural of "talks" = "докладов" (genitive plural — works for any N ≥ 5 and 0). For N=1, "доклад"; N=2-4, "доклада". Phase 8 has 6 decks (genitive plural correct). Accept this simplification; proper Russian pluralization (1/2-4/5+) would require a plural helper function — defer as out of scope.

---

### 10. `src/data/social.ts` (data cleanup, static) — MODIFY (remove `presentations` export)

**Analog:** Phase 7's removal of `speakingEvents` from same file (mirror operation).

**Current state** (lines 52-113 — the `presentations` array):
```typescript
export const presentations = [
  {
    date: '2026-04-19',
    event: 'AWS Community Day',
    location: 'Bratislava',
    title: 'Karpenter in production: right-sizing at scale',
    description: "Architecting cost-efficient K8s clusters. Lessons from 12 production deployments — what worked, what didn't, and the numbers.",
    slug: 'karpenter-prod',
    tags: ['Kubernetes', 'AWS', 'Karpenter'],
  },
  // ... 5 more deck entries ...
] as const;
```

**Action (per D-25):** Delete lines 52-113 (the entire `export const presentations = [...]` block including trailing `] as const;`).

**Preserve in `social.ts`:**
- `socialLinks` (lines 1-27) — used by Hero, Contact sections.
- `certifications` (lines 29-36) — used by Hero, About sections.
- `skills` (lines 38-50) — used by About section.

**Migration notes:**
- **Search for all consumers BEFORE deleting:** `grep -rn "from.*data/social" src/` — confirm only `Presentations.astro` and `search-index.ts` import `presentations`. After updating both, it's safe to delete.
- **Clean break, no shim** per D-25 and CLAUDE.md guidance: "If you are certain that something is unused, you can delete it completely."
- **Verification after cleanup:** `npm run build` must exit 0 (TypeScript + Astro will throw if any lingering import references `presentations` from `social.ts`).

---

### 11. `src/data/search-index.ts` (utility, build-time) — MODIFY

**Analog:** Existing `src/data/search-index.ts` lines 41-57 (blog collection query — apply same pattern to presentations).

**Current state** — two sources for search:
1. Lines 27-39: `slideItems` built from `import { presentations } from './social'` (array map).
2. Lines 41-57: `postItems` built from `await getCollection('blog', ...)` (collection query).

**Blog collection query pattern** (lines 41-57 — exact template to apply to presentations):
```typescript
const blog = await getCollection('blog', ({ id, data }) => {
  return !data.draft && id.startsWith(`${locale}/`);
});

const postItems: SearchItem[] = blog.map((entry) => {
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
```

**Pattern to replicate for presentations** (per D-26):
```typescript
// Remove: import { presentations } from './social';
// Replace import with:
import { getCollection } from 'astro:content';

export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
  // Query presentations collection for current locale
  const decks = await getCollection('presentations', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const slideItems: SearchItem[] = decks.map((entry) => {
    const slug = entry.id.replace(new RegExp(`^${locale}/`), '');
    const dateStr = entry.data.date.toISOString().slice(0, 10);
    return {
      kind: 'slides',
      title: entry.data.title,
      sub: `${dateStr} · ${entry.data.event}`,
      url: `https://s.vedmich.dev/${slug}`,
      tags: entry.data.tags,
      body: entry.data.description,
      date: dateStr,
    };
  });

  // Blog query — unchanged
  const blog = await getCollection('blog', ({ id, data }) => {
    return !data.draft && id.startsWith(`${locale}/`);
  });

  const postItems: SearchItem[] = blog.map((entry) => {
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

  return [...slideItems, ...postItems];
}
```

**Migration notes:**
- **Drop the `locale_urls` override logic** (current lines 28-29: `const override = (p as any).locale_urls?.[locale]`). The current `social.ts` data shape doesn't actually populate `locale_urls`; it's dead code. Content Collection doesn't need per-locale URL overrides since slugs are locale-agnostic (same filename both locales).
- **`SearchItem.tags` typing:** Current type `readonly string[]` — Content Collection emits `string[]` (not readonly). Either widen type to `string[]` OR cast at map site. Recommend: update `SearchItem.tags: string[]` (read-write) to match both sources naturally.
- **Keep `sub` format:** `"{date} · {event}"` — matches current behavior and user expectations in ⌘K palette.
- **URL format:** Still external `https://s.vedmich.dev/{slug}` for Phase 8. When Unified Slides ships (future), change to internal `/{locale}/presentations/{slug}` (D-24).

---

## Shared Patterns

These patterns apply across multiple new/modified files.

### A. Content Collection Query with Locale Filter

**Source:** `src/components/Speaking.astro` lines 13-15; `src/pages/en/speaking/index.astro` lines 10-12; `src/data/search-index.ts` lines 41-43.

**Apply to:** `Presentations.astro`, `PresentationCard.astro` (no direct query — receives from props), `pages/{en,ru}/presentations/index.astro`, `search-index.ts`.

```typescript
const items = await getCollection('presentations', ({ data, id }) => {
  return id.startsWith(`${locale}/`) && !data.draft;
});

const sorted = items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

**Notes:**
- **`id.startsWith(`${locale}/`)`** — glob loader ids include the directory prefix (e.g. `en/karpenter-prod`). This filter keeps locale separation clean.
- **`!data.draft`** — schema default is `false`, so this filter is defensive (allows future drafts to be hidden).
- **Sort in place after filter** — `getCollection` returns unordered results.

---

### B. Token-Based Colors (NO hardcoded hex)

**Source:** CLAUDE.md "Anti-Patterns — MUST avoid" section; all existing components.

**Apply to:** `PresentationCard.astro`, `Presentations.astro`, `presentations/index.astro`.

**Allowed color utilities for Phase 8:**
- **Text:** `text-text-primary`, `text-text-secondary`, `text-text-muted`, `text-brand-primary`, `text-brand-primary-hover`
- **Background:** `bg-surface`, `bg-brand-primary-soft`, `bg-brand-primary-soft/30` (alpha, verify D-02)
- **Border:** `border-border`, `border-brand-primary`, `border-brand-primary/40` (alpha)

**Forbidden:**
- Any `#XXXXXX` hardcoded hex (especially `#06B6D4`, `#22D3EE` deprecated cyan).
- Pure `#000` / `#FFF` body text.

**Verification command** (UI-SPEC `## Visual Fidelity Checkpoints > Build Verification`):
```bash
grep -r '#[0-9A-Fa-f]\{6\}' src/components/Presentations.astro src/components/PresentationCard.astro src/pages/*/presentations/
# Must return 0 matches
```

---

### C. `animate-on-scroll` Class

**Source:** `src/styles/global.css` lines 98-115 (CSS); `src/components/Speaking.astro` lines 31, 32, 36; `src/components/Podcasts.astro` lines 22, 57; existing `Presentations.astro` line 38.

**Apply to:** Every card in the grid + section title + subtitle (matches current Presentations + Speaking pattern).

```astro
<h2 class="font-display text-3xl font-bold mb-2 animate-on-scroll">...</h2>
<p class="text-text-muted mb-12 animate-on-scroll">...</p>

<div class="grid ...">
  {decks.map(deck => (
    <PresentationCard deck={deck} />  <!-- class="... animate-on-scroll" applied inside card -->
  ))}
</div>
```

**CSS definition (already in global.css, no change needed):**
```css
.animate-on-scroll {
  opacity: 0;
}
.animate-on-scroll.is-visible {
  animation: fadeInUp 0.6s ease-out forwards;
}
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll { opacity: 1; }
}
```

**IntersectionObserver:** triggered in `BaseLayout.astro` — no per-component JS needed.

---

### D. Whole-Card `<a>` Anchor + card-glow Hover

**Source:** `src/components/Podcasts.astro` lines 18-50; `src/components/Book.astro` lines 50-91; existing `Presentations.astro` lines 34-57.

**Apply to:** `PresentationCard.astro` (D-23).

```astro
<a
  href={deckUrl}
  target="_blank"
  rel="noopener noreferrer"
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
  <!-- card body: 5 rows per D-22 -->
</a>
```

**Notes:**
- **`group` class enables child `group-hover:` utilities** (title color change on card hover per UI-SPEC visual fidelity checkpoint 5).
- **`.card-glow` (defined in global.css lines 118-124):** transitions `box-shadow` + `border-color` — on hover, adds `--shadow-glow` and changes border to `--brand-primary` (teal).
- **`rounded-xl`** = 16px (D-21) matches ref `borderRadius: 12` plus extra 4px for site-wide consistency with Podcasts/Book.
- **`p-6`** = 24px padding (D-21) per ref `padding: 24`.
- **`bg-surface`** = `#1E293B` per ref `VV.surface`.
- **`border-border`** = `#334155` — default unhovered border; card-glow hover replaces with teal.

---

### E. Container + Section Padding

**Source:** `src/components/Speaking.astro` line 30; `src/pages/en/speaking/index.astro` line 33.

**Apply to:** `Presentations.astro`, `presentations/index.astro` (D-18, D-19).

```astro
<section class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
    <!-- ... -->
  </div>
</section>
```

**Notes:**
- **`max-w-[1120px]`** per D-18 — drop `max-w-6xl` (1152px).
- **`px-6`** = 24px — drop `px-4 sm:px-6` (16→24px responsive).
- **`py-20 sm:py-28`** = 80px mobile / 112px desktop per D-19 and existing Speaking pattern.
- **`bg-surface`** on section only for homepage section (D-17 zebra rhythm); index page uses default body background (no section bg).

---

### F. BaseLayout Props Pattern

**Source:** `src/pages/en/speaking/index.astro` lines 26-31; `src/pages/en/blog/[...slug].astro`.

**Apply to:** Both `pages/{en,ru}/presentations/index.astro`.

```astro
<BaseLayout
  title={`${i.presentations.title} — Viktor Vedmich`}
  description="Conference presentations and Slidev decks on Kubernetes, AWS, MCP, and AI for DevOps"
  locale={locale}
  path="/presentations"
>
  <!-- ... -->
</BaseLayout>
```

**Notes:**
- **`path="/presentations"`** — BaseLayout prepends locale; final canonical URL = `https://vedmich.dev/{locale}/presentations/`.
- **`title`** uses i18n key + " — Viktor Vedmich" suffix (matches Speaking convention).
- **`description`** in English both locales — meta isn't localized per Speaking pattern; acceptable simplification.

---

### G. Role=list Tag Semantics (Accessibility)

**Source:** UI-SPEC `## Accessibility > Requirements > Semantic HTML`.

**Apply to:** `PresentationCard.astro` tag row.

```astro
<div class="flex flex-wrap gap-1.5" role="list">
  {data.tags.map((tag) => (
    <span role="listitem" class="...">{tag}</span>
  ))}
</div>
```

**Notes:**
- **NOT `<ul>/<li>`** — tags are display labels within a card, not a standalone list. `role="list"` / `role="listitem"` gives screen readers semantic grouping without changing default block layout.
- **No individual `<a>` on tags** — whole-card anchor captures click (D-03: tags are not filter links in Phase 8).

---

## Shared Cross-Cutting Concerns

### Tailwind 4 `@theme` Alpha Verification (CRITICAL — D-02)

**Problem:** `--brand-primary-soft` resolves to `#134E4A` (dark teal), NOT a light tint of `#14B8A6`. Applying `/30` alpha produces `rgba(19, 78, 74, 0.3)`, which may render as too-dark/olive on `bg-surface` instead of ref's clean teal tint.

**Where this matters:** `PresentationCard.astro` tag badge background.

**Verification procedure (required during planning → execution):**
1. Plan includes explicit build-and-screenshot check after PresentationCard lands.
2. Run `npm run build && npm run preview`.
3. Open `localhost:4321/en/#presentations` at 1440px viewport.
4. Compare tag badge appearance against `reference-1440-full.png` (user-provided reference screenshot).
5. Use browser DevTools to inspect computed `background-color` on `.tag-badge` (or whatever class PresentationCard emits):
   - **Pass:** rgba value with visible teal hue on dark bg-surface, border more saturated than bg.
   - **Fail:** olive/muddy rendering OR no visible tint difference from bg-surface.

**Fallback path** (if fail — documented in D-02 "If `/30` alpha on soft-variant doesn't compile, fallback: `bg-brand-primary/10` (alpha on base token)"):
- Replace `bg-brand-primary-soft/30` → `bg-brand-primary/10` in PresentationCard.
- Rebuild, re-verify. Base token `#14B8A6` at 10% alpha matches ref `rgba(20,184,166,.1)` exactly.
- Document decision in `08-03-SUMMARY.md` (or equivalent Wave 2 summary).

---

### Empty Body Text in Markdown Files (Phase 7 Convention)

**Source:** All 14 existing Speaking markdown files keep body text to 1-2 sentences; several Presentations files will have EMPTY body per D-09.

**Apply to:** All 12 new `src/content/presentations/{en,ru}/*.md` files.

**Valid empty-body markdown:**
```markdown
---
title: "..."
# ... frontmatter ...
draft: false
---

```

**Trailing newline after `---` is required** for valid Markdown + Astro content parsing. Do not leave the file ending mid-line.

**Validation gate:** `npm run build` must pass Zod schema validation for all 12 files; empty body is allowed because no `body` field exists in schema.

---

## Files With No Analog

**None.** All 18 files have either exact or role-match analogs in the codebase (primarily Phase 7 Speaking).

---

## Migration Data Extraction (from `src/data/social.ts` lines 52-113)

Six decks to migrate. Source field → target field mapping:

| Source field (`social.ts`) | Target frontmatter (`*.md`) | Transformation |
|---|---|---|
| `date: '2026-04-19'` | `date: 2026-04-19` | Strip quotes (YAML date literal, `z.coerce.date` accepts ISO string) |
| `event: 'AWS Community Day'` | `event: "AWS Community Day"` | Copy verbatim |
| `location: 'Bratislava'` | `city: "Bratislava"` | Rename field, copy value |
| `location: null` (Slurm) | `city: null` | Copy `null` as-is |
| `location: 'online'` (DKT) | `city: null` | **Transform "online" → null** (online is not a city; `null` matches Slurm pattern per UI-SPEC `## Content Collection Schema > Field notes`) |
| `title: '...'` | `title: "..."` | Copy verbatim |
| `description: '...'` | `description: "..."` | Copy verbatim (source `description` → target `description`; NOT renamed to `excerpt` despite ref using `excerpt`) |
| `slug: 'karpenter-prod'` | **Filename:** `karpenter-prod.md` | Source field → filename stem; NOT a frontmatter field |
| `tags: ['Kubernetes', ...]` | `tags: ["Kubernetes", ...]` | Copy verbatim (Mixed case preserved per UI-SPEC `## Copywriting Contract > Formatting rules`) |
| (computed) | `slides: "https://s.vedmich.dev/{slug}/"` | Construct from slug, include trailing slash |
| (none) | `video:` | **OMIT field entirely** — reserved, unused Phase 8 |
| (implicit) | `draft: false` | All 6 decks are live |

### Full data extraction table (copy-paste for Wave 1 plan)

| Slug | date | event | city | title (EN) | description (EN) | tags |
|---|---|---|---|---|---|---|
| `karpenter-prod` | 2026-04-19 | AWS Community Day | Bratislava | Karpenter in production: right-sizing at scale | Architecting cost-efficient K8s clusters. Lessons from 12 production deployments — what worked, what didn't, and the numbers. | Kubernetes, AWS, Karpenter |
| `mcp-platform` | 2026-03-08 | Code Europe | Krakow | MCP servers for platform teams | What the Model Context Protocol actually solves for infrastructure tooling — with three live demos and a reference implementation. | AI, MCP, Agents |
| `slurm-prompt-engineering` | 2026-02-14 | Slurm AI for DevOps | null | Prompt Engineering for DevOps | AI prompt techniques for infrastructure automation. Patterns, anti-patterns, and a shared vocabulary for reviewing AI-generated IaC. | AI, DevOps, Prompt Engineering |
| `slurm-ai-demo` | 2026-01-22 | Slurm AI for DevOps | null | Slurm AI Demo | Course theme showcase — how the curriculum maps AI capabilities onto the everyday DevOps workflow. | AI, Demo |
| `eks-multi-az` | 2025-11-05 | KubeCon EU | Paris | Multi-AZ data on EKS without tears | Topology-aware routing, cost of cross-AZ traffic, and how we got the p99 back under 50ms after a botched migration. | Kubernetes, AWS, Networking |
| `dkt-workflow` | 2025-09-18 | DevOpsConf | null | The podcast workflow behind DKT | Five years, 91+ episodes, two shows. The tooling, the outreach script, and the editing pipeline. | Meta, Podcasting |

**RU translation task** — planner MUST translate `title` and `description` for all 6 entries into Russian. Event, city, tags, date, slides, draft remain English/ASCII identical.

**Known corner cases:**
- **DKT-workflow `location: 'online'`:** Source uses string "online"; target normalizes to `city: null`. Note in summary: "online descriptor collapsed to null to match Slurm course-deck pattern."
- **Slurm event name has no `·` separator** (unlike ref's "AWS Community Day · Bratislava" where we'd split); instead source already has `event: 'Slurm AI for DevOps'` + `location: null`. No parsing needed.
- **Ref `app.jsx:64` shows `event: 'AWS Community Day · Bratislava'`** (concatenated). Our schema splits into `event` + `city`. Render path (PresentationCard overline) rebuilds the joined string at render time via `filter(Boolean).join(' · ')`.

---

## Metadata

**Analog search scope:**
- `src/content.config.ts` (collection schemas)
- `src/content/speaking/{en,ru}/*.md` (14 files — frontmatter + body patterns)
- `src/components/*.astro` (Speaking, Presentations, Podcasts, Book — card + query patterns)
- `src/pages/{en,ru}/speaking/index.astro` (portfolio index template)
- `src/data/social.ts` (data source — presentations array for migration)
- `src/data/search-index.ts` (search integration pattern)
- `src/i18n/{en,ru}.json` (translation key structure)
- `src/styles/{global,design-tokens}.css` (Tailwind 4 @theme + token resolution verification)
- Reference UI kit: `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` lines 62-87 (data), 125-129 (Badge), 157-168 (Card), 522-551 (Presentations)
- Phase 7 plans: `07-01-PLAN.md` (schema + i18n wave), `07-02-PLAN.md` (markdown migration wave), `07-03-PLAN.md` (rewrite + cleanup wave)

**Files scanned:** 18 source files + 3 Phase 7 plan files + reference `app.jsx` targeted sections.

**Pattern extraction date:** 2026-04-24.

**Key patterns identified:**
1. **Content Collection with `z.string().nullable()` for optional-but-required field** — new to Presentations (city), not in existing schemas. Validated in Zod docs via Context7 prior to schema design.
2. **Omit optional URL fields when empty** — Phase 7 Plan 2 convention: `z.string().url().optional()` fails on `""`; executor omits the frontmatter key entirely. Critical for `video` field in Phase 8.
3. **Dynamic subtitle count interpolation** — `i.presentations.subtitle.replace('{N}', ...)` at build time in Astro frontmatter. No runtime i18n library.
4. **Whole-card `<a>` anchor pattern** — site-wide convention (Podcasts, Book, current Presentations). Extract to new `PresentationCard.astro` for DRY per D-16.
5. **Reference byte-match vs site consistency trade-off** — "All decks →" inline header link (site consistency with Speaking Phase 7) chosen over ref's footer ghost Button (D-04). Document clearly so visual checker doesn't flag as drift.
6. **Tailwind 4 `@theme` alpha on design tokens** — `bg-brand-primary-soft/30` compiles to `rgba(19,78,74,0.3)` because soft token is `#134E4A` (dark teal), NOT a light teal. Fallback documented: `bg-brand-primary/10` for closer ref byte-match if visual fails.

**Implementation complexity:** LOW — All patterns have exact precedents in the codebase (Phase 7 Speaking is explicit template). Main risks:
1. Tag badge alpha rendering (D-02) — mitigation documented with fallback.
2. RU translation quality — planner/executor should use QMD vault search OR LLM-assisted translation with Russian native review.
3. `city: null` vs missing-city rendering — Covered by `[dateStr, event, city].filter(Boolean).join(' · ')` idiom; won't render trailing separator.

---

## Summary for Planner

**Wave 1 (parallel, low risk):**
- Plan 01: `content.config.ts` (schema) + `i18n/{en,ru}.json` (subtitle interpolation + `back_to_home`) — mirrors Phase 7 Plan 01.
- Plan 02: Create 12 markdown files (6 EN + 6 RU) from migration data table above — mirrors Phase 7 Plan 02.

**Wave 2 (sequential, depends on Wave 1):**
- Plan 03: Create `PresentationCard.astro` (new DRY component), rewrite `Presentations.astro`, create `pages/{en,ru}/presentations/index.astro`, update `search-index.ts`, remove `presentations` export from `social.ts` — mirrors Phase 7 Plan 03.

**Critical verification (post-Wave 2):**
- `npm run build` exit 0.
- Browser DevTools computed styles check for tag badge alpha (D-02 fallback trigger).
- Playwright screenshot at 1440px EN + RU, compare to `reference-1440-full.png`.
