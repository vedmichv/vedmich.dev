---
phase: 09-blog-3-posts-card-format
plan: 02
type: summary
completed_date: "2026-04-26T22:22:46Z"
duration: "~35m"
executor_model: sonnet
subsystem: blog
tags: [blog, skill, vault, qmd, recall, deploy, python, bash]
requirements: [REQ-002]

dependencies:
  requires: [09-01]
  provides:
    - .claude/skills/vv-blog-from-vault/ project-local skill (11 files)
    - vault-search.py with confidential path filter
    - session-recall.py with diary grep fallback
    - deploy-post.sh with CLAUDE.md Post: template + grep gates
    - 5 reference docs (voice, translation, schema, visuals, companions)
    - 2 workflows (new-post 9-step + update-post 5-step)
  affects:
    - Wave 3 content track (ready to author 3 posts via skill invocation)

tech_stack:
  added: []
  patterns:
    - Project-local skill structure (SKILL.md + scripts/ + references/ + workflows/)
    - Python CLI with argparse (vault-search.py, session-recall.py)
    - Bash deployment script with grep gates + GH Actions status report
    - Wave 1 locale-aware author render documented in references/

key_files:
  created:
    - .claude/skills/vv-blog-from-vault/SKILL.md (109 lines)
    - .claude/skills/vv-blog-from-vault/scripts/vault-search.py (124 lines, chmod +x)
    - .claude/skills/vv-blog-from-vault/scripts/session-recall.py (70 lines, chmod +x)
    - .claude/skills/vv-blog-from-vault/scripts/deploy-post.sh (78 lines, chmod +x)
    - .claude/skills/vv-blog-from-vault/references/voice-guide.md (31 lines)
    - .claude/skills/vv-blog-from-vault/references/translation-rules.md (62 lines)
    - .claude/skills/vv-blog-from-vault/references/frontmatter-schema.md (118 lines)
    - .claude/skills/vv-blog-from-vault/references/visuals-routing.md (68 lines)
    - .claude/skills/vv-blog-from-vault/references/companion-sources.md (61 lines)
    - .claude/skills/vv-blog-from-vault/workflows/new-post.md (95 lines)
    - .claude/skills/vv-blog-from-vault/workflows/update-post.md (55 lines)
  modified: []

decisions:
  - SKILL.md does NOT mention playwright — screenshot verification is manual user step per CLAUDE.md "Deployment monitoring" convention
  - deploy-post.sh does NOT call playwright — keeps script simple, no MCP extension token requirement
  - vault-search.py applies confidential post-filter (3 prefixes) before returning any results
  - session-recall.py is Tier-3 fallback; workflows prefer `recall` skill + episodic-memory MCP first
  - Both workflows document manual post-deploy verification — user visits live URL after GH Actions completes
  - RU author-no-override guidance documented in BOTH frontmatter-schema.md AND translation-rules.md (BLOCKER-1 Wave 2 tie-in)
  - deploy-post.sh uses CLAUDE.md content commit template (`Post: <title>`, NO Co-Authored-By trailer) — differs from infrastructure commits

metrics:
  tasks_completed: 4
  commits: 4
  files_created: 11
  build_time_ms: 952
  lines_added: ~870
---

# Phase 09 Plan 02: vv-blog-from-vault Skill — SUMMARY

**One-liner:** Project-local skill that grounds blog drafts in Viktor's Obsidian vault (QMD) and Claude Code session history (recall + episodic-memory), enforces bilingual voice and translation rules, routes visuals (reuse carousel PNGs first), and drives CLAUDE.md publish flow (`Post: <title>` plain commit, push to main, manual screenshot verification).

## What Was Built

Wave 2 skill infrastructure for Phase 9 blog content authoring:

### Task 1: Scaffold + SKILL.md Entry Point (Commit 1b99881)

Created `.claude/skills/vv-blog-from-vault/` directory structure with SKILL.md entry point:
- **Frontmatter**: `name: vv-blog-from-vault`, full description with EN + RU triggers ("write a blog post", "new post about X", "новый пост", "новая статья", "статья из vault", "пост из доклада", "publish post", "deploy post", "blog from vault")
- **6 sections**: Context, Where everything lives, Workflow, Hard rules (12 rows), Delegation targets, References
- **Delegation targets**: mermaid-pro, excalidraw, art, viktor-vedmich-design, recall, sync-claude-sessions (read as source), plus direct MCP tool calls (mcp__qmd__*, episodic-memory)
- **Critical**: does NOT mention playwright — screenshot verification is manual user step after deploy (matches CLAUDE.md "Deployment monitoring" convention)
- **Hard rules table** includes Wave 1 BLOCKER-1 tie-in: "RU posts do NOT need `author:` override — Wave 1 Task 3 RU slug page translates schema-default 'Viktor Vedmich' to 'Виктор Ведмич' at render time"

