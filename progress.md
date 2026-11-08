# Site review progress

## 2026-10-03: Discovery

- Started from clean main at 1e4a069.
- Read existing CLAUDE.md, package/configuration, routing, layout, navigation, search, and embed code.
- Retrieved official Codex AGENTS.md discovery documentation.
- Started baseline production build and unit suite.
- Confirmed outdated onboarding instructions and missing CI test gates; investigating locale, metadata, and accessibility defects.

## Baseline and Paseo discovery

- Production build: 38 pages; unit suite: 69 passed; deployment shell suite: 76 passed.
- Browser: confirmed header controls leave the viewport at 768px; missing translation is advertised via hreflang; search lacks combobox semantics and a viewport-height constraint.
- Playwright discovery also imports node:test files because testMatch is not restricted to browser specs.
- npm audit reports 22 dependency findings (2 critical, 18 high, 2 low). Static hosting limits runtime exposure; major-version remediation needs a separate migration assessment.
- Concurrent presentation commit 9d04594 was added and pushed by another session; preserve it.
- Paseo 0.10.3 already registers the project. Read its installed config schema and script environment implementation; no project scripts are configured.

## Implementation and verification

- Preserved concurrent commits 9d04594 and c9f8f81.
- Fixed tablet navigation, missing locale targets, storage-blocked redirects,
  accessible search/focus, narrow book covers, duplicate H1, and 404 recovery.
- Added social image metadata, article dates, a 1200x630 default card, and robots.txt.
- Added 20 browser smoke checks; all passed. Full browser suite passed 29/29.
- Reproduced 8/9 stale screenshot failures on original 9d04594 in an isolated
  worktree. Reviewed comparisons, removed fixed-header interference, waited for
  fonts, refreshed macOS baselines, and verified 9/9 without snapshot updates.
- Clean-worktree setup installed the lockfile, generated Astro types, installed
  compatible Chromium, and built successfully.
- A fresh read-only Codex session loaded AGENTS.md and correctly identified the
  setup, draft-visibility, Slidev, and publishing rules.
- Paseo discovered all seven scripts; dev was healthy and returned HTTP 200
  through its proxy. The workspace was renamed to Site review and worktree setup.
- Site implementation committed locally as 16c1319; no push or deployment.
- Project setup committed as d93365e. A live managed-worktree check revealed that
  numeric per-script ports override the allocator; fixed in f67e4ee.
- Final managed worktree ran setup automatically and had its own node_modules
  and generated Astro types without manual setup. Dev used 4427 and preview 4487;
  main dev used 4470. Both worktree services were healthy, and all three proxy
  URLs returned HTTP 200 while running concurrently.
- Review report includes source-backed findings, retained limitations, and screenshots.
- Verification workspaces were archived, temporary preview processes stopped,
  and the baseline checkout/owned verification branches removed. Main dev remains
  available through Paseo on its allocated port 4470.
- Review complete. Remaining recommendations are documented, not silently
  represented as fixed: dependency migration, type-check tooling, Cyrillic font
  coverage, and a future unified draft/sitemap policy.

## Content proofreading (2026-11-08)

- `main` fast-forwarded 22 commits to `origin/main` (4fd37a5) before any edit.
- Skills repo `~/Github/vedmich/skills` fast-forwarded to `origin/main`; `en-work-writing`
  and `ru-tech-writing` symlinked from `plugins/brand-content/skills/` into
  `~/.claude/skills` and `~/.agents/skills`. The previous standalone
  `ru-tech-writing` copy was moved to `~/.claude/skills-backup/2026-11-08/`.
- The EN scanner needs ripgrep, which is not installed; a scratch shim outside the
  repo points `rg` to the ripgrep bundled with Claude Code. Vale is not installed,
  so the EN scanner reports `vale: NOT_RUN` and uses its ripgrep fallback.
- Nine parallel proofreading units: six blog pairs, the Pod Pending draft plus
  hello-world, talk pages, and deck cards plus UI strings.
- All units reviewed diff by diff; one RU deck-card calque fixed by hand after review.
- Build passed (56 pages). Smoke: 20 passed after `npx playwright install chromium`.
- Visual: 7 of 9 snapshots already failed on clean 4fd37a5 (stale since the October
  rewrites, left untouched); the two hello-world prose snapshots changed by this work
  were inspected (text reflow only) and refreshed.
- Ten content commits (bc63f0e..082e9bd); report in
  `docs/reviews/2026-11-08-content-proofreading.md`. No push.
- Round 2 (Viktor's decisions): seven units fact-checked against primary sources and
  aligned EN/RU; conventions applied for dates, UI casing and cities; Hero pills
  localized. Gateway API v1.7.0 and the Kubernetes log behavior were verified by hand.
- Build, smoke (20) and visual (9, baselines refreshed after inspection) pass.
  A 320px sweep found eight pre-existing overflows, recorded in the report.

## Article improvements and site review (2026-11-08/09)

- Round 3 closed the remaining unverified facts (BOA310 date 27 November 2023 from a
  session report, AWS disclaimers, TLSRoute minimum 1.31, EKS system-node taint).
- Narrow screens: prose tables scroll inside the column, inline code and links wrap,
  long title words hyphenate; 0 of 55 pages overflow at 320 or 390 px.
- Improvement round: all posts polished with both skills; new diagrams (manifests,
  MCP, Karpenter), new demos (MCP, Karpenter x2, Gateway API, latency, Pod Pending,
  RCA), RU latency demos, old dark-on-dark diagrams redrawn, unused PNGs removed.
- Site review report: `docs/reviews/2026-11-09-site-review.md`. Its top finding, the
  broken `<head>`, is fixed. The rest needs Viktor's decisions.
- Posts mirrored to the vault (`40-Content/47-Blog/47.10-Site-Mirror/`) for comments.
- Build, smoke (20), visual (9, baselines refreshed after inspection), unit (69) pass.
