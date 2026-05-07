# Phase 5: Slidev Integration - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 24 touchpoints (13 modified source/config + 3 runbook-ish docs + 2 skill mirrors + 6 traceability/metadata)
**Analogs found:** 20 / 21 code-like files (1 net-new with no repo analog — `.gitmodules`)

## Executive Summary

Phase 5 is a **composition problem, not a computation problem**. Every source edit has a strong in-repo analog; every new doc has an in-repo or skill-system style analog; only `.gitmodules` (git metadata) has no analog, and it's a native git primitive with a known byte-exact shape. The planner should emphasize three meta-patterns to the executor:

1. **MDX draft flip is 12 identical one-key frontmatter additions** — not 12 unique edits. The sed-/grep-style mechanical repetition pattern is the analog, not component-style thinking.
2. **i18n edits are 2 parallel edits** (`en.json` + `ru.json`, same key `presentations.subtitle`, bilingual mirror) — Phase 3's bilingual-parity invariant applies unchanged.
3. **URL rewrite is a 1-line swap in 2 files** (`PresentationCard.astro:12-13` + `search-index.ts:37`) with the same `data.slides ?? \`/slides/${slug}/\`` precedence rule. Think of these as **one logical edit in two files**.

The net-new docs (`docs/slides-onboarding.md`, `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md`, vault mirror) have only cross-skill style analogs — the closest repo-local pattern for the runbook is `diagrams-source/README.md` (Phase 04 runbook); the closest skill-local pattern is `~/.claude/skills/vv-slidev/references/deployment.md`.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.gitmodules` (new) | config | — (git metadata) | none in repo | no-analog (git primitive) |
| `slidev/` (new submodule dir) | external-artifact | file-I/O (CI cp) | none in repo | no-analog (submodule-primitive) |
| `.github/workflows/deploy.yml` (edit) | CI config | build-time composition | self (baseline ~50 LOC, extended) | exact (same file) |
| `src/components/PresentationCard.astro` (edit) | component | build-time (Astro SSR) URL derivation | self (lines 11-13) + `src/components/BlogCard.astro` (URL derivation analog) | exact (same file) |
| `src/components/Presentations.astro` (edit, optional) | component | build-time list render | `src/components/BlogPreview.astro:26-47` (empty-state pattern) | role-match (sibling component) |
| `src/data/search-index.ts` (edit) | utility / data-builder | build-time transform | self (line 37) — pattern mirrors `slideItems` vs `postItems` within same file | exact (same file, symmetric blocks) |
| `src/i18n/en.json` (edit, `presentations.subtitle` line 65) | config / i18n resource | build-time string lookup | self (line 65) — bilingual pair with `ru.json:65` | exact (same key) |
| `src/i18n/ru.json` (edit, `presentations.subtitle` line 65) | config / i18n resource | build-time string lookup | self (line 65) — bilingual mirror of `en.json` | exact (bilingual mirror) |
| `src/content/presentations/en/{6 files}.md` (edit) | content / frontmatter | build-time collection entry | `src/content/blog/en/*.md` (draft:false consumers) + self (existing frontmatter shape) | exact (same collection, 6 sibling MDX already green) |
| `src/content/presentations/ru/{6 files}.md` (edit) | content / frontmatter | build-time collection entry | bilingual mirror of `src/content/presentations/en/*.md` | exact (same collection, sibling) |
| `CLAUDE.md` (edit — add `## Slidev Integration`, update lines 123/270/314-321) | documentation / project-instructions | human-read | `CLAUDE.md §Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)` (lines 329-338) | exact (same file, style block) |
| `docs/slides-onboarding.md` (new) | documentation / runbook | human-read | `diagrams-source/README.md` (118 LOC, 6 H2 sections: Prerequisites / Authoring / Metadata / Exporting / Embedding / Gotchas / Further reading) | role-match (different directory, same runbook-genre) |
| `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` (new) | skill / reference | Claude-loaded | `~/.claude/skills/vv-slidev/references/deployment.md` (96 LOC — deploy procedure on the gh-pages side) | exact (same skill, sibling reference) |
| `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md` (new) | skill / vault mirror | QMD-indexed | vault mirror of the live skill file | exact (1:1 mirror by rule) |
| `.planning/REQUIREMENTS.md` (edit) | traceability | human-read | self (checkbox flips as in prior phase closes) | exact (same file, same convention) |
| `.planning/ROADMAP.md` (edit) | traceability | human-read | self (Phase 04.1 close was the most recent) | exact (same file) |
| `.planning/STATE.md` (edit) | traceability | human-read | self (updated every phase close) | exact (same file) |

## Pattern Assignments

### 1. `.github/workflows/deploy.yml` (CI config, build-time composition)

**Analog:** self, baseline 50 LOC — the edit extends the existing workflow without restructuring it.

**Current shape** (`.github/workflows/deploy.yml:17-39`, verbatim):
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Astro
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
```

**Delta the planner instructs the executor to make** (2 surgical edits, no restructure):

Edit A — add `with: submodules: recursive` to the existing `Checkout` step (insert 2 lines after line 22):
```yaml
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
```

Edit B — insert a new `Copy Slidev decks to dist/slides` step between `Build Astro` (line 33-34) and `Upload artifact` (line 36-39). Whitelist commented-out per D-12:
```yaml
      - name: Copy Slidev decks to dist/slides
        run: |
          mkdir -p dist/slides
          # Whitelist — uncomment a line as each deck migrates to vedmich.dev/slides/<slug>/.
          # The deck must be pre-built in vedmichv/slidev:gh-pages with
          # `slidev build --base /slides/<slug>/` (NOT just --base /<slug>/).
          # See docs/slides-onboarding.md for the full flow.
          # for slug in slurm-prompt-engineering slurm-ai-demo; do
          #   cp -r slidev/$slug dist/slides/
          # done
```

**Invariants to preserve:**
- Single-job topology (`build:` + `deploy:`) per SLIDES-02 — do NOT split into `build-astro` + `build-slides`.
- `actions/checkout@v4` unchanged (same version pin; only `with:` block added).
- Trailing `Upload artifact` step unchanged — always runs after cp step.

---

### 2. `src/components/PresentationCard.astro` (component, build-time URL derivation)

**Analog:** self (lines 11-13) — only the URL derivation block changes; the template (lines 20-57) is untouched.

**Current shape** (`src/components/PresentationCard.astro:1-18`):
```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  deck: CollectionEntry<'presentations'>;
}

const { deck } = Astro.props;
const { data, id } = deck;

const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = `https://s.vedmich.dev/${slug}/`;
const displayUrl = `s.vedmich.dev/${slug}`;

const dateStr = data.date.toISOString().slice(0, 10);

const overlineParts = [dateStr, data.event, data.city].filter(Boolean);
---
```

**Delta** (3-line edit, lines 11-13):
```astro
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = data.slides ?? `/slides/${slug}/`;
const displayUrl = `vedmich.dev/slides/${slug}`;
```

**Precedence rule** (D-04): if frontmatter has `slides: "https://external..."` (SpeakerDeck, Notist, or user-hosted override), that URL wins; otherwise fall back to the computed internal path. This matches the optional schema field `slides: z.string().url().optional()` already in `src/content.config.ts:43`.

**displayUrl policy:** recommend option (b) from RESEARCH.md — keep the row (lines 41-44 in the template) and show `vedmich.dev/slides/${slug}` for visual continuity with the previous `s.vedmich.dev/${slug}` pattern.

**Invariants to preserve:**
- `target="_blank"` + `rel="noopener noreferrer"` on the `<a>` (line 22-23) — the external-override case still opens in a new tab.
- Template hover states (`group-hover:text-brand-primary`, `card-glow`) and token classes unchanged.
- `overlineParts` derivation (line 17) unchanged.

---

### 3. `src/data/search-index.ts` (utility, build-time transform)

**Analog:** self (the pattern is already half-implemented — `postItems` block at lines 48-60 uses internal-absolute URLs; `slideItems` block at lines 30-42 uses the outgoing `https://s.vedmich.dev/...`. The delta makes `slideItems` symmetric with `postItems`).

**Current shape** (`src/data/search-index.ts:25-42`):
```typescript
export async function buildSearchIndex(locale: Locale): Promise<SearchItem[]> {
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
```

**Delta** (line 37 only):
```typescript
      url: entry.data.slides ?? `/slides/${slug}/`,
```

**Invariants to preserve:**
- Draft filter at line 27 (`!data.draft`) — NOT touched; already correctly filtering.
- Symmetric precedence with `PresentationCard.astro:12` (same `data.slides ?? /slides/${slug}/` rule).
- Trailing slash present in new URL (`/slides/${slug}/`), matches `PresentationCard.astro`. Old URL had no trailing slash; adding it is intentional for GH Pages directory-serving parity with D-04.

---

### 4. `src/i18n/en.json` + `src/i18n/ru.json` (config, i18n resource, bilingual pair)

**Analog:** self — both files have matching `presentations.subtitle` keys at line 65; the pair is a canonical bilingual invariant across the codebase (see Phase 3 precedent and CLAUDE.md "Bilingual parity" constraint).

**Current shape** (`src/i18n/en.json:63-67`):
```json
  "presentations": {
    "title": "Recent decks",
    "subtitle": "{N} talks · all slides at s.vedmich.dev",
    "all_decks": "All decks"
  },
```

**Current shape** (`src/i18n/ru.json:63-67`):
```json
  "presentations": {
    "title": "Свежие доклады",
    "subtitle": "{N} докладов · все слайды на s.vedmich.dev",
    "all_decks": "Все доклады"
  },
```

**Delta — EN** (line 65 only):
```json
    "subtitle": "{N} talks · all on vedmich.dev/slides",
```

**Delta — RU** (line 65 only):
```json
    "subtitle": "{N} докладов · все на vedmich.dev/slides",
```

**Critical note for planner (per RESEARCH.md Pitfall 1):** D-15 wording says "speaking.subtitle" but the `s.vedmich.dev` string lives in `presentations.subtitle`. `speaking.subtitle` (line 51, "30+ technical deep-dives per year...") does NOT contain a domain and must NOT be edited. Planner instruction to executor: target the `presentations` block at line 65.

**Invariants to preserve:**
- `{N}` placeholder — consumed by `Presentations.astro:21` via `.replace('{N}', String(totalCount))`. Preserve the literal `{N}` token.
- Neighbor keys (`title`, `all_decks`) untouched.
- Both files edited in the same commit to maintain bilingual parity.

---

### 5. `src/content/presentations/{en,ru}/*.md` — 12 files, one-key frontmatter additions

**Analog:** self (all 12 files share an identical frontmatter shape) + `src/content/blog/en/*.md` (draft-field consumer pattern — blog collection already uses `draft: false` in 4 posts).

**Current shape** (representative — `src/content/presentations/en/slurm-prompt-engineering.md`):
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

**Delta** — flip `draft: false` → `draft: true` on ALL 12 files. This is **12 identical edits**, not 12 unique edits. Mechanical repetition — the planner should instruct the executor to treat this as a single logical task with 12 file-targets, not as 12 distinct tasks.

The 12 targets (6 slugs × 2 locales):
```
src/content/presentations/en/slurm-prompt-engineering.md   # draft: false → true
src/content/presentations/en/slurm-ai-demo.md              # draft: false → true
src/content/presentations/en/karpenter-prod.md             # draft: false → true
src/content/presentations/en/eks-multi-az.md               # draft: false → true
src/content/presentations/en/mcp-platform.md               # draft: false → true
src/content/presentations/en/dkt-workflow.md               # draft: false → true
src/content/presentations/ru/slurm-prompt-engineering.md   # draft: false → true
src/content/presentations/ru/slurm-ai-demo.md              # draft: false → true
src/content/presentations/ru/karpenter-prod.md             # draft: false → true
src/content/presentations/ru/eks-multi-az.md               # draft: false → true
src/content/presentations/ru/mcp-platform.md               # draft: false → true
src/content/presentations/ru/dkt-workflow.md               # draft: false → true
```

**Invariants to preserve (per D-03):**
- Do NOT delete any of the 12 files (D-03 preserves frontmatter skeleton for future authoring).
- Preserve `title`, `event`, `city`, `date`, `description`, `tags` fields unchanged.
- `slides:` field stays pointing at `https://s.vedmich.dev/<slug>/` (D-03 skeleton preservation). **Note the Pitfall 8 tension:** D-14's grep check for `s.vedmich.dev` will return hits inside these draft MDX `slides:` fields. Planner must explicitly scope D-14 grep to exclude `src/content/presentations/` OR strip the `slides:` field in the same draft flip. Recommend former (simpler, retains skeleton) — resolve with user if plan hits that question.

**Draft-filter is already in place** (no consumer changes needed):
- `src/components/Presentations.astro:13-15` — `!data.draft` in loader callback
- `src/pages/en/presentations/index.astro:10-12` + `src/pages/ru/presentations/index.astro` (mirror) — `!data.draft`
- `src/data/search-index.ts:26-28` — `!data.draft`
- **No filter code edits needed.** The draft flip alone achieves D-11's intent.

---

### 6. `src/components/Presentations.astro` (optional empty-state addition)

**Analog:** `src/components/BlogPreview.astro:22-59` — sibling homepage preview component that shipped empty-state handling in Phase 03 Plan 02.

**Current shape** (`src/components/Presentations.astro:24-52`) renders an unconditional grid even when `homepageDecks.length === 0`:
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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-on-scroll-stagger">
      {homepageDecks.map((deck) => (
        <PresentationCard deck={deck} />
      ))}
    </div>

    <div class="mt-10 animate-on-scroll">
      <a
        href={`/${locale}/presentations`}
        class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
      >
        {i.presentations.all_decks} →
      </a>
    </div>
  </div>
</section>
```

**Analog pattern to copy** (from `src/components/BlogPreview.astro:22-59`):
```astro
<section id="blog" class="py-20 sm:py-28">
  <div class="max-w-[1120px] mx-auto px-6">
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

    {posts.length > 0 ? (
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-on-scroll-stagger">
        {posts.map((post) => (
          <BlogCard post={post} locale={locale} />
        ))}
      </div>
    ) : (
      <p class="text-text-muted animate-on-scroll">
        {locale === 'ru' ? 'Посты появятся скоро...' : 'Posts coming soon...'}
      </p>
    )}

    {posts.length > 0 && (
      <div class="mt-10 animate-on-scroll">
        <a
          href={`/${locale}/blog`}
          class="text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap"
        >
          {i.blog.all_posts} →
        </a>
      </div>
    )}
  </div>
</section>
```

**Delta for `Presentations.astro`:** wrap the grid + bottom CTA in `{totalCount > 0 ? (...) : (<p>empty-state</p>)}`. Wrap the top-right "All decks" link in `{totalCount > 0 && (...)}`. Inline bilingual empty-state copy (matching BlogPreview):
```astro
<p class="text-text-muted animate-on-scroll">
  {locale === 'ru' ? 'Слайды появятся скоро...' : 'Decks coming soon...'}
</p>
```

**Invariants to preserve:**
- Same CTA class pattern (`text-sm text-text-muted hover:text-brand-primary transition-colors whitespace-nowrap`) — shipped in Phase 03 Plan 02 across Speaking + Blog + Presentations.
- Token-only styling (no hex literals).
- `animate-on-scroll` class on empty-state `<p>` (matches BlogPreview analog).

**Optional vs required:** per CONTEXT.md Claude's Discretion, Claude picks the pattern that matches Blog's empty-state. Recommend **required** because D-11 flips all 6 MDX to draft, so `homepageDecks.length === 0` at phase close — without empty-state handling, the homepage renders a 0-card grid with a subtitle showing "0 talks · all on vedmich.dev/slides" and two orphan "All decks →" links pointing at an equally-empty `/presentations/` index. That's uglier than a clean "Decks coming soon…" message.

---

### 7. `CLAUDE.md` (documentation / project-instructions)

**Analog:** `CLAUDE.md §Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)` at lines 329-338 (within the same file).

**Analog pattern** (`CLAUDE.md:329-338`, verbatim — 10-line block):
```markdown
## Excalidraw Diagram Pipeline — LIVE (since 2026-05-04)

Hand-sketched diagrams ship as build-time-exported static SVGs via `@aldinokemal2104/excalidraw-to-svg@1.1.1`. Source `.excalidraw.json` lives at `diagrams-source/<slug>/`, optimized SVG ships to `public/blog-assets/<slug>/diagrams/*.svg`, embedded via `<figure><img><figcaption>` in bilingual MDX. Zero runtime JS.

Current consumers: MCP post (`2026-03-02-mcp-servers-plainly-explained`) + Karpenter post (`2026-03-20-karpenter-right-sizing`).

**Runbook:** `diagrams-source/README.md`
**Script:** `scripts/excalidraw-to-svg.mjs`
**Tests:** `tests/unit/excalidraw-to-svg.test.ts`
**Boundary invariant:** `@aldinokemal2104/excalidraw-to-svg` is a devDep — never import from `src/`.
```

**Style conventions to copy:**
- H2 heading with status suffix (e.g., `— LIVE (since YYYY-MM-DD)` once the pipeline is shipped; before first real deck migrates, phrasing is "— infrastructure ready, awaiting first deck migration" or similar).
- 1-paragraph summary of the pipeline (what/where/how zero-runtime).
- 1-paragraph current consumers (Phase 5: **none** — whitelist empty).
- Bold-prefixed pointer block (`**Runbook:**`, `**Submodule:**`, `**Skill:**`, `**Boundary invariant:**`).

**Recommended Slidev block content** (to be written by executor, style-matching the Excalidraw analog):
```markdown
## Slidev Integration — INFRASTRUCTURE READY (since 2026-05-07)

Slidev presentation decks ship as pre-built SPA artifacts via git submodule (`vedmichv/slidev:gh-pages`), copied into `dist/slides/<slug>/` at CI time via an explicit-whitelist `cp -r` step in `.github/workflows/deploy.yml`. Zero runtime JS on the main site; `/slides/<slug>/` serves a pre-built Slidev SPA whose internal Vue Router handles intra-deck navigation.

Current `/slides/*` consumers: **none** — whitelist intentionally empty until first deck migrates. The 6 MDX entries in `src/content/presentations/{en,ru}/` are `draft: true` and hidden from homepage + `/presentations/` index.

**Runbook:** `docs/slides-onboarding.md`
**Submodule:** `slidev/` → `vedmichv/slidev:gh-pages` (pinned SHA, bumped via `git submodule update --remote --merge slidev`)
**CI step:** `.github/workflows/deploy.yml` → `Copy Slidev decks to dist/slides` (whitelist commented-out)
**Skill:** `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md`
**Boundary invariant:** `package.json` must NOT depend on `@slidev/cli`, `vue`, or `slidev-theme-*` — decks are pre-built artifacts, never built in main-site CI.
```

**Placement:** per CONTEXT.md §Claude's Discretion — place the new block adjacent to the existing `## Excalidraw Diagram Pipeline` section for thematic grouping. Both are "build-time pipelines ingesting external artifacts" under the project instructions umbrella.

**Existing `s.vedmich.dev` sweep** (per RESEARCH.md Open Question 2 — recommend folding into same CLAUDE.md edit):
- **Line 123:** "Presentations — grid cards linking to s.vedmich.dev Slidev decks" → "Presentations — grid cards linking to `/slides/<slug>/` (future) or optional external URL via frontmatter `slides:` override"
- **Line 270:** "The `slug` must match the Slidev deployment path (e.g. `s.vedmich.dev/<slug>/`)" → "The `slug` must match the internal path (`/slides/<slug>/`) for decks hosted on vedmich.dev, OR the frontmatter `slides:` URL for external-hosted decks"
- **Lines 314-322:** the existing "## Slidev Presentations Integration" section — replace with or fold into the new "## Slidev Integration — INFRASTRUCTURE READY" block.
- **Line 415** (DNS table): `s.vedmich.dev | CNAME | vedmichv.github.io (Slidev presentations, keep)` — update comment to `"(legacy Slidev artifact surface — user-owned closure pending)"` per D-01 + SLIDES-05 deferral.

**Invariants to preserve:**
- Tone: confident, concise, pointer-rich (not tutorial-length).
- No hardcoded hex colors (not relevant here — no styling).
- Bold-prefixed pointer rows stylistically match `§Excalidraw Diagram Pipeline`.

---

### 8. `docs/slides-onboarding.md` (new, runbook)

**Analog:** `diagrams-source/README.md` (118 LOC, 6 H2 sections — well-received pattern per Phase 04.1 Plan 04).

**Analog structure to copy** (from `diagrams-source/README.md` H2 headings):
```
# Excalidraw diagram pipeline
<1-paragraph intro: what ships, status, consumers>

***

## Prerequisites
<deps, version pins, setup command, verify command>

***

## Authoring
<how to create source artifacts, conventions>

***

## Metadata
<required companion files / schema>

***

## Exporting
<CLI command, success output, error codes>

***

## Embedding
<how to wire the artifact into the consuming surface>

***

## Gotchas
<numbered list of edge cases and how to detect/avoid>

***

## Further reading
<links to script, tests, research, related skills>
```

**Delta for `docs/slides-onboarding.md`** (maps to Slidev domain per D-09 + RESEARCH.md "Runbook outline"):
```markdown
# Slidev Deck Onboarding — vedmich.dev/slides/<slug>/

<intro: git-submodule + CI-cp pipeline, zero-runtime on main site, Phase 5 scope>

***

## When to use this flow
<publishing a new deck or re-publishing an existing one under vedmich.dev/slides/>

***

## Prerequisites
<theme repo checked out, vedmichv/slidev checked out on gh-pages, vedmich.dev checked out with submodule initialized>

***

## Step 1: Build the deck with --base /slides/<slug>/
<pnpm slidev build presentations/<slug>/slides.md --base /slides/<slug>/>

***

## Step 2: Publish dist to vedmichv/slidev:gh-pages
<rm -rf <slug> && cp -r ~/Documents/GitHub/vedmichv/slidev-theme-vv/dist <slug>; git commit; git push — ref vv-slidev/references/deployment.md as SSoT for this step>

***

## Step 3: Pump submodule in vedmich.dev
<git submodule update --remote --merge slidev; git add slidev; git commit -m "chore(slides): bump <slug>"; git push>

***

## Step 4: Uncomment slug in .github/workflows/deploy.yml
<one-line edit to whitelist loop>

***

## Step 5: (Optional) Un-draft MDX in src/content/presentations/{en,ru}/<slug>.md
<flip draft: true → false; optionally clear or update `slides:` field>

***

## Step 6: Verify
<npm run build; curl vedmich.dev/slides/<slug>/; navigate to /slides/<slug>/N for Vue Router deep-link>

***

## Gotchas
<1. --base must have trailing slash
 2. Never copy 404.html / CNAME / index.html from slidev/ root
 3. package.json MUST NOT gain @slidev/cli
 4. After branch switch, run git submodule update --init --recursive
 5. The s.vedmich.dev CNAME stays live until user closes it (SLIDES-05 deferred)>

***

## Further reading
<links to vv-slidev skill, Slidev hosting docs, .planning/research/PITFALLS.md, ARCHITECTURE.md>
```

**Target length:** 150-200 LOC (matches `diagrams-source/README.md` at 118 LOC with one more H2 than the Excalidraw runbook).

**Invariants to copy from analog:**
- Triple-asterisk `***` horizontal rules between H2 sections (`diagrams-source/README.md` convention).
- Fenced code blocks for every bash command.
- Bold-prefixed gotcha headers (`**Error: ...`) for recoverable failure modes.
- A "Further reading" tail section cross-linking to skill + research + CLAUDE.md.

---

### 9. `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` (new, skill reference)

**Analog:** `~/.claude/skills/vv-slidev/references/deployment.md` (96 LOC — sibling skill reference covering the slidev-repo side of the flow, 2 Apr 2025).

**Analog shape** (`deployment.md:1-58`):
```markdown
# Deployment — gh-pages

Target: `vedmichv/slidev` repo, `gh-pages` branch (no `main` — this repo is gh-pages-only).

Resulting URL: `https://vedmichv.github.io/slidev/<slug>/`

## Prerequisites

- Theme repo exists: `~/Documents/GitHub/vedmichv/slidev-theme-vv/`
- Deploy target exists: `~/Documents/GitHub/vedmichv/slidev/` (already cloned, already on gh-pages branch)
- Presentation built: `dist/` folder present in theme repo after `pnpm build`

## Full deploy procedure

### 1. Build the presentation with correct base path
<fenced code block>

### 2. Switch to deploy repo
<fenced code block>

### 3. Replace slot
<fenced code block>

### 4. Update root index.html (optional — adds link to landing page)
<fenced code block>

### 5. Commit + push
<fenced code block>

## Troubleshooting
<4 subsections: Assets 404 / Presenter mode / Fonts missing / Custom domain>

## Rollback
<fenced code block>
```

**Delta for `publish-to-vedmich-dev.md`** — per D-10 this is a **SHORT (30-50 LOC) pointer**, NOT a full mirror. Defer the long content to `docs/slides-onboarding.md` as SSoT:
```markdown
# Publishing a deck to vedmich.dev/slides/<slug>/

Short pointer. Full runbook is `docs/slides-onboarding.md` in `vedmichv/vedmich.dev` repo. This file only captures the quick commands; read the docs/ version for context and gotchas.

## TL;DR

1. Build deck with `--base /slides/<slug>/` (trailing slash required).
2. Push built dist to `vedmichv/slidev:gh-pages`.
3. Bump submodule in `vedmich.dev`.
4. Uncomment slug in `.github/workflows/deploy.yml`.
5. Push vedmich.dev — site auto-deploys in ~90s.

## Quick commands

# In slidev-theme-vv (or slidev-theme-slurm, slidev-theme-dkt):
pnpm slidev build presentations/<slug>/slides.md --base /slides/<slug>/

# In vedmichv/slidev (gh-pages branch):
rm -rf <slug> && cp -r ~/Documents/GitHub/vedmichv/slidev-theme-vv/dist <slug>
git add <slug> && git commit -m "deploy: <slug> (N slides)" && git push

# In vedmich.dev (main branch):
git submodule update --remote --merge slidev
git add slidev && git commit -m "chore(slides): bump <slug>"
# Edit .github/workflows/deploy.yml — uncomment `cp -r slidev/<slug> dist/slides/` in the whitelist.
git add .github/workflows/deploy.yml
git commit -m "ci(slides): activate /slides/<slug>/"
git push

## Full workflow

See `docs/slides-onboarding.md` in `vedmichv/vedmich.dev` repo.

## Related skill references

- `references/deployment.md` — the gh-pages side (slidev-theme → vedmichv/slidev)
- `references/architecture-grid.md` — deck authoring in slidev-theme-vv
```

**Invariants to preserve:**
- H1 names the concrete action ("Publishing a deck to vedmich.dev/slides/<slug>/").
- First paragraph declares SSoT elsewhere (prevents skill-vs-docs drift).
- Cross-links to sibling `references/*.md` files at tail.
- 30-50 LOC target (per D-10 — "short pointer, NOT a full mirror").

---

### 10. Vault mirror: `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md`

**Analog:** 1:1 mirror by the `~/.claude/CLAUDE.md §Skill updates — three-way sync` rule.

**Pattern (verbatim from user's global CLAUDE.md):**
```bash
# Correct form — no trailing slash on source:
cp -R ~/.claude/skills/vv-slidev ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/

# OR explicit file path (preferred for single-file updates to avoid clobbering other refs):
cp ~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md \
   ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/
```

**Invariants to preserve (per Pitfall 5):**
- Edit live skill FIRST (`~/.claude/skills/vv-slidev/...`) — that's what Claude loads.
- Mirror to vault SECOND.
- Commit vault with message: `vault backup: skill vv-slidev — add publish-to-vedmich-dev.md reference`.
- Never use `cp -R <src>/ <dst>` with trailing slash on source — dumps contents into dst (macOS gotcha).

---

### 11. `.gitmodules` (new, git metadata)

**Analog:** none in repo — this is a git primitive.

**Expected byte-exact shape after `git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev`** (tab-indented, git default):
```
[submodule "slidev"]
	path = slidev
	url = https://github.com/vedmichv/slidev.git
	branch = gh-pages
```

**Key invariant:** `branch = gh-pages` line MUST be present (per Pitfall 4) — the `-b gh-pages` flag on `git submodule add` writes it. Without it, `git submodule update --remote --merge slidev` follows the remote HEAD instead of the branch, which is fragile.

**Verification commands** (from RESEARCH.md):
```bash
git config -f .gitmodules --get submodule.slidev.branch  # should print: gh-pages
git config -f .gitmodules --get submodule.slidev.url     # should print: https://github.com/vedmichv/slidev.git
git config -f .gitmodules --get submodule.slidev.path    # should print: slidev
git submodule status                                      # should print: <SHA> slidev (heads/gh-pages)
```

---

### 12. Traceability files (`.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`)

**Analog:** self — the checkbox-flip and `status:` pattern shipped during Phase 04.1 close.

**Delta pattern** (from recent commit `e0bed16` "docs(phase-04.1): complete phase execution"):
- `REQUIREMENTS.md`: flip checkboxes on `SLIDES-01`, `SLIDES-02`, `SLIDES-04`, `SLIDES-06`, `CONTENT-04` to `[x]` (shipped); annotate `SLIDES-03` + `SLIDES-05` as `(deferred — Phase 5 D-17)`.
- `ROADMAP.md`: mark `§Phase 5: Slidev Integration` as `✅ Shipped YYYY-MM-DD`.
- `STATE.md`: update current position ("post-Phase-5, awaiting Phase 6 content").

**Invariants:**
- Use same checkbox/emoji style as prior phase closes (grep recent commits for convention).
- Keep English prose even in Russian conversation context (per user's `feedback_gsd_language` memory).

## Shared Patterns

### Bilingual parity (CLAUDE.md invariant)
**Source:** CLAUDE.md §Project Constraints + shipped in every i18n-touching phase (Phases 1-4.1).
**Apply to:** `src/i18n/en.json` + `src/i18n/ru.json` (line 65 in both), `src/content/presentations/en/*.md` + `src/content/presentations/ru/*.md` (6 pairs).
**Rule:** every EN edit has a matching RU edit in the same commit. Phase 5 has 1 i18n pair + 6 MDX pairs = 7 bilingual pairs.

### Token-only styling (CLAUDE.md invariant)
**Source:** CLAUDE.md §Deep Signal Design System.
**Apply to:** `src/components/Presentations.astro` empty-state (if added) — `text-text-muted`, `animate-on-scroll`.
**Rule:** no hex literals. BlogPreview empty-state shipped in Phase 03 Plan 02 with this rule; copy verbatim.

### `data.slides ?? /slides/${slug}/` precedence rule
**Source:** D-04 + D-16 — this phase introduces the rule.
**Apply to:** `src/components/PresentationCard.astro:12` + `src/data/search-index.ts:37`.
**Rule:** frontmatter `slides:` URL wins (enables SpeakerDeck / Notist / external overrides); otherwise compute internal `/slides/<slug>/`. Trailing slash on internal path for GH Pages directory-serving parity.

### Draft-filter already in place (no consumer edits)
**Source:** Phase 3 shipped consumer-side draft filtering across all 4 consumers of `getCollection('presentations')`.
**Apply to:** **none** — this is a documented-invariant pattern, meaning the planner does NOT ask the executor to edit any consumer. The D-11 draft flip is sufficient; every existing consumer already filters `!data.draft`.

### Three-way skill sync
**Source:** `~/.claude/CLAUDE.md §Skill updates — three-way sync`.
**Apply to:** skill reference file creation (D-10).
**Rule:** live → vault mirror → vault commit with specific message. `cp -R <src>/` gotcha warning.

### PR-first publishing workflow (big changes)
**Source:** CLAUDE.md §Publishing Workflow §Big changes.
**Apply to:** entire Phase 5 (touches CI + CLAUDE.md + 12 MDX + skill with vault mirror + new runbook).
**Rule:** feature branch + PR, not push-to-main. Capture before/after CI build time in PR body per D-07 (+5s budget).

## No Analog Found

Files with no close match in the codebase:

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.gitmodules` | git config | — | First submodule in repo; shape dictated by `git submodule add` (byte-exact form documented above). |
| `slidev/` (submodule dir) | external-artifact mount | CI file-I/O | First submodule; content is the `vedmichv/slidev:gh-pages` tree — read-only mirror, never edited from this repo. |

Both have byte-exact/shape-exact specs from the `git-submodule(1)` man page and `actions/checkout@v4` docs — planner should treat these as "follow git's own convention, no creative authorship."

## Pattern Count Summary (for planner scoping)

| Category | Count | Notes |
|----------|-------|-------|
| In-file self-analog edits (surgical) | 6 | `deploy.yml`, `PresentationCard.astro`, `search-index.ts`, `en.json`, `ru.json`, `CLAUDE.md` sweep |
| Sibling-component analog (empty-state) | 1 | `Presentations.astro` copies BlogPreview pattern |
| Mechanical repetition (12 files, 1 key) | 1 logical task | 12 MDX `draft: false → true` flips |
| Skill-analog-driven new file | 1 | `publish-to-vedmich-dev.md` (clones `deployment.md` structure) |
| Runbook-analog-driven new file | 1 | `docs/slides-onboarding.md` (clones `diagrams-source/README.md` structure) |
| Mirror step (no authorship) | 1 | vault mirror of skill reference |
| Git-primitive (no analog) | 2 | `.gitmodules` + `slidev/` submodule |
| Traceability (checkbox flips) | 3 | REQUIREMENTS, ROADMAP, STATE |
| **Total planner actions** | **~16** | Corresponds to ~3-4 plans per RESEARCH.md recommendation |

## Metadata

**Analog search scope:**
- `src/components/` — 4 components read (PresentationCard, Presentations, BlogPreview, index page analog)
- `src/data/` — search-index.ts
- `src/content/presentations/` — 5 sample MDX files from both locales
- `src/content.config.ts` — schema verification
- `src/i18n/en.json` + `src/i18n/ru.json` — i18n pair inspection
- `.github/workflows/deploy.yml` — workflow baseline
- `CLAUDE.md` — style analog (Excalidraw section) + sweep targets
- `diagrams-source/README.md` — runbook genre analog
- `~/.claude/skills/vv-slidev/references/deployment.md` — skill reference analog
- `~/.claude/skills/vv-slidev/` + vault mirror — 3-way sync target inventory

**Files scanned:** 16 (source/config) + 4 (docs/skill analogs) = 20

**Pattern extraction date:** 2026-05-07
