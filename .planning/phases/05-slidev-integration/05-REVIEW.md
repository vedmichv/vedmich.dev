---
phase: 05-slidev-integration
reviewed: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - .github/workflows/deploy.yml
  - .gitmodules
  - CLAUDE.md
  - docs/slides-onboarding.md
  - src/components/PresentationCard.astro
  - src/components/Presentations.astro
  - src/content/presentations/en/dkt-workflow.md
  - src/content/presentations/en/eks-multi-az.md
  - src/content/presentations/en/karpenter-prod.md
  - src/content/presentations/en/mcp-platform.md
  - src/content/presentations/en/slurm-ai-demo.md
  - src/content/presentations/en/slurm-prompt-engineering.md
  - src/content/presentations/ru/dkt-workflow.md
  - src/content/presentations/ru/eks-multi-az.md
  - src/content/presentations/ru/karpenter-prod.md
  - src/content/presentations/ru/mcp-platform.md
  - src/content/presentations/ru/slurm-ai-demo.md
  - src/content/presentations/ru/slurm-prompt-engineering.md
  - src/data/search-index.ts
  - src/i18n/en.json
  - src/i18n/ru.json
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-07
**Depth:** standard
**Files Reviewed:** 20 (+ 1 cross-referenced: `src/components/SearchPalette.astro`)
**Status:** issues_found

## Summary

Phase 5 ships an "infrastructure-only" Slidev integration: a git submodule pinned to `vedmichv/slidev:gh-pages`, a CI copy step with an intentionally-empty whitelist, a URL rewrite from `s.vedmich.dev/<slug>/` → `/slides/<slug>/`, and 12 presentation MDX files flipped to `draft: true` to hide ghost decks. The scaffolding is clean and the decisions log (D-01..D-17) is disciplined.

**Key concerns discovered during review:**

1. The URL rewrite is incomplete at the **consumer** side. `PresentationCard.astro` still carries `target="_blank"` and `SearchPalette.astro`'s inline script still force-opens slide URLs in a new tab via `window.open(..., '_blank')` — both were correct when URLs pointed at an external `s.vedmich.dev`, but are now a same-origin UX regression. When the first real deck lands under `/slides/<slug>/`, it will open in a new tab against the user's expectation for internal navigation.
2. The card's **visible URL string** (`vedmich.dev/slides/<slug>`) and its actual **click target** (`data.slides` override if set) can diverge. With all 12 current MDX files carrying `slides: "https://s.vedmich.dev/<slug>/"` overrides, the card prints one URL and navigates to a completely different one. This is hidden behind `draft: true` today but becomes a trust-breaking bug the moment a deck is un-drafted without removing the `slides:` field.
3. Shell hygiene in the CI whitelist step (`.github/workflows/deploy.yml` line 45-47) uses an unquoted `$slug` — the very glob-expansion attack Gotcha 2 warns against (`cp -r slidev/* dist/slides/`) is one whitelist-typo away from happening by accident.
4. A markdown rendering bug in `docs/slides-onboarding.md:155` (escaped backticks inside an inline code span) will render gibberish to readers on GitHub.

The CI workflow itself is structurally sound: `concurrency: pages` prevents races, the job topology stays 2 jobs (SLIDES-02 preserved), submodule checkout uses `submodules: recursive` per D-02, and the empty whitelist means `dist/slides/` ships empty today. No hardcoded secrets, no hex leaks, no dead imports detected.

## Critical Issues

### CR-01: Internal `/slides/` URL force-opens in new tab (UX regression)

**File:** `src/components/PresentationCard.astro:20-24`
**Issue:** After the D-04 URL rewrite, `deckUrl` resolves to a relative path (`/slides/${slug}/`) when `data.slides` is absent. The anchor tag, however, still carries `target="_blank" rel="noopener noreferrer"` — unchanged from the pre-rewrite era when every URL was external (`https://s.vedmich.dev/...`). Result: internal navigation to `/slides/<slug>/` pops a new browser tab instead of following in-place, which breaks back-button UX and pushes visitors into tab-graveyard territory. Internal same-origin links should not force `_blank`; reserve that only for external URLs.

Expected behavior: decide `target` based on whether the resolved URL is same-origin or external.

