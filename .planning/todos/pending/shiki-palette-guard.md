---
id: shiki-palette-guard
created: 2026-05-03
source: .planning/phases/02-code-block-upgrades/02-REVIEW.md#WR-03
severity: low
effort: 30min
resolves_phase: 03
---

# Shiki github-dark palette guard test

## Why

Phase 2 CSS overrides 8 Shiki-emitted hex colors via attribute selectors:

```css
.prose :is(.shiki, .astro-code) span[style*="color:#F97583" i] {
  color: var(--brand-primary) !important;
}
```

Load-bearing hexes (if Shiki bumps palette silently, override stops matching
and the original github-dark color renders instead — no runtime error):

| Hex         | Token                      | Semantic             |
|-------------|----------------------------|----------------------|
| `#E1E4E8`   | `--text-primary`           | default text         |
| `#F97583`   | `--brand-primary`          | keywords             |
| `#9ECBFF`   | `--brand-accent`           | strings              |
| `#85E89D`   | `--brand-primary`          | yaml keys / markdown |
| `#79B8FF`   | `--brand-primary-hover`    | types / numbers      |
| `#6A737D`   | `--text-muted`             | comments             |
| `#B392F0`   | `--text-primary`           | function names       |
| `#FFAB70`   | `--brand-primary-hover`    | regex / bash numbers |

Existing defenses are soft:
- Astro pinned `^5.18.0` → `shiki@3.21.x` (semver-bound only)
- Playwright visual regression (8 baselines) — catches pixel drift ex post facto
- `i` flag handles case variance (`#F97583` vs `#f97583`)

Missing: a hard assertion that fails **at `npm install` time** if the palette
changed, pointing to the exact commit that introduced the drift.

## What

Add `tests/unit/shiki-palette-guard.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeToHtml } from 'shiki';

// Freeze github-dark palette hexes. If Shiki bumps the theme and one of these
// changes, this test fails fast — forcing us to update src/styles/global.css
// attribute selectors to match the new palette.

test('github-dark keyword color is #F97583', async () => {
  const html = await codeToHtml('const x = 1', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#F97583/i, 'keyword hex drifted — update global.css');
});

test('github-dark string color is #9ECBFF', async () => {
  const html = await codeToHtml('const x = "hello"', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#9ECBFF/i, 'string hex drifted — update global.css');
});

test('github-dark comment color is #6A737D', async () => {
  const html = await codeToHtml('// comment', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#6A737D/i, 'comment hex drifted — update global.css');
});

// ... one test per load-bearing hex (8 total)
```

## When to do

**Trigger:** when about to run `npm update astro` or bump Astro to any new
minor/major version. Add this test as precondition BEFORE the bump so:
1. Test runs against the current (known-good) Shiki → 8/8 pass, commit.
2. Run `npm update astro`, re-run test.
3. If any fail → the new Shiki changed palette. Update the affected
   attribute selector in `src/styles/global.css` to new hex, re-run.
4. Only merge the bump after all 8 pass.

This way the guard is added at the same time as its first real use.

## Estimated effort

30 min total:
- 10 min: write 8 assertions
- 10 min: verify pass on current Shiki 3.21
- 10 min: document in CLAUDE.md § Tests

## Acceptance

- [ ] `tests/unit/shiki-palette-guard.test.ts` exists with 8 tests
- [ ] All tests pass against shiki@3.21.x (current)
- [ ] Test runs in `npm run test:unit` alongside other unit tests
- [ ] CLAUDE.md § Deep Signal Design System notes the guard pattern