### Task 2: 3 Executable Scripts (Commit ea83879)

**vault-search.py** (124 lines, Python, chmod +x):
- QMD CLI wrapper with confidential-path post-filter
- `CONFIDENTIAL_PREFIXES` tuple: `10-AWS/11-Active-Clients/`, `10-AWS/14-Tips-AWS-Internal/`, `10-AWS/16-Amazon-Employer/`
- `--check PATH` mode: policy test (returns DENIED or ALLOWED with exit code)
- `--list-excluded` mode: prints 3 prefixes
- Default mode: runs `qmd query <topic> --json`, filters results, emits JSON lines
- Verified: `--check "10-AWS/11-Active-Clients/x.md"` → DENIED, `--check "40-Content/44-Speaking/x.md"` → ALLOWED

**session-recall.py** (70 lines, Python, chmod +x):
- Tier-3 fallback for session grounding (workflows prefer `recall` skill + episodic-memory MCP first)
- Greps `~/Documents/ViktorVedmich/20-Calendar/25-diary/25.70-Claude-Summaries/*.md`
- `--since YYYY-MM-DD` floor, `--limit N` cap
- Case-insensitive substring match, emits `(path, matching_line)` tuples

**deploy-post.sh** (78 lines, bash, chmod +x):
- 7-step pipeline: (1) both locale files exist check, (2) relative-image-path grep gate, (3) `npm run build`, (4) stage EN + RU + assets, (5) commit with `Post: <title>` template (NO Co-Authored-By trailer per CLAUDE.md content-commit convention), (6) push to main, (7) `gh run list` status report
- Grep gate: `grep -rnE '\]\(blog-assets/' src/content/blog/` blocks deploy if relative paths found (Pitfall 5 fix)
- Reports live URLs + deploy latency estimate (~60-90s)
- Final comment: "(Manual verification: visit live URLs in browser after GH Actions completes.)" — does NOT call playwright
- Verified: bash syntax valid, grep gate present, no playwright invocation

### Task 3a: 5 Reference Docs (Commit b5cca7a)

**voice-guide.md** (31 lines):
- Locked voice rules: tech-expert first-person, no AI vocabulary (delve, landscape, tapestry, harness, leverage, etc.), contractions, varied sentence length
- Per-post register notes (D-06): Karpenter 1500-2500 words (deep-dive), MCP 800-1200 words (plainly explained), manifests 700-1000 words (opinion)

**translation-rules.md** (62 lines):
- 10-row locked table: tech terms stay English (Karpenter, MCP server, YAML, kubectl), concepts translate if natural (кластер), code blocks identical, idiomatic mappings ("в продакшне", "в масштабе"/"на масштабе")
- **BLOCKER-1 Wave 1 tie-in** (29 lines): "Do NOT add `author: \"Виктор Ведмич\"` to RU frontmatter. The RU slug page (`src/pages/ru/blog/[...slug].astro`, Wave 1 Task 3) translates the schema-default Latin \"Viktor Vedmich\" to Cyrillic \"Виктор Ведмич\" at render time via a locale-aware `authorDisplay` constant."
- Contains Cyrillic "Виктор Ведмич" string (verified)

**frontmatter-schema.md** (118 lines):
- Mirrors `src/content.config.ts` blog schema post-Wave 1: required fields (title, description, date, tags), optional fields (draft, author default "Viktor Vedmich", reading_time, cover_image)
- **RU author-field note — CRITICAL** (18 lines): documents authorDisplay locale-aware render pattern, explains why to omit `author:` from RU frontmatter, guest-author exception
- 3 D-06 examples (Karpenter / MCP / manifests EN frontmatter) + 1 RU equivalent showing NO `author:` field
- Contains Cyrillic "Виктор Ведмич" string (verified)

**visuals-routing.md** (68 lines):
- Priority 0 (reuse FIRST per D-39): 5-row table mapping topics to vault carousel PNG paths (karpenter-1000-clusters, k8s-interview, s3-security-8point, talk diagrams, DKT visuals)
- Priority 1 (delegate only if Priority 0 yielded nothing): 6-row table mapping content signals to skills (mermaid-pro, excalidraw, art, viktor-vedmich-design)
- Astro rendering notes, asset storage structure, root-absolute path rule, animations deferred (D-40)

