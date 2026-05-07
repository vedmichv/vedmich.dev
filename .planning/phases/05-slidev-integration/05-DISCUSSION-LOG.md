# Phase 5: Slidev Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 5-Slidev Integration
**Areas discussed:** Gray-area selection, s.vedmich.dev disposition, Ghost-deck sources, Slurm-deck scope, Submodule topology, Ghost MDX handling, URL routing strategy, CI copy strategy, Submodule update pump, Build-time target, Onboarding sources location, Runbook location, vv-slidev skill scope, Slidev base-path reality check, 404.html handling, Slurm MDX status, Submodule with empty whitelist, Verification level, i18n subtitle

---

## Gray area selection (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| Ghost decks (4 of 6) | karpenter/dkt-workflow/mcp-platform/eks-multi-az — decide fate | ✓ |
| Submodule topology | vedmichv/slidev branch choice + CI copy + pump | ✓ |
| s.vedmich.dev → redirect | how to handle 301 + meta-refresh + Worker options | |
| Onboarding workflow | docs location + sources + skill reference | ✓ |
| **Other (free-form)** | "Надо просто перетащить слайды из прошлого на новый. Я поэтому не выделаили редиктр я хочу в целом закрыть s.vedmich.dev — или ты думаешь это плохая идея???? Подскажи какие плюсы минус" | ✓ |

**User's choice:** Ghost decks + Submodule topology + Onboarding + opened discussion on closing s.vedmich.dev
**Notes:** The "close s.vedmich.dev entirely" question became its own sub-discussion before moving into scoped areas.

---

## s.vedmich.dev disposition

| Option | Description | Selected |
|--------|-------------|----------|
| JS-redirect on gh-pages (Recommended) | Rewrite gh-pages `index.html` + `404.html` with `window.location.replace('vedmich.dev/slides' + pathname)`. ~15 min, zero maintenance, preserves CNAME. | |
| Close entirely | Delete CNAME from vedmichv/slidev, disable GH Pages. Clean but breaks external backlinks (DKT/AWS podcast descriptions, LinkedIn posts, CFP pages). | |
| Leave as-is | Two-domain parallel — SEO duplicate risk. | ✓ |

**User's choice:** Leave as-is — "3 и я потом закрою сам"
**Notes:** Phase 5 does NOT modify s.vedmich.dev, DNS, or `vedmichv/slidev:gh-pages` root-level files. User retains control over the closure timeline. SLIDES-05 becomes a deferred idea (not a Phase 5 deliverable).

---

## Ghost-deck sources

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, sources exist | User has Slidev `.md` files locally/in repos — will point to them | ✓ |
| No, MDX placeholders only | Delete 4 MDX entries, migrate only 2 existing decks | |
| Partial | Some have sources, some don't — discuss per-deck | |

**User's choice:** "Да, есть исходники" → later clarified: "/Users/viktor/Documents/GitHub — по идее должно быть где-то тут найди плиз"
**Notes:** Claude searched `~/Documents/GitHub/` (maxdepth 5, both Slidev frontmatter pattern and directory name matches) and found Slidev sources only for `slurm-*`, `dkt-95-k8s-rbac`, `claude-code-lesson-*`, and `prompt-engineering` — none matching the 4 ghost slugs (`karpenter-prod`, `eks-multi-az`, `mcp-platform`, `dkt-workflow`). Vault search in `15.31-Talks-Materials/` also returned no hits by slug. Reported this back to user.

---

## DKT deck migration

| Option | Description | Selected |
|--------|-------------|----------|
| No, only Viktor decks | DKT-AI/slidev stays separate — different brand, different subdomain | ✓ |
| Yes, migrate DKT too | Scope expands beyond 6 slugs in content/presentations/ | |

**User's choice:** "Нет, только Viktor-декá"
**Notes:** DKT-AI/slidev and its `dkt-ai.github.io/slidev/` domain remain untouched. `dkt-workflow` slug in `src/content/presentations/` is Viktor's personal talk about podcast workflow, NOT DKT-brand content.

---

## Ghost-deck handling (after source search)

