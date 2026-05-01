---
status: resolved
phase: 09-blog-3-posts-card-format
source: [09-VERIFICATION.md]
started: 2026-04-26T22:45:00Z
updated: 2026-05-01T12:35:00Z
---

## Current Test

[all tests approved by user]

## Tests

### 1. Visual fidelity — BlogCard layout vs reference app.jsx:553-574
expected: 4-row card (date overline mono xs / title text-lg display / description text-sm body / teal tag badges), p-6 padding, gap-5 grid, hover shifts title to teal with card-glow border+shadow. No slug URL row (BlogCard is 4 rows, PresentationCard is 5).
result: pass — user approved live 2026-05-01 after visual check on vedmich.dev

### 2. Prose quality — voice alignment with D-31 tech-expert register (3 EN posts)
expected: Tech-expert first-person ("I've seen"), contractions, varied sentence length, concrete opening details. NO AI vocabulary (delve, landscape, tapestry, harness, leverage, utilize, pivotal, seamless, groundbreaking, realm, navigate the complexities, at the forefront).
result: pass — user approved 2026-05-01

### 3. RU translation quality — natural Russian with tech terms in Latin per D-30 (3 RU posts)
expected: Natural Russian prose (not machine-translated), tech terms preserved Latin (Karpenter, NodePool, MCP server, YAML, kubectl, Cluster Autoscaler), concepts translated (cluster → кластер, consolidation → консолидация), code blocks byte-identical between EN and RU, headings translated.
result: pass — user approved 2026-05-01

### 4. Manifests post grounding review — professional-experience vs recall/diary (D-48 deviation)
expected: `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` reflects REAL professional experience. Per 09-03-SUMMARY.md D-48 deviation: diary grep for "manifest/helm/kustomize" yielded 0 hits from 15 diary files; executor wrote post from professional experience instead of halting. User (Viktor) should confirm the post reflects authentic experience, not fabricated opinion.
result: pass — user approved 2026-05-01; any prose corrections can happen via later `Post: Update <title>` commits

### 5. Live deploy verification — all 6 slug pages render correctly on vedmich.dev
expected: After push to main + ~60-90s GH Actions deploy, visit all 6 slug pages (EN+RU × 3 new posts). All render without 404. Bylines: EN "Viktor Vedmich · N min read", RU "Виктор Ведмич · N мин чтения". Teal tag badges. Karpenter: 4 inline images load. Karpenter + MCP: Related section renders.
result: pass — pushed 2026-04-26 in commit bundle, GH Actions deploy succeeded; 2 post-ship hotfixes landed 2026-05-01: `72208f1` nav anchor routing, `2f1fb54` language switcher preserves path, `34dea78` blog code-copy + SMIL packets. All 6 slug pages verified live.

### 6. Homepage card hover state — title/border/shadow transitions
expected: Hover any BlogCard → title shifts to teal `#14B8A6`, border becomes teal, card-glow shadow applies. Smooth transition.
result: pass — user approved 2026-05-01

### 7. Commits NOT yet pushed — user verifies locally then pushes manually (D-47 deviation)
expected: Run `npm run preview` at localhost:4321, verify all 6 posts render, then `git push origin main`. Per STATE.md "user prefers sequential execution with visual verification on live after each phase". All 11 commits from Waves 1-3 remain local pending user approval.
result: pass — user authorized push on 2026-04-26; all Phase 9 commits now live, plus 3 post-ship hotfixes + Phase 9 rich-media experiment (PodLifecycleAnimation + CodeCopyEnhancer in Karpenter post, commits `665c1be`, `34dea78`).

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None.

## Post-resolution notes

- Karpenter post now has an embedded Slidev-ported animation (`PodLifecycleAnimation.astro`) and a copy-to-clipboard button on code blocks. Those are experiments on top of Phase 9 scope; the broader pipeline for lifting Slidev/Excalidraw/carousel content into MDX posts is deferred to a new milestone (v0.5 — Content Platform) per `.planning/notes/rich-media-integration.md`.
- D-48 deviation stays recorded: the manifests post was written from professional-experience grounding rather than diary-recall grounding. User approved as-is.
