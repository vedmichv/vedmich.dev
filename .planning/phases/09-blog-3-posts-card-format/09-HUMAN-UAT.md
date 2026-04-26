---
status: partial
phase: 09-blog-3-posts-card-format
source: [09-VERIFICATION.md]
started: 2026-04-26T22:45:00Z
updated: 2026-04-26T22:45:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Visual fidelity — BlogCard layout vs reference app.jsx:553-574
expected: 4-row card (date overline mono xs / title text-lg display / description text-sm body / teal tag badges), p-6 padding, gap-5 grid, hover shifts title to teal with card-glow border+shadow. No slug URL row (BlogCard is 4 rows, PresentationCard is 5).
result: [pending]

### 2. Prose quality — voice alignment with D-31 tech-expert register (3 EN posts)
expected: Tech-expert first-person ("I've seen"), contractions, varied sentence length, concrete opening details. NO AI vocabulary (delve, landscape, tapestry, harness, leverage, utilize, pivotal, seamless, groundbreaking, realm, navigate the complexities, at the forefront).
result: [pending]

### 3. RU translation quality — natural Russian with tech terms in Latin per D-30 (3 RU posts)
expected: Natural Russian prose (not machine-translated), tech terms preserved Latin (Karpenter, NodePool, MCP server, YAML, kubectl, Cluster Autoscaler), concepts translated (cluster → кластер, consolidation → консолидация), code blocks byte-identical between EN and RU, headings translated.
result: [pending]

### 4. Manifests post grounding review — professional-experience vs recall/diary (D-48 deviation)
expected: `src/content/blog/en/2026-02-10-why-i-write-kubernetes-manifests-by-hand.md` reflects REAL professional experience. Per 09-03-SUMMARY.md D-48 deviation: diary grep for "manifest/helm/kustomize" yielded 0 hits from 15 diary files; executor wrote post from professional experience instead of halting. User (Viktor) should confirm the post reflects authentic experience, not fabricated opinion.
result: [pending]

### 5. Live deploy verification — all 6 slug pages render correctly on vedmich.dev
expected: After push to main + ~60-90s GH Actions deploy, visit all 6 slug pages (EN+RU × 3 new posts). All render without 404. Bylines: EN "Viktor Vedmich · N min read", RU "Виктор Ведмич · N мин чтения". Teal tag badges. Karpenter: 4 inline images load. Karpenter + MCP: Related section renders.
result: [pending]

### 6. Homepage card hover state — title/border/shadow transitions
expected: Hover any BlogCard → title shifts to teal `#14B8A6`, border becomes teal, card-glow shadow applies. Smooth transition.
result: [pending]

### 7. Commits NOT yet pushed — user verifies locally then pushes manually (D-47 deviation)
expected: Run `npm run preview` at localhost:4321, verify all 6 posts render, then `git push origin main`. Per STATE.md "user prefers sequential execution with visual verification on live after each phase". All 11 commits from Waves 1-3 remain local pending user approval.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

None — all automated must-haves passed (13/13 per VERIFICATION.md). Only human-level checks remain.