**Fix:**
```astro
---
// existing prelude
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = data.slides ?? `/slides/${slug}/`;
const displayUrl = `vedmich.dev/slides/${slug}`;

// NEW: detect external vs. internal
const isExternal = /^https?:\/\//.test(deckUrl);

const dateStr = data.date.toISOString().slice(0, 10);
const overlineParts = [dateStr, data.event, data.city].filter(Boolean);
---

<a
  href={deckUrl}
  target={isExternal ? '_blank' : undefined}
  rel={isExternal ? 'noopener noreferrer' : undefined}
  class="group flex flex-col p-6 rounded-xl bg-surface border border-border card-glow animate-on-scroll"
>
```

### CR-02: Search palette opens internal slides URL in new tab

**File:** `src/components/SearchPalette.astro:241-246` (line referenced via `data/search-index.ts:37` consumer)
**Issue:** Parallel bug to CR-01. The search palette's click handler always force-opens `kind === 'slides'` results via `window.open(url, '_blank', 'noopener,noreferrer')`. This matched the pre-rewrite world where every slide URL was an external domain. After the D-16 rewrite (`search-index.ts:37`), slide URLs are relative (`/slides/<slug>/`) in the fallback path — the palette now spawns a new tab for same-origin navigation. Posts use `window.location.href = item.url` (same-origin navigation) — slides should follow the same pattern when the URL is same-origin.

**Fix:**
```typescript
function go(item: SearchItem): void {
  const isExternal = /^https?:\/\//.test(item.url);
  if (item.kind === 'slides' && isExternal) {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = item.url;
  }
  close();
}
```

Note: this file is outside the Phase 5 `files:` scope but is a direct consumer of `search-index.ts` and inherits the bug. Surfacing it here because the same root-cause fix (external-vs-internal detection) applies to both CR-01 and CR-02; they should be fixed together or the inconsistency spreads.

### CR-03: `displayUrl` lies when `data.slides` override is set

**File:** `src/components/PresentationCard.astro:13, 42-44`
**Issue:** Row 4 of the card always renders `displayUrl = \`vedmich.dev/slides/${slug}\`` (line 13), but `deckUrl` (line 12) prefers `data.slides` when present. For all 12 current MDX files (`slides: "https://s.vedmich.dev/<slug>/"`), the card displays `vedmich.dev/slides/karpenter-prod` but a click navigates to `https://s.vedmich.dev/karpenter-prod/`. The user sees one destination and lands on another — classic trust-breaking UI.

Today this is hidden behind `draft: true` on all 12 files (D-11), but the bug becomes live the moment someone un-drafts a deck without removing the `slides:` override — a scenario CLAUDE.md line 270 and `docs/slides-onboarding.md` Step 5 explicitly permit ("Keeping the field, pointing at an external URL like SpeakerDeck/Notist, is valid too").

**Fix:**
```astro
---
const slug = id.replace(/^(en|ru)\//, '');
const deckUrl = data.slides ?? `/slides/${slug}/`;
// Derive display from actual deckUrl, not from a hardcoded assumption:
const isExternal = /^https?:\/\//.test(deckUrl);
const displayUrl = isExternal
  ? deckUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  : `vedmich.dev/slides/${slug}`;
---
```

## Warnings

### WR-01: Unquoted shell variable in CI whitelist loop

**File:** `.github/workflows/deploy.yml:45-47`
**Issue:** The commented-out template uses `cp -r slidev/$slug dist/slides/` with `$slug` unquoted. If a future activator accidentally writes `for slug in *` (or introduces a slug with a wildcard character — e.g. pasting from a different shell), the unquoted expansion silently morphs into `cp -r slidev/* dist/slides/` — the exact anti-pattern Gotcha 2 in `docs/slides-onboarding.md` spends a paragraph warning against (would leak `CNAME`, `404.html`, root `index.html` into `dist/slides/`). Quote the variable as a defense-in-depth measure — it costs nothing and closes the glob-expansion hole before the whitelist goes live.

**Fix:**
```yaml
- name: Copy Slidev decks to dist/slides
  run: |
    mkdir -p dist/slides
    # Whitelist — uncomment a line as each deck migrates to vedmich.dev/slides/<slug>/.
    # for slug in slurm-prompt-engineering slurm-ai-demo; do
    #   cp -r "slidev/$slug" "dist/slides/"
    # done
```