| Option | Description | Selected |
|--------|-------------|----------|
| Delete MDX, migrate 2 real | Drop 4 placeholder MDX, migrate slurm-* to vedmich.dev/slides/ | |
| Search for sources harder | Claude to keep searching | |
| Keep MDX, add draft:true | Preserve skeleton, hide from homepage until content ready | |

**User's choice (clarifying message):** "не так slurm деки мы не будем мигрировать это тоже отедьная история - мы скорее будет делать загрушки пока рядом есть репа где мы сейачас"
**Notes:** User redirected scope — Slurm migration is a separate task, Phase 5 delivers infrastructure-only. Claude offered two interpretations (A: pipeline-only, B: placeholder Coming-soon decks) to resolve ambiguity.

---

## Phase 5 scope interpretation (A vs B)

| Option | Description | Selected |
|--------|-------------|----------|
| A: Pipeline only, 2 decks auto-migrate as bonus | submodule + CI + onboarding; 2 existing slurm decks auto-serve under /slides/ via submodule | ✓ |
| B: Placeholder decks for all 6 slugs | Ship 1-slide Coming-soon decks so no card 404s on vedmich.dev | |
| Other | Free-text | |

**User's choice:** A
**Notes:** This became the anchor decision D-01 for the phase. Later in the discussion, option A was further narrowed when the base-path reality check revealed the 2 existing decks can't auto-serve without a rebuild (D-11).

---

## Submodule branch

| Option | Description | Selected |
|--------|-------------|----------|
| Submodule on gh-pages branch (Recommended) | `git submodule add -b gh-pages` — takes artifact branch directly | ✓ |
| Submodule pinned to SHA | Classic submodule — more reproducible, but requires manual SHA bump | |
| actions/checkout with submodules: true | Orthogonal to branch choice — convenient CI flag | |

**User's choice:** Submodule on gh-pages branch (Recommended)
**Notes:** `vedmichv/slidev` default-branch is already `gh-pages` (confirmed via `gh repo view`). No refactor to the slidev repo needed.

---

## Ghost MDX handling

| Option | Description | Selected |
|--------|-------------|----------|
| draft:true in MDX (Recommended) | Add `draft: true` to 4×2=8 files; skeleton preserved | ✓ |
| Delete 8 MDX files | Cleaner repo; recoverable from git history | |
| Leave as-is | Cards 404 until s.vedmich.dev closes manually | |

**User's choice:** draft:true (Recommended)
**Notes:** Applied to 8 ghost MDX initially; scope later widened to 12 (all 6 × 2 locales) when Slurm MDX also got draft:true per D-11.

---

## URL rewrite strategy in PresentationCard

| Option | Description | Selected |
|--------|-------------|----------|
| Slug→href logic in PresentationCard (Recommended) | `const deckUrl = \`/slides/${slug}/\``; drop frontmatter `slides:` or make optional | ✓ |
| Update frontmatter in each MDX | sed s/s.vedmich.dev/\/slides/ in 2×2 MDX; card reads `data.slides` | |
| Canonical-aware | Prefer `data.slides` if set, else compute `/slides/${slug}/` | |

**User's choice:** Slug→href in PresentationCard (Recommended)
**Notes:** Frontmatter `slides:` field becomes optional override (for external hosts like SpeakerDeck) but default is `/slides/${slug}/`.

---

## CI copy strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Whitelist directories (explicit cp) | `for slug in <list>; do cp -r slidev/$slug dist/slides/; done` | ✓ |
| Auto-discover (loop over slidev/) | Pick up any deck dir automatically | |
| manifest.json in slidev repo | Cross-repo contract of deck slugs | |

**User's choice:** Whitelist (explicit)
**Notes:** Predictable and greppable. Adding a deck = edit workflow file. In Phase 5, whitelist is commented out (no decks migrate) per D-12.

---

## Submodule pump strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Manual pump + commit | `git submodule update --remote --merge slidev && git commit` after slidev push | ✓ |
| CI auto-pulls --remote | `git submodule update --init --recursive --remote` in deploy.yml — but needs a trigger | |
| Webhook from slidev → vedmich.dev | `repository_dispatch` on slidev push triggers vedmich.dev redeploy | |

