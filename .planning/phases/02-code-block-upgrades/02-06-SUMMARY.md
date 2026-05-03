---
plan: 02-06
phase: 02-code-block-upgrades
status: complete
completed: 2026-05-03
requirements: [CODE-01, CODE-02, CODE-03, CODE-04, CODE-05]
---

# Plan 02-06 — Phase 2 Closeout

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Re-capture 8 post-Phase-2 baselines + gate green | ✓ complete |
| 2 | Human-verify checkpoint (visual + Copy UX sign-off) | ✓ approved (production check) |
| 3 | Restore Astro caret `5.18.0` → `^5.18.0` per D-09 | ✓ complete |

## Outcomes

**Baseline re-capture** (Task 1):
- `tests/visual/shiki-regression.spec.ts-snapshots/` — 8 PNGs (Playwright gate source of truth)
- `.planning/phases/02-code-block-upgrades/baselines/` — 8 PNGs (phase-artifacts mirror, byte-identical)
- Fence-bearing posts (mcp-servers × 2 locales, karpenter × 2 locales) → 4 baselines updated with Deep Signal palette + language badge + icon-only Copy button
- Fenceless posts (hello-world × 2, why-i-write × 2 locales) → 4 baselines unchanged (no `.shiki` output to restyle)
- `npx playwright test tests/visual/shiki-regression.spec.ts` → 8/8 pass green against fresh baselines

**Cache invalidation gotcha:**
Initial `--update-snapshots` run after Phase 2 reported 8 passed without diff because existing `.astro/` build cache served stale pre-phase hast. Resolved by `rm -rf .astro node_modules/.astro dist` before re-capture. Documented in Plan 02-03 Deviation #4 as well. Future baseline re-captures in Phase 3+ must include cache clear first.

**Human verification** (Task 2):
Sign-off elected by the user as "deploy to production and verify there" — Phase 2 changes pushed to `main`, GH Actions deploys to vedmich.dev for live confirmation. Automated gates (build 32 pages, unit 27/27, playwright 8/8, zero deprecated cyan in source + dist) all green before push.

**Caret restore** (Task 3):
- `package.json`: `"astro": "5.18.0"` → `"astro": "^5.18.0"` (1-char diff)
- Lockfile unchanged — installed 5.18.0 still satisfies `^5.18.0`
- `npm ls astro` → `astro@5.18.0 deduped` (no version churn)

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | 32 pages, no errors, 2.45s |
| `npm run test:unit` | 27/27 pass |
| `npx playwright test tests/visual/shiki-regression.spec.ts` | 8/8 pass |
| `grep -r '#06B6D4\|#22D3EE' src/ dist/` (excluding node_modules) | empty |
| `grep '"astro":' package.json` | `"astro": "^5.18.0",` |
| Baselines byte-identical across `shiki-regression.spec.ts-snapshots/` and `.planning/.../baselines/` | confirmed via `diff -qr` |

## Phase 2 delivery summary

| Req | Deliverable | Status |
|-----|-------------|--------|
| CODE-01 | Language badge (top-left pill inside `<figure class="code-block">`, JetBrains Mono uppercase) | ✓ |
| CODE-02 | `// [!code highlight]` + `# [!code highlight]` via `@shikijs/transformers@^3.23.0` → teal border-left + soft teal bg | ✓ |
| CODE-03 | `// [!code ++]` / `// [!code --]` → green / red bg + `+` / `−` gutter glyphs | ✓ |
| CODE-04 | Deep Signal theme via 8 attribute-selector overrides on github-dark — teal keywords, amber strings, `#0D1117` bg, `.prose`-scoped | ✓ |
| CODE-05 | CodeCopyEnhancer icon-only-at-rest + label-on-hover, singleton `#code-copy-toast` in BaseLayout with `aria-live="polite"`, bilingual EN/RU labels | ✓ |

## Phase 2 commit count

30 commits on `main` (02-01 through 02-06, each task atomic, plus 6 merge commits).

## Next

Phase 2 complete. Ready to move to Phase 3.