Also add `set -euo pipefail` at the top of the block or convert the loop to an explicit per-deck line (`cp -r slidev/karpenter-prod dist/slides/`) which is equivalent and even more greppable per the D-05 "predictable and greppable" rationale.

### WR-02: Dead-link landmine — ghost decks point to unbuilt `s.vedmich.dev` slugs

**File:** `src/content/presentations/{en,ru}/{dkt-workflow,eks-multi-az,karpenter-prod,mcp-platform}.md:8`
**Issue:** Four of the six ghost decks carry `slides: "https://s.vedmich.dev/<slug>/"` frontmatter pointing at deck paths that don't exist on the gh-pages artifact repo today (CONTEXT.md D-01: "only 2 of 6 slugs have live builds"). These specific 4 slugs — `dkt-workflow`, `eks-multi-az`, `karpenter-prod`, `mcp-platform` — have no corresponding folder in `vedmichv/slidev:gh-pages`. A manual verification during review confirmed the local submodule checkout at `slidev/` contains only `slurm-ai-demo/` and `slurm-prompt-engineering/`.

Today this is hidden behind `draft: true`. But `docs/slides-onboarding.md:145-155` Step 5 describes un-drafting as "a single line-9 edit from `draft: true` to `draft: false`" and then optionally removing the `slides:` field. If an author un-drafts without removing the field, the presentation page (and search index) will expose a link to a 404. The runbook's Step 5 makes "remove `slides:`" look truly optional rather than "required for ghost slugs that were never built at s.vedmich.dev".

**Fix (runbook):** strengthen Step 5 in `docs/slides-onboarding.md` to say:

> If the frontmatter `slides:` field currently points at `https://s.vedmich.dev/<slug>/` AND that URL returns 404 today (four ghost slugs: `dkt-workflow`, `eks-multi-az`, `karpenter-prod`, `mcp-platform`), you MUST remove the field — leaving it in place ships a dead link. For the two live-at-s.vedmich.dev slugs (`slurm-ai-demo`, `slurm-prompt-engineering`) the existing URL still works, so removing the field is optional.

**Fix (safer alternative):** drop `slides:` frontmatter from all 4 ghost decks now while they're `draft: true` — preserves them as pure skeletons (per D-03) with no dead link risk if prematurely un-drafted. The 2 slurm decks retain the field since their s.vedmich.dev URLs still resolve.

### WR-03: `z.string().url()` schema forbids relative slide overrides

**File:** `src/content.config.ts:43` (cross-referenced from review scope)
**Issue:** Schema declares `slides: z.string().url().optional()`. The `.url()` refinement rejects relative paths like `/slides/other-slug/`. This blocks the legitimate use case of "point this card at a different internal `/slides/` path that doesn't match the slug" — e.g. redirecting a legacy slug to a renamed deck. Today this doesn't matter (the fallback handles the same-slug case); flagging as WARNING for the Phase 5 author to decide whether to loosen to `z.string().optional()` or keep `.url()` intentional.

The PresentationCard's `data.slides ?? \`/slides/${slug}/\`` logic doesn't care — it passes whatever string through to `href`. Astro's generated HTML happily emits relative paths. Only the schema gatekeeps.

**Fix (if loosening is desired):**
```typescript
slides: z.string().optional(),
```

Alternatively, leave as-is and document the constraint in the runbook. No runtime bug today, but a usability tax for future authors.

### WR-04: Astro glob pattern mismatch with content.config

**File:** `src/content.config.ts:35`
**Issue:** The presentations collection uses `pattern: '**/*.md'` (not `.{md,mdx}` like blog). If a future author creates `src/content/presentations/en/foo.mdx`, it will be silently ignored by `getCollection('presentations')` — no error, just missing from the homepage and search index. Blog uses `.{md,mdx}` for exactly this reason. Either unify patterns or document the constraint.

**Fix:**
```typescript
const presentations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/presentations' }),
  // rest unchanged
});
```

Same issue in the `speaking` collection at line 19 (outside Phase 5 scope but identical bug). If Phase 5 touches the config file, fix both while pens are out.

### WR-05: Runbook Step 6 `cp -r` trailing-slash hazard