**companion-sources.md** (61 lines):
- Vault map: carousels (4 slugs at 45.20-Brand-Kit), talks (2 CFPs at 44-Speaking), podcasts (32-DKT + 15.10-AWS-RU), lessons (37-AI-DevOps-course)
- Placement rule (D-09): "Related" section at end-of-post, never in intro
- Anti-patterns: never confidential client anecdotes, never internal AWS talks

All 5 files ≥ 30 lines (verified). Both frontmatter-schema.md and translation-rules.md contain "Виктор Ведмич" (BLOCKER-1 Wave 2 tie-in verified).

### Task 3b: 2 Workflows (Commit b6f6000)

**new-post.md** (95 lines, 9 steps):
- Step 1: Clarify topic + slug + word-count (propose from voice-guide.md D-06 register)
- Step 2: Vault search (mcp__qmd__query 2-query pattern, wrap with vault-search.py for confidential filter)
- Step 3: Session history (delegate to `recall` skill topic mode; manifests-by-hand = primary grounding per D-04)
- Step 4: Companion link check (scan carousels/talks/podcasts per companion-sources.md)
- Step 5: Draft EN (apply voice-guide.md + frontmatter-schema.md; omit `author:` field)
- Step 6: Translate RU (apply translation-rules.md; **omit** `author:` field — locale-aware render handles Cyrillic)
- Step 7: Visuals audit + routing (Priority 0 reuse carousel PNGs, Priority 1 delegate)
- Step 8: Related section (only if companion exists, append at end per D-09)
- Step 9: Verify + push (run deploy-post.sh → 7-step pipeline, report live URLs, **manual post-deploy verification** note)
- Step counts verified: exactly 9 `## Step [1-9]` headers

**update-post.md** (55 lines, 5 steps):
- Step 1: Identify post (slug or title grep)
- Step 2: Load EN + RU
- Step 3: Apply edits (table with 5 edit kinds: typo, new section, new visual, frontmatter tweak, retract/draft)
- Step 4: Verify build (`npm run build` + grep gate if images touched)
- Step 5: Push (commit `Post: Update <title> — <reason>`, NO Co-Authored-By, **manual post-deploy verification** note)
- Step counts verified: exactly 5 `## Step [1-5]` headers

Both workflows ≥ 30 lines with fenced code blocks (verified). Neither workflow invokes playwright programmatically — only describes manual post-deploy verification matching CLAUDE.md "Deployment monitoring" convention.

## Verification Results

All 12 plan-level verification checks **PASSED**:

```bash
=== Wave 2 Verification Results ===

✓ 1. Directory structure (3 dirs)
✓ 2. SKILL.md triggers (EN + RU)
✓ 3. SKILL.md no playwright
✓ 4. Confidential filter (DENIED + ALLOWED)
✓ 5. Commit template (Post: + no Co-Authored-By in script)
✓ 6. deploy-post.sh no playwright
✓ 7. Image path grep gate present
✓ 8. All 11 files present
✓ 9. Workflow step counts (9 + 5)
✓ 10. BLOCKER-1 tie-in (Виктор Ведмич in 2 files)
✓ 11. Syntax valid (Python + bash)
✓ 12. Build green (npm run build → 25 pages, 952ms)
```

## Commits

1. **1b99881** — `feat(09-02): scaffold vv-blog-from-vault skill entry point`
   - Files: SKILL.md
   - Duration: ~5m

2. **ea83879** — `feat(09-02): skill scripts — vault-search, session-recall, deploy-post`
   - Files: vault-search.py, session-recall.py, deploy-post.sh (all chmod +x)
   - Duration: ~10m

3. **b5cca7a** — `feat(09-02): skill references — voice, translation, schema, visuals, companions`
   - Files: 5 reference markdown files (all ≥ 30 lines, both schema + translation contain "Виктор Ведмич")
   - Duration: ~10m

4. **b6f6000** — `feat(09-02): skill workflows — new-post (9-step) + update-post (5-step)`
   - Files: new-post.md (95 lines, 9 steps), update-post.md (55 lines, 5 steps)
   - Duration: ~10m

Total duration: **~35m**

## Deviations from Plan

None. Plan executed exactly as written. All 4 tasks committed atomically (one per task) with Co-Authored-By trailers (infrastructure commits). SUMMARY.md is task 5.