**User's choice:** Manual pump (Recommended)
**Notes:** Explicit, controllable publish timing. Covered by onboarding runbook.

---

## Build time target

| Option | Description | Selected |
|--------|-------------|----------|
| Max +5s (Recommended) | Submodule checkout + cp ~5s | ✓ |
| Max +30s | If repository_dispatch or --remote fetch is added | |
| Not important | Correctness only | |

**User's choice:** Max +5s
**Notes:** Empty whitelist in Phase 5 = +2s (submodule init only). Budget has room for future decks.

---

## Onboarding sources location

| Option | Description | Selected |
|--------|-------------|----------|
| Keep source/dist split (Recommended) | Sources in theme repos (slurm/vv/dkt), dist in slidev repo | ✓ |
| Consolidate in vedmichv/slidev main branch | All .md sources + themes in one repo | |
| Document both options | Runbook covers (A) theme-repo, (B) standalone Slidev project | |

**User's choice:** Keep as-is
**Notes:** Phase 5 does not restructure Slidev repos. Runbook documents current reality.

---

## Runbook location

| Option | Description | Selected |
|--------|-------------|----------|
| docs/slides-onboarding.md (per REQUIREMENTS) | New docs/ directory in vedmich.dev | |
| CLAUDE.md section only | ~400-line CLAUDE.md gets longer | |
| Both: docs/ + pointer in CLAUDE.md | Full runbook + short CLAUDE.md hint | ✓ |

**User's choice:** Both
**Notes:** Two-surface pattern — full content in docs/, quick lookup in CLAUDE.md. Best of both (SEO + AI session discoverability + depth).

---

## vv-slidev skill scope

| Option | Description | Selected |
|--------|-------------|----------|
| Pointer to docs/slides-onboarding.md (Recommended) | Short (30-50 LOC) reference + quick commands; 3-way-sync required | ✓ |
| Full mirror of docs | Self-contained skill, drift risk | |
| AI-specific patterns | Skill describes AI workflow, docs describes human workflow | |

**User's choice:** Pointer
**Notes:** Reduces drift risk. Three-way-sync to vault backup enforced per CLAUDE.md rule.

---

## Additional gray-area selection (multi-select round 2)

| Option | Description | Selected |
|--------|-------------|----------|
| Slidev base-path strategy | Existing decks built with `--base /<slug>/` — won't work under `/slides/<slug>/` | ✓ |
| i18n strings + search-index | en.json/ru.json subtitle + search-index.ts URL builder | ✓ |
| Verification plan (curl/Playwright) | How to prove Phase 5 works without real decks | ✓ |
| GH Pages SPA routing gotcha | 404.html redirect logic + deep-link support | ✓ |

**User's choice:** All 4
**Notes:** Full sweep requested.

---

## Slidev base-path strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Rebuild slurm in theme repo + push (Recommended) | `slidev build --base /slides/<slug>/` in slidev-theme-slurm, push to slidev:gh-pages | |
| Dual versions | Keep both `/<slug>/` (old) and `/slides/<slug>/` (new) dist dirs | |
| CI rewrite hack | sed HTML/CSS references in dist — fragile, can't touch bundled JS | |

**User's choice (free-form):** "Точно не надо деки со slurm на мой сайт нести"
**Notes:** User explicitly scoped Slurm decks OUT of Phase 5. Rebuild + migrate becomes a separate user-driven task. This cascaded into D-11 (all 6 MDX draft:true) and D-12 (empty CI whitelist).

---

## 404.html fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Don't touch (Recommended) | Only copy `<slug>/` dirs; don't bundle root 404.html from slidev | |
| Adapt 404.html for /slides/<slug>/ | Fix path-depth math for new routing | |
| Verify in practice | Deploy without; add if deep links break | ✓ |

**User's choice:** Verify in practice
**Notes:** Since no real deck migrates, there's nothing to verify in Phase 5. Deferred to first real migration (captured as deferred idea).