**File:** `docs/slides-onboarding.md:172`
**Issue:** Step 6's local preview command is:
```bash
mkdir -p dist/slides && cp -r slidev/<slug> dist/slides/
```
This is correct (no trailing slash on source) — but CLAUDE.md line 210 explicitly documents that `cp -R` / `cp -r` with a trailing slash on the source has the opposite effect. The user's own rule. If someone pastes `cp -r slidev/<slug>/ dist/slides/` (trailing slash on source — a common copy-paste error from shell completion), they'll dump the deck's contents directly into `dist/slides/` (no `<slug>/` subdir, everything collides). Worth a one-line callout in the runbook referencing the CLAUDE.md rule, or at minimum mirror the exact explicit-file form CLAUDE.md recommends.

**Fix:** append a one-line warning after the `cp -r` command:
> Note: do NOT add a trailing slash to the source (`slidev/<slug>/`) — per CLAUDE.md "Three-way sync" rule, `cp -R` with trailing slash copies contents into the destination, collapsing the slug directory. Keep the source path terminal-char-free.

## Info

### IN-01: Markdown rendering bug — escaped backticks inside inline code span

**File:** `docs/slides-onboarding.md:155`
**Issue:** The inline code span `` `data.slides ?? \`/slides/${slug}/\`` `` uses backslash-escaped backticks. Markdown does not honor backslash-escapes inside a single-backtick inline code span — the parser sees:
- Opening backtick
- `data.slides ?? \` (closing backtick; the `\` is literal text in most renderers, invisible in others)
- Then `/slides/${slug}/\`` is rendered as plain prose, with `${slug}` shown literally and a stray backtick at the end.

GitHub's CommonMark renderer will show gibberish here. The correct form uses double-backtick fencing when the content contains a backtick:

**Fix:**
```markdown
Optionally remove the `slides:` field from frontmatter — with the field absent, `PresentationCard.astro` falls back to the computed `/slides/<slug>/` path via the ``data.slides ?? `/slides/${slug}/` `` precedence rule in the component.
```

Or (simpler) rephrase to avoid needing a nested backtick:
```markdown
…falls back to the computed `/slides/<slug>/` path via the `data.slides ??` precedence rule (see `src/components/PresentationCard.astro:12`).
```

### IN-02: Stale CLAUDE.md line 270 implies s.vedmich.dev is always fresh

**File:** `CLAUDE.md:270`
**Issue:** Line 270 reads:
> The `slug` must match the internal path (`/slides/<slug>/`) for decks hosted on vedmich.dev, OR the frontmatter `slides:` URL for external-hosted decks (SpeakerDeck, Notist, or the legacy `s.vedmich.dev` surface during the transition).

This lumps "legacy `s.vedmich.dev`" with "external-hosted decks (SpeakerDeck, Notist)" — but the gh-pages artifact repo behind `s.vedmich.dev` is the same source-of-truth that vedmich.dev's submodule consumes. There's no real "external" separation; `s.vedmich.dev` is just a view of the same artifacts. Minor doc smell, not a correctness issue. Consider reframing as "an overriding URL when a deck is hosted somewhere other than `/slides/`" without dragging SpeakerDeck and Notist into the sentence (neither is actually used by any current deck).

**Fix:** Minor rewording — not load-bearing.

### IN-03: Subtitle claims "all on vedmich.dev/slides" while whitelist is empty

**File:** `src/i18n/{en,ru}.json:65`
**Issue:** New subtitle reads `"{N} talks · all on vedmich.dev/slides"` — aspirational but untrue on ship day. With all 12 MDX files `draft: true` (D-11), `{N}` = 0 and the Presentations section renders the empty-state path (`locale === 'ru' ? 'Слайды появятся скоро...' : 'Decks coming soon...'` in `Presentations.astro:59`), so the subtitle never actually renders today. Once decks get un-drafted, the first un-drafted deck will — per WR-02 — likely point back at `s.vedmich.dev` via the `slides:` frontmatter override, not at `vedmich.dev/slides/`. The subtitle's truth-value then depends on the author cleanly removing the `slides:` field per Step 5.

Not a bug today (never rendered when N=0), but if a hybrid state emerges (e.g. 2 decks un-drafted, both still pointing at `s.vedmich.dev`), the subtitle lies. Consider rewording to something that's true regardless of hosting surface — e.g. `"{N} conference talks · slide decks & videos"`.

**Fix:** consider either:
- Leaving as-is and accepting that the subtitle only becomes accurate after the runbook's Step 5 is followed faithfully, or
- Decoupling subtitle wording from hosting surface entirely.

---

_Reviewed: 2026-05-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
