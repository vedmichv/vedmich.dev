---
phase: 2
slug: code-block-upgrades
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from RESEARCH.md §Q7 Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright `^1.59.1` (installed, Phase 1 legacy) + Node's built-in `node --test --experimental-strip-types` for unit tests |
| **Config file** | `playwright.config.ts` (exists, Phase 1) + `package.json` scripts (`test`, `test:unit`) |
| **Quick run command** | `npm run test:unit` (unit, ~1s) |
| **Full suite command** | `npm run test` + `npm run test:unit` (Playwright visual + unit, ~60–90s) |
| **Estimated runtime** | ~1s quick / ~90s full |

---

## Sampling Rate

- **After every task commit:** `npm run build` + `npm run test:unit` (build-pass + unit ~1s)
- **After every plan wave:** `npm run test` (full Playwright suite) + manual audit on `npm run preview` for one post per locale
- **Before `/gsd-verify-work`:** Full suite green + 8 screenshot-diffs green + manual audit clean
- **Max feedback latency:** ~1s quick, ~90s full

---

## Per-Task Verification Map

Task IDs are placeholders until the planner finalizes PLAN.md files. Rows are keyed to REQ-ID → test surface derived from RESEARCH.md Q7.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | W0 | 0 | — | — | Wave 0 infrastructure | bootstrap | `npm run build` | N/A | ⬜ pending |
| 02-W0-02 | W0 | 0 | — | — | Wave 0 unit test scaffold | bootstrap | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 02-W0-03 | W0 | 0 | CODE-05 | — | Baseline screenshots captured (8 PNGs) | visual baseline | `npx playwright test tests/visual/shiki-regression.spec.ts --update-snapshots` | ❌ W0 | ⬜ pending |
| 02-XX-01 | XX | 1+ | CODE-01 | — | Language badge present (`<figure.code-block>` + `<span.code-lang-badge>`) | unit (DOM) | `node --experimental-strip-types --test tests/unit/rehype-code-badge.test.ts` | ❌ W0 | ⬜ pending |
| 02-XX-02 | XX | 1+ | CODE-01 | — | Badge text matches fence language (`yaml`, `bash`, `ts`) | unit + visual | same unit + Playwright screenshot | ❌ W0 | ⬜ pending |
| 02-XX-03 | XX | 1+ | CODE-02 | — | `// [!code highlight]` emits `<span class="line highlighted">` + `.has-highlighted` on `<pre>` | integration (build-artifact grep) | `npm run build && grep -l 'has-highlighted' dist/en/blog/**/index.html` | ❌ W0 | ⬜ pending |
| 02-XX-04 | XX | 1+ | CODE-02 | — | Highlighted line visually distinct (border-left 2px brand-primary + brand-primary-soft ~10–12% bg) | visual | `npx playwright test tests/visual/shiki-regression.spec.ts --grep highlight` | ❌ W0 | ⬜ pending |
| 02-XX-05 | XX | 1+ | CODE-03 | — | `// [!code ++]` / `// [!code --]` emit `<span class="line diff add">` / `diff remove` | integration | `npm run build && grep -l 'diff add' dist/en/blog/**/index.html` | ❌ W0 | ⬜ pending |
| 02-XX-06 | XX | 1+ | CODE-03 | — | Diff lines show success/error tint + `+` / `−` gutter glyphs | visual | `npx playwright test --grep diff` | ❌ W0 | ⬜ pending |
| 02-XX-07 | XX | 1+ | CODE-04 | — | Shiki tokens use Deep Signal colors via attribute-selector + `!important` | visual + manual | Playwright diff + DevTools computed-styles audit | ❌ W0 | ⬜ pending |
| 02-XX-08 | XX | 1+ | CODE-04 | — | No deprecated cyan (`#06B6D4` / `#22D3EE`) in rendered CSS | grep check | `npm run build && grep -r '06B6D4\|22D3EE' dist/` returns empty | ❌ W0 | ⬜ pending |
| 02-XX-09 | XX | Final | CODE-05 | — | Copy button works on all 4 posts (clipboard API + textarea fallback) | manual | `npm run preview` → each post → click Copy → verify clipboard | manual-only | ⬜ pending |
| 02-XX-10 | XX | Final | CODE-05 | — | Copy fires aria-live toast announcement | Playwright a11y | `page.getByRole('status').textContent()` after click | ❌ W0 | ⬜ pending |
| 02-XX-11 | XX | Final | CODE-05 | — | Bilingual parity — identical behavior on `/en/` + `/ru/` | visual | Playwright diff × 2 locales = 8 screenshots | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

The planner MUST replace `XX` placeholders with concrete plan IDs (e.g. `02-01-01`) when PLAN.md files are finalized.

---

## Wave 0 Requirements

- [ ] `tests/unit/rehype-code-badge.test.ts` — unit test for the new `rehype-code-badge.mjs` plugin. Feeds a hast tree, asserts `<figure class="code-block">` wrap + `<span class="code-lang-badge">` with correct text.
- [ ] `tests/visual/shiki-regression.spec.ts` — 8 Playwright screenshot tests (4 posts × 2 locales), using the same `maxDiffPixels` / `maxDiffPixelRatio` pattern as `tests/visual/pod-lifecycle-parity.spec.ts`.
- [ ] `.planning/phases/02-code-block-upgrades/baselines/` — directory with 8 pre-change baseline PNGs (captured BEFORE any Shiki config change).
- [ ] `src/content/blog/en/__fixture-syntax-highlighting.md` (optional, `draft: true`) — fixture post exercising highlight + diff on yaml, bash, typescript, dockerfile so transformer coverage is verified end-to-end.

*Framework install:* not needed — `@playwright/test` + `node --test` both installed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Copy button clipboard write succeeds across browsers | CODE-05 | Clipboard API permission prompts vary by browser + test-env support for clipboard is flaky | `npm run preview` → open each of the 4 blog posts in Chrome + Safari → click Copy on each code block → paste into a text editor → verify content matches |
| Badge visual weight at rest vs hover | CODE-01 | Subjective — "JetBrains Mono uppercase small-caps, ~11px, text-muted → text-primary on hover" is design intent, not unit-testable | On `/en/blog/karpenter-right-sizing/`, hover a code block; confirm badge color transitions from `text-muted` to `text-primary` smoothly in ~120ms |
| Toast slide-in/fade-out feel | CODE-05 | Animation curve is a feel-judgement; researchers picked ranges (120-180ms in, 200-260ms out, ~2s total) | Click Copy → watch toast appear top-right, linger ~2s, fade; confirm `prefers-reduced-motion: reduce` disables transitions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (4 artifacts + 8 baselines)
- [ ] No watch-mode flags in any command
- [ ] Feedback latency < 90s for full suite (measured in Phase 1 as ~60-90s)
- [ ] `nyquist_compliant: true` set in frontmatter after planner locks task IDs

**Approval:** pending
