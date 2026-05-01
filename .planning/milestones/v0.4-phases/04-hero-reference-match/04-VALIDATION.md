---
phase: 4
slug: hero-reference-match
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during Hero rewrite.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build (static SSG) + playwright-cli (visual + computed-style verification) |
| **Config file** | `astro.config.mjs`, `playwright.config.ts` (if absent, use attached Chrome via playwright-cli MCP) |
| **Quick run command** | `npm run build` (~90s) |
| **Full suite command** | `npm run build && npx playwright-cli verify --viewport=1440x900 --url=http://localhost:4321/en/` |
| **Estimated runtime** | Build ~90s · computed-style sampling ~30s per viewport |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (exits 0)
- **After every plan wave:** Run build + playwright computed-style sampling (EN + RU, 1440×900 + 375px)
- **Before `/gsd-verify-work`:** Full suite must be green + visual diff vs `reference-1440-full.png` within tolerance
- **Max feedback latency:** ~2 minutes (build + sample)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | REQ-013 | — | N/A (i18n keys are static strings) | static | `grep -q '"tagline_before"' src/i18n/en.json && grep -q '"tagline_accent"' src/i18n/en.json` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | REQ-013 | — | N/A | static | `grep -q '"tagline_before"' src/i18n/ru.json && grep -q '"tagline_accent"' src/i18n/ru.json` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | — (factology) | — | N/A | static | `grep -q 'Kubestronaut' src/data/social.ts && ! grep -q 'Kubernaut' src/data/social.ts` | ✅ | ⬜ pending |
| 04-01-04 | 01 | 1 | — (factology) | — | N/A | static | `! grep -rn 'Kubernaut' src/i18n/ src/layouts/ CLAUDE.md` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | REQ-013 | — | N/A | static | `grep -q 'grad-hero-flat' src/styles/design-tokens.css` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | REQ-011, REQ-013 | T-04-01 (external pill) | `rel="noopener"` on external link | static | `grep -q 'href="https://www.cncf.io/training/kubestronaut/"' src/components/Hero.astro && grep -q 'rel="noopener"' src/components/Hero.astro` | ✅ | ⬜ pending |
| 04-02-03 | 02 | 2 | REQ-013 | — | N/A | static | `grep -q 'text-\\[clamp(40px,8vw,64px)\\]' src/components/Hero.astro` | ✅ | ⬜ pending |
| 04-02-04 | 02 | 2 | REQ-014 | — | N/A (visual) | computed | Playwright: `getComputedStyle(h1).fontSize === "64px"` at 1440×900, height <= 560px | ✅ | ⬜ pending |
| 04-02-05 | 02 | 2 | REQ-011 | — | N/A | static | Hero has 4 `<a>` pills with correct href values | ✅ | ⬜ pending |
| 04-03-01 | 03 | 2 | REQ-011 | — | N/A | runtime | Playwright: scroll past `#about` → `header a[href="#about"].is-active` exists | ✅ | ⬜ pending |
| 04-03-02 | 03 | 2 | — | — | N/A | static | `! grep -n 'typing-cursor' src/styles/global.css` (after cleanup) | ✅ | ⬜ pending |
| 04-03-03 | 03 | 2 | REQ-014 | — | N/A | build | `npm run build` exits 0, 7 pages built | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Existing infrastructure (Astro build + playwright-cli attached to Chrome) covers all phase requirements.
- [ ] Verify `https://www.cncf.io/training/kubestronaut/` resolves (A1 from research) — curl HEAD check or playwright navigate before locking pill href.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero "feels like a pitch" | REQ-011 (qualitative) | Subjective UX — "make people want to hire/buy" | Visual review by user on live vedmich.dev after deploy |
| Pill wrap ordering at 900-1100px | — (claude's discretion) | Browser-specific wrap behavior | Test EN + RU at 1100px, 900px; if Kubestronaut wraps to row 2, reorder |
| Gradient banding visible without noise | D-13 | Requires monitor + human eye | Visually confirm `.noise-overlay` suppresses banding on 520px height gradient |
| Nav underline animation feels smooth | D-09 | Subjective motion feel | Scroll top→bottom + bottom→top on live, confirm no jitter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Kubestronaut URL check)
- [ ] No watch-mode flags (use `npm run build`, not `npm run dev`)
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after planner finalizes task IDs

**Approval:** pending