---

## Slurm MDX in content/presentations

| Option | Description | Selected |
|--------|-------------|----------|
| draft:true for all 6 (Recommended) | Consistent with ghost handling; homepage section stays pipeline-clean | ✓ |
| Keep 2 slurm visible with slides:=https://s.vedmich.dev/ | MDX `slides:` field as per-entry override for external URLs | |
| Delete 2 slurm MDX | Aggressive; 2 decks live only at s.vedmich.dev | |

**User's choice:** draft:true
**Notes:** Presentations section on homepage will be empty after Phase 5 until first real deck migrates. Acceptable trade-off for clean scope.

---

## Submodule with empty whitelist

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, connect now (Recommended) | Pipeline + submodule landed; CI copy step commented-out list | ✓ |
| No, submodule later | Phase 5 = docs + MDX drafts + URL pattern only | |
| Yes, with placeholder deck | Ship 1-slide Coming-soon deck under `--base /slides/demo/` | |

**User's choice:** Yes, connect now
**Notes:** Submodule value is forward-looking infrastructure. Pipeline proven (empty whitelist ≈ 2s CI overhead), activated by uncommenting when first deck migrates.

---

## Verification level

| Option | Description | Selected |
|--------|-------------|----------|
| Smoke (Recommended) | Build green + grep assertions + submodule status + runbook exists | ✓ |
| Full E2E | Demo deck + Playwright + curl against live | |
| None | Just deploy-green | |

**User's choice:** Smoke
**Notes:** No real deck to E2E-test. Smoke is appropriate for the scope.

---

## i18n subtitle

| Option | Description | Selected |
|--------|-------------|----------|
| Remove domain in subtitle (Recommended) | "... · all on vedmich.dev/slides" | ✓ |
| Remove domain mention entirely | "... · keynotes & community decks" | |
| Leave as-is | Accurate as long as slurm decks on s.vedmich.dev | |

**User's choice:** Remove domain
**Notes:** Bilingual parity — both `en.json` and `ru.json` updated simultaneously.

---

## Proceed to CONTEXT.md

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, write CONTEXT.md (Recommended) | 15 decisions captured — sufficient for planning | ✓ |
| Discuss more | Additional gray areas remain | |

**User's choice:** Yes
**Notes:** Proceeded to write_context step.

---

## Claude's Discretion

- **Exact 3-way-sync vault path for vv-slidev skill** — Claude follows CLAUDE.md rule unaided: `~/Documents/ViktorVedmich/80-Resources/85-Scripts/85.20-Claude-Code/skills/vv-slidev/`.
- **CI checkout flag** — `actions/checkout@v4 with: submodules: recursive` (vs. separate `git submodule update --init` step) — chosen for cleanliness per ARCHITECTURE.md Option A.
- **Homepage empty-state UX when `Presentations.astro` has 0 non-draft entries** — follow existing blog empty-state pattern (hide section or show minimal message; shipped in Phase 03 Plan 02 for Blog).
- **CLAUDE.md Slidev block formatting + placement** — match tone/shape of existing `### Excalidraw Diagram Pipeline` block (short, scannable, points to runbook).
- **Test count target after Phase 5** — likely stays at 69 unless new tests are added (D-14 is config-level, not behavior-level). Plan phase to decide whether a unit test on PresentationCard URL computation is worth one new test case.

## Deferred Ideas

- **SLIDES-05 (s.vedmich.dev 301 redirect):** user handles manually; JS-redirect option pre-discussed for future reference.
- **Slurm deck migration:** rebuild with `--base /slides/<slug>/`, CI whitelist activation, submodule bump.
- **Ghost-deck content authoring:** karpenter-prod, eks-multi-az, mcp-platform, dkt-workflow actual Slidev sources + builds.
- **Live `/slides/` E2E verification harness:** Playwright + curl scripts for the first real deck migration.
- **GH Pages 404.html custom fallback:** test + ship if SPA deep links break after first migration.
- **Companion posts linking `/slides/<slug>/`:** Phase 6 dependency (CONTENT-01/02/03).