## Known Stubs

None. All 11 skill files are production-ready with substantive content (total ~870 lines).

## Notes for Wave 3 (Content)

The skill is ready to author 3 posts (Karpenter / MCP / Manifests). Invoke with:
- "new post about Karpenter" (EN) or "новый пост про Karpenter" (RU) — description-trigger match activates skill
- Follow `workflows/new-post.md` 9 steps

**Critical frontmatter guidance** (documented in both frontmatter-schema.md AND translation-rules.md):
- **Do NOT add `author: "Виктор Ведмич"` to RU frontmatter** — the Wave 1 Task 3 RU slug page's `authorDisplay` locale-aware render translates the schema-default Latin "Viktor Vedmich" to Cyrillic "Виктор Ведмич" at render time automatically. Same pattern as existing `hello-world.md` RU post.
- Both EN and RU posts should omit the `author:` field (inherit Latin default; RU slug page translates to Cyrillic at render).

**Per-post source map** (from workflows/new-post.md Step 2):
- Karpenter: carousel at `karpenter-1000-clusters/out/*.png` (7 slides: c01-cover through c07-cta), talk notes at `DOP202-Warsaw-Summit-Speaker-Notes.md`
- MCP: talk notes at `2026-05-06-Warsaw-Summit-MCP-Chalk-Talk.md`, course material at `37-AI-DevOps-course/37.14-Claude-Code/`
- Manifests: primary grounding via `recall` skill topic mode (no vault note per D-04) — flag for user review if <3 grounded experiences surface

**Karpenter post reuse-first** (D-39): Copy carousel PNGs to `public/blog-assets/2026-MM-DD-karpenter-right-sizing/` per visuals-routing.md Priority 0 table. Rename raw filenames (c03-mistake1.png → trap-1-speed.png) for maintainability.

**Deploy + verification pattern**: All 3 posts commit via `deploy-post.sh {slug} "{title}"` → 3 commits total, one per post, each containing EN + RU + any `public/blog-assets/{slug}/` files. Commit message: `Post: <title>` (NO Co-Authored-By trailer per CLAUDE.md content-commit convention). After push + GH Actions completes (~60-90s), user manually verifies live posts at vedmich.dev. deploy-post.sh does NOT call playwright (kept simple per site-wide convention).

## Self-Check: PASSED

**Files created:**
```bash
$ ls .claude/skills/vv-blog-from-vault/
SKILL.md  references/  scripts/  workflows/

$ ls .claude/skills/vv-blog-from-vault/scripts/
deploy-post.sh  session-recall.py  vault-search.py

$ ls .claude/skills/vv-blog-from-vault/references/
companion-sources.md  frontmatter-schema.md  translation-rules.md  visuals-routing.md  voice-guide.md

$ ls .claude/skills/vv-blog-from-vault/workflows/
new-post.md  update-post.md
```

**All 11 files exist**: ✓ FOUND

**Commits exist:**
```bash
$ git log --oneline --no-decorate -4
b6f6000 feat(09-02): skill workflows — new-post (9-step) + update-post (5-step)
b5cca7a feat(09-02): skill references — voice, translation, schema, visuals, companions
ea83879 feat(09-02): skill scripts — vault-search, session-recall, deploy-post
1b99881 feat(09-02): scaffold vv-blog-from-vault skill entry point
```

**4 commits present**: ✓ FOUND

**Confidential filter policy test:**
```bash
$ python3 .claude/skills/vv-blog-from-vault/scripts/vault-search.py --check "10-AWS/11-Active-Clients/x.md"
DENIED

$ python3 .claude/skills/vv-blog-from-vault/scripts/vault-search.py --check "40-Content/44-Speaking/x.md"
ALLOWED
```

**Policy enforcement verified**: ✓ PASS

**BLOCKER-1 Wave 2 tie-in:**
```bash
$ grep -o "Виктор Ведмич" .claude/skills/vv-blog-from-vault/references/frontmatter-schema.md | wc -l
3

$ grep -o "Виктор Ведмич" .claude/skills/vv-blog-from-vault/references/translation-rules.md | wc -l
2
```

**RU author-no-override guidance present**: ✓ PASS (5 occurrences total across 2 files)

**Build green:**
```bash
$ npm run build
[build] 25 page(s) built in 952ms
[build] Complete!
```

**Wave 1 did not regress**: ✓ PASS

All claims verified. Wave 2 skill infrastructure is complete and ready for Wave 3 content authoring.
