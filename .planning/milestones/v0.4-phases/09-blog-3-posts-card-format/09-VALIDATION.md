---
phase: 09
slug: blog-3-posts-card-format
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build (Zod schema + route compilation) + grep/bash verifications — no unit-test framework installed (none used site-wide) |
| **Config file** | `src/content.config.ts` (Zod), `astro.config.mjs` (markdown/remark), `package.json` scripts |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && grep -rE '#[0-9a-fA-F]{6}' src/components/BlogCard.astro src/components/BlogPreview.astro src/pages/{en,ru}/blog/*.astro \| test $(wc -l) -eq 0` |
| **Estimated runtime** | ~1-2 seconds (build) + <1 second (grep) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run full suite (build + hex-literal grep + i18n key parity grep)
- **Before `/gsd-verify-work`:** Full suite must be green + playwright screenshot at localhost:4321
- **Max feedback latency:** ~3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | REQ-002 | N/A (read-only content surface) | build | `npm run build` | ✅ | ⬜ pending |
| 09-01-02 | 01 | 1 | REQ-002 | N/A | grep | `grep -E '#[0-9a-fA-F]{6}' src/components/BlogCard.astro \| wc -l` → 0 | ✅ | ⬜ pending |
| 09-01-03 | 01 | 1 | REQ-002 | N/A | grep | `test "$(jq -r 'keys[]' src/i18n/en.json \| sort)" = "$(jq -r 'keys[]' src/i18n/ru.json \| sort)"` | ✅ | ⬜ pending |
| 09-01-04 | 01 | 1 | REQ-002 | N/A | build | `npm run build` validates Zod schema extension works with existing hello-world.md | ✅ | ⬜ pending |
| 09-02-01 | 02 | 2 | REQ-002 | Must exclude confidential vault paths | structural | `test -f .claude/skills/vv-blog-from-vault/SKILL.md && grep -q '10-AWS/11-Active-Clients' .claude/skills/vv-blog-from-vault/scripts/vault-search.py` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 2 | REQ-002 | N/A | script exec | `bash -n .claude/skills/vv-blog-from-vault/scripts/deploy-post.sh` (syntax check) | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 3 | REQ-002 | No confidential content leak | file count | `ls src/content/blog/en/*.md \| wc -l` → 4 (hello-world + 3 new) | ❌ W0 | ⬜ pending |
| 09-03-02 | 03 | 3 | REQ-002 | N/A | file count | `ls src/content/blog/ru/*.md \| wc -l` → 4 | ❌ W0 | ⬜ pending |
| 09-03-03 | 03 | 3 | REQ-002 | N/A | build | `npm run build` — all 6 new posts render without Zod errors | ❌ W0 | ⬜ pending |
| 09-03-04 | 03 | 3 | REQ-002 | N/A | route probe | `test -d dist/en/blog/2026-03-20-karpenter-right-sizing && test -d dist/ru/blog/2026-03-20-karpenter-right-sizing` (×3 slugs × 2 locales) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.claude/skills/vv-blog-from-vault/` — skill directory scaffold (Wave 2 creates)
- [ ] `src/content/blog/{en,ru}/2026-03-20-karpenter-right-sizing.md` — karpenter post (Wave 3)
- [ ] `src/content/blog/{en,ru}/2026-03-02-mcp-servers-plainly-explained.md` — MCP post (Wave 3)
- [ ] `src/content/blog/{en,ru}/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` — manifests post (Wave 3)
- [ ] `public/blog-assets/2026-03-20-karpenter-right-sizing/` — copied karpenter carousel PNGs (Wave 3)

No unit-test framework install required — site-wide convention is build + grep verification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card visual match vs ref `app.jsx:553-574` | REQ-002 | Pixel-level visual compare needs human eye | `npm run dev` → screenshot `localhost:4321/en/` blog section at 1440px via playwright-cli, compare to `reference-1440-full.png` |
| Card hover state (title teal shift + card-glow) | REQ-002 | Hover state requires live pointer | Dev server → hover each card → verify title color animates to `#14B8A6` and border/shadow glow activates |
| Both locales render blog posts without regression | REQ-002 | Routing + i18n toggle is user-path | Dev server → navigate `/en/blog/<each-slug>` and `/ru/blog/<each-slug>` → verify both load, Content component renders, tags match EN+RU pair |
| RU translation quality + voice consistency | REQ-002 | Prose quality not grep-able | User reads each RU post → confirms tech-expert first-person voice + D-30 translation rules honored (tech terms EN, concepts RU) |
| Skill workflow end-to-end dry-run | REQ-002 | Agent orchestration not build-verifiable | Manually trigger `vv-blog-from-vault` skill → confirm: vault search finds sources, draft generates, visuals routing suggests correct skill, deploy-post.sh dry-run succeeds |

---

## Validation Sign-Off

- [ ] All tasks have automated verify commands or Wave 0 dependencies
- [ ] Sampling continuity: Wave 1 has build+grep per task; Wave 2 has structural tests; Wave 3 has file-count+build
- [ ] Wave 0 covers all MISSING references (skill scaffold + 6 blog markdown files + asset copies)
- [ ] No watch-mode flags (all commands single-shot)
- [ ] Feedback latency < 3s per task
- [ ] `nyquist_compliant: true` set in frontmatter after planner approval

**Approval:** pending
