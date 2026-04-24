---
phase: 08-presentations-match-card-format
plan: 02
status: complete
completed: 2026-04-24
duration: "inline"
---

# Plan 08-02 Summary — 12 presentation markdown files

## What was built

Migrated all 6 decks from `src/data/social.ts` (presentations array, lines 52-113) to Content Collection markdown files in `src/content/presentations/{en,ru}/`.

**EN files (6):**
- `karpenter-prod.md` — AWS Community Day · Bratislava · 2026-04-19
- `mcp-platform.md` — Code Europe · Krakow · 2026-03-08
- `slurm-prompt-engineering.md` — Slurm AI for DevOps · null · 2026-02-14
- `slurm-ai-demo.md` — Slurm AI for DevOps · null · 2026-01-22
- `eks-multi-az.md` — KubeCon EU · Paris · 2025-11-05
- `dkt-workflow.md` — DevOpsConf · null · 2025-09-18

**RU files (6):** Mirror EN with translated `title` and `description` (Cyrillic), all other fields identical. Filenames (slugs) stay English for URL consistency.

## Key-files

- created (12):
  - src/content/presentations/en/{karpenter-prod,mcp-platform,slurm-prompt-engineering,slurm-ai-demo,eks-multi-az,dkt-workflow}.md
  - src/content/presentations/ru/{karpenter-prod,mcp-platform,slurm-prompt-engineering,slurm-ai-demo,eks-multi-az,dkt-workflow}.md
- modified: (none)

## Decisions

- **3 files per locale have `city: null`** matching D-08: Slurm AI for DevOps × 2 (online course) + DKT workflow (source had `location: 'online'`, normalized to null per UI-SPEC formatting rule).
- **Slug preserved as filename stem** — RU files at `ru/karpenter-prod.md`, not Cyrillic transliteration.
- **Slurm AI Demo title kept English in RU** — it's a product name (course theme showcase).
- **video field omitted** entirely from all 12 files per Phase 7 Plan 2 convention (`z.string().url()` rejects empty string).
- **slides URLs have trailing slash** — `https://s.vedmich.dev/{slug}/` matches current Presentations.astro:35 output convention.

## Verification

| Check | Result |
|---|---|
| `ls -1 src/content/presentations/en/*.md \| wc -l` | 6 |
| `ls -1 src/content/presentations/ru/*.md \| wc -l` | 6 |
| `grep -l "city: null" src/content/presentations/en/*.md \| wc -l` | 3 |
| `grep -l "city: null" src/content/presentations/ru/*.md \| wc -l` | 3 |
| `grep -c "^draft: false" src/content/presentations/**/*.md` | 12/12 |
| `grep -c "^video:" src/content/presentations/**/*.md` | 0 (correctly omitted) |
| `grep -c "^slides: \"https://s\\.vedmich\\.dev/" src/content/presentations/**/*.md` | 12/12 |
| `npm run build` | ✓ 23 pages in 966ms |

## Schema confirmation

`z.string().nullable()` compiled correctly — Zod accepted all 12 files with no "Expected string, received null" errors. This confirms Plan 01's schema choice was correct (`.nullable()` vs `.optional()`).

Build page count unchanged at 23 — Plan 02 adds content files only, no new routes. Plan 03 will create 2 new index pages bringing total to 25.

## Self-Check: PASSED

All acceptance criteria met, all 12 files validate against Plan 01 schema, build green.
