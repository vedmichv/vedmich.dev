---
phase: 03-section-order-about
plan: 01
status: complete
completed: 2026-04-19
files_changed:
  - src/i18n/en.json
  - src/i18n/ru.json
---

# Plan 03-01 — i18n key split (EN + RU) — SUMMARY

## What changed

Split the single-string `about.bio` key into three translator-friendly keys
(`bio_before`, `bio_accent`, `bio_after`) and removed the now-obsolete
`about.certs_title` key in both locales. The accent string stays English-verbatim
in both locales per D-07.

## Final EN strings

```json
"about": {
  "title": "About Me",
  "bio_before": "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Expertise"
}
```

Reconstructed sentence (EN):
> Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of «Cracking the Kubernetes Interview».

## Final RU strings

```json
"about": {
  "title": "Обо мне",
  "bio_before": "Solutions Architect и AI Engineer с 15+ годами опыта в проектировании распределённых систем. Работаю в AWS, веду сквозную архитектуру для enterprise-клиентов: hybrid cloud, Kubernetes, GenAI и agentic-платформы. CNCF Kubernaut и автор книги ",
  "bio_accent": "«Cracking the Kubernetes Interview»",
  "bio_after": ".",
  "skills_title": "Экспертиза"
}
```

Reconstructed sentence (RU):
> Solutions Architect и AI Engineer с 15+ годами опыта в проектировании распределённых систем. Работаю в AWS, веду сквозную архитектуру для enterprise-клиентов: hybrid cloud, Kubernetes, GenAI и agentic-платформы. CNCF Kubernaut и автор книги «Cracking the Kubernetes Interview».

## Key removals

- `about.bio` — removed from both files.
- `about.certs_title` — removed from both files (no longer referenced after 03-03).

## Verification

- `node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'))"` → exit 0.
- `node -e "JSON.parse(require('fs').readFileSync('src/i18n/ru.json','utf8'))"` → exit 0.
- EN key shape asserted via inline node script: `bio_before`, `bio_accent === '«Cracking the Kubernetes Interview»'`, `bio_after === '.'`, no `bio`, no `certs_title`.
- RU key shape asserted similarly; `skills_title === 'Экспертиза'`.
- Reconstructed sentences in both locales read naturally.

## Build note

`npm run build` NOT run for this plan — About.astro still references
`i.about.bio` and `i.about.certs_title` until Plan 03-03 lands. The phase-level
build gate happens at the end of 03-02 (Task 4) and again at the end of 03-03
(Task 2). If Astro fast-fails on the missing key at build time (it typically
defers JSON typed access to runtime), that becomes visible in 03-02 Task 4.

## Commit

Not committed — Phase 3 uses a single atomic commit spanning all three plans,
applied after the 03-03 user visual-verify checkpoint (per CLAUDE.md §Publishing
Workflow).
