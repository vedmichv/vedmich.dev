---
phase: 5
slug: slidev-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `05-RESEARCH.md` §Validation Architecture (smoke-level scope per D-14).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (Node 25 built-in) for unit tests; `@playwright/test` ^1.59.1 for visual |
| **Config file** | `playwright.config.ts` (visual); none for node:test (pattern in `package.json:11`) |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run test:unit && npm run build` |
| **Estimated runtime** | ~18 s (unit) + ~2 s (build) = ~20 s |

Baseline: **69/69 unit tests green** as of 2026-05-07 17:29 local (verified by researcher).

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit`
- **After every plan wave:** Run `npm run test:unit && npm run build`
- **Before `/gsd-verify-work`:** Full suite green + all smoke grep assertions pass + `git submodule status slidev/` shows initialized checkout
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Req | Behavior | Test Type | Automated Command | File Exists | Status |
|---------|-----|----------|-----------|-------------------|-------------|--------|
| SLIDES-01-a | SLIDES-01 | `.gitmodules` has `branch = gh-pages` | smoke | `test "$(git config -f .gitmodules --get submodule.slidev.branch)" = "gh-pages"` | ❌ W0 creates | ⬜ pending |
| SLIDES-01-b | SLIDES-01 | `actions/checkout@v4` uses `submodules: recursive` | smoke | `grep -A1 'uses: actions/checkout@v4' .github/workflows/deploy.yml \| grep -q 'submodules: recursive'` | ✅ | ⬜ pending |
| SLIDES-01-c | SLIDES-01 | CI has "Copy Slidev decks" step (commented-out whitelist) | smoke | `grep -q 'Copy Slidev decks to dist/slides' .github/workflows/deploy.yml` | ✅ | ⬜ pending |
| SLIDES-02 | SLIDES-02 | Single GH Actions job topology preserved (2 jobs: build + deploy) | smoke | `grep -cE '^  [a-z]+:$' .github/workflows/deploy.yml` returns `2` | ✅ | ⬜ pending |
| SLIDES-03 | SLIDES-03 | **Deferred** (0/6 migrate in Phase 5) | — | — | — | 🟡 deferred |
| SLIDES-04-a | SLIDES-04 | `PresentationCard.astro` emits `/slides/<slug>/` URL | smoke | `grep -q '/slides/\${slug}/' src/components/PresentationCard.astro` | ✅ | ⬜ pending |
| SLIDES-04-b | SLIDES-04 | `search-index.ts` emits `/slides/<slug>/` URL | smoke | `grep -q '/slides/\${slug}/' src/data/search-index.ts` | ✅ | ⬜ pending |
| SLIDES-04-c | SLIDES-04 | All 6 presentations in `en/` + `ru/` set `draft: true` | smoke | `grep -l 'draft: true' src/content/presentations/en/*.md \| wc -l` returns `6` (same for ru/) | ✅ | ⬜ pending |
| SLIDES-04-d | SLIDES-04 | Zero `s.vedmich.dev` in i18n + components + search-index | smoke | `! grep -rn 's\.vedmich\.dev' src/i18n/ src/components/ src/data/` | ✅ | ⬜ pending |
| SLIDES-05 | SLIDES-05 | **Deferred** (user closes manually) | — | — | — | 🟡 deferred |
| SLIDES-06-a | SLIDES-06 | `docs/slides-onboarding.md` exists (≥150 LOC) | smoke | `test $(wc -l < docs/slides-onboarding.md) -ge 150` | ❌ W0 creates | ⬜ pending |
| SLIDES-06-b | SLIDES-06 | `CLAUDE.md` has `## Slidev Integration` H2 | smoke | `grep -q '^## Slidev Integration' CLAUDE.md` | ✅ | ⬜ pending |
| CONTENT-04-a | CONTENT-04 | `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` exists | smoke | `test -f ~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` | ❌ W0 creates | ⬜ pending |
| CONTENT-04-b | CONTENT-04 | Vault mirror exists (3-way sync) | smoke | `test -f ~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md` | ❌ W0 creates | ⬜ pending |
| REG-build | — | `npm run build` exit 0 + `dist/` present | smoke | `npm run build && test -d dist` | ✅ | ⬜ pending |
| REG-tests | — | All 69 existing unit tests still pass | automated | `npm run test:unit` | ✅ | ⬜ pending |
| REG-no-slidev-dep | — | No `@slidev/*`, `vue`, or `slidev-theme-*` leaked into `package.json` | smoke | `! grep -iE '"(@slidev/\|slidev-theme\|^vue)"' package.json` | ✅ | ⬜ pending |
| REG-empty-dist-slides | — | Empty whitelist → `dist/slides/` absent or empty | smoke | `! test -d dist/slides \|\| test -z "$(ls -A dist/slides)"` | ✅ | ⬜ pending |
| BIL-parity | — | i18n edits land in both en + ru | smoke | `grep -q 'vedmich.dev/slides' src/i18n/en.json && grep -q 'vedmich.dev/slides' src/i18n/ru.json` | ✅ | ⬜ pending |

*Status legend: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · 🟡 deferred*

---

## Wave 0 Requirements

- [ ] `.gitmodules` — created by `git submodule add -b gh-pages https://github.com/vedmichv/slidev.git slidev`
- [ ] `slidev/` submodule directory — initialized by the submodule-add above
- [ ] `docs/slides-onboarding.md` — new runbook (≥150 LOC, covers end-to-end deck publishing)
- [ ] `~/.claude/skills/vv-slidev/references/publish-to-vedmich-dev.md` — new skill reference (30-50 LOC pointer)
- [ ] Vault mirror at `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/references/publish-to-vedmich-dev.md` — 3-way sync per CLAUDE.md rule

*No framework install gap — all test infrastructure is in place and green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Submodule pump workflow end-to-end | SLIDES-06 | Requires push to remote slidev repo + vedmich.dev repo; CI deploy observation | Follow `docs/slides-onboarding.md` §"Add a new deck" with a hypothetical slug; verify each step matches actual commands |
| GitHub Pages serves `dist/` after CI green | SLIDES-02 | Requires real deploy to production — can't be asserted locally | Check https://github.com/vedmichv/vedmich.dev/actions after push; deploy job completes ≤5s slower than current ~90s baseline |
| `s.vedmich.dev` 301 redirect | SLIDES-05 | **Deferred** — user closes manually | N/A — out of Phase 5 scope |
| Live `/slides/<slug>/` serving a real deck | SLIDES-03 | **Deferred** — no deck migrates | N/A — belongs in phase that migrates first real deck |

---

## Rationale for Smoke-Level Scope

Phase 5 is **infrastructure-only** per D-01 — it ships the pipeline but migrates zero decks. There is no live `/slides/<slug>/` route to exercise via Playwright. The E2E harness for real-deck serving is explicitly deferred to the phase that migrates the first real deck. Smoke-level validation (grep assertions + build exit code + submodule status + unit test regression) is appropriate for the "empty pipeline" contract this phase ships.

When a deck later migrates, that phase adds a live curl/Playwright harness per the Deferred Ideas list in CONTEXT.md.

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (5 gaps listed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 20 s
- [ ] `nyquist_compliant: true` set in frontmatter (after all tasks pass)

**Approval:** pending
