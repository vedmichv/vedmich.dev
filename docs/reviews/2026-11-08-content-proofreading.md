# Content proofreading, 2026-11-08

Proofreading of all site content with Viktor's updated writing skills from
`vedmichv/skills`: `en-work-writing` for English and `ru-tech-writing` for Russian.

## Method

- English: `en-work-writing` EDIT of his own public text, level L1 (grammar, calques,
  articles, typography), genre card `genre-public.md`. No polish, no rewrite.
- Russian: `ru-tech-writing` edit mode (faulty spots only). Each published text keeps
  its address (blog posts on «ты», RCA post and Tech Race talks on «вы», short talk
  pages impersonal).
- Hard gates from both skills: fact lock, meaning lock, no U+2014 or U+2013 in prose.
- Facts, numbers, versions, URLs, slugs, code, tags, talk and deck titles were not
  changed. Factual doubts and EN/RU divergences are listed below for Viktor.
- Scanners after the last edit: `quick_scan.sh --channel article --level 1` (EN) and
  `checks.sh --address <ty|vy|none>` (RU). Remaining hits were reviewed and accepted
  with reasons. Vale is not installed, so the EN scanner ran its ripgrep fallback.
- Excluded: `__fixture-syntax-highlighting.md` (test data; it keeps two U+2014).

## Changes

| Unit | EN edits | RU edits | Notable |
|---|---|---|---|
| Manifests by hand | 0 | 4 | one term for `ServiceAccount`; calque «дюжину файлов заготовки» |
| MCP servers | 3 | 2 | comma splice; US date format; «повторного выполнения» |
| Karpenter | 5 | 3 | articles, comma splice; `taint`/`toleration` unified in Latin |
| Gateway API | 4 | 2 | trailing period in H2; "come up with" |
| Latency vs throughput | 3 | 4 | sentence-case title; "liters"; U+2013 in prose |
| RCA agent | 2 | 10 | sentence-case title; «играет роль», «позволяет», «представляет собой»; «аларм» |
| hello-world | 10 | 11 | 14 U+2014 removed; sentence-case headings |
| Pod Pending (draft) | 0 | n/a | no L1 issues; one factual question |
| Talk pages (8 of 30 files) | 4 | 7 | "organized"; U+2013 in date ranges; word order «кластеров Kubernetes» |
| Deck cards and UI strings | 5 | 6 | U+2014 and U+2013 removed; «антипаттерны»; «Не привязанный к вендору» |

Every individual edit, with before and after text and the rule behind it, is in the
commit diffs (`git log --oneline bc63f0e^..082e9bd`).

## Round 2: facts and EN/RU parity

Viktor's decisions after round 1: fix every factual problem against a primary source,
make EN and RU carry the same facts, and apply one set of site conventions. Each
changed fact was checked against an official page, release, or source file.

Facts:

- Pod Pending draft: the round-1 doubt was wrong. For a pod without a node,
  `LogLocation` returns an empty location and no error
  (`pkg/registry/core/pod/strategy.go`, "If pod has not been assigned a host, return
  an empty location"); "does not have a host assigned" belongs to exec, attach and
  port-forward. The post keeps its claim. Fixed instead: `Pending` now means "not
  placed yet" only in this scenario, the scheduler message is broken down by reason
  (not by node), a node that fails a filter drops out, and the embeds quote the real
  plugin messages (`node(s) had untolerated taint(s)`,
  `node(s) didn't match Pod's node affinity/selector`).
- Karpenter: the case study body says the rollout is still in progress, so the
  description now says "is moving". The CPU/memory/GPU sentence is confirmed by the
  EKS Best Practices guide and added to EN. The unrelated Warsaw MCP talk left the
  Related list. PDB is the first lesson, as in the intro. NTH is expanded.
- Gateway API: v1.7.0 shipped on 29 October 2026 (GitHub release) with HTTPRoute
  retries in Standard; the Update note now says so. v1.6 on 30 June 2026 is confirmed
  by the Kubernetes blog.
- hello-world: the "zero JavaScript" claim now describes the real site (static HTML,
  small scripts for search, scroll effects and embeds, content readable without
  JavaScript); the podcast uses its canonical name.
- Latency: the S3 sentence no longer attributes a reason to the S3 docs that they do
  not give.
- Talks: cdk8s and devopsdays use their official spelling; the RCA talk lists
  "access" as the requirement, as the deck and article do; the Tech Race and
  Kubernetes security pages follow the speaker notes and abstracts.
- Deck cards: `slurm-ai-demo` is a demo of the Slurm slide theme, not a course
  overview (deck source).

Parity: every EN/RU divergence listed in round 1 was resolved toward the source.
RU-only notes that only make sense in Russian stay: the latency terminology note and
«Слайды на английском.» on English decks.

Conventions (Viktor, 2026-11-08):

- English dates are day-month-year in prose and in the UI (`en-GB` rendering).
- English UI headings and buttons use sentence case.
- City names are Cyrillic on RU pages and keep diacritics on EN pages.
- The Karpenter RU post keeps Latin `taint`/`toleration`.

Also fixed: the hero pills for the badge and the book were hard-coded in English on
both locales; they now come from `src/i18n`.

## Remaining items

- Narrow screens: at 320px, eight pages scroll horizontally, all predating this work:
  prose tables (MCP EN/RU, latency RU), the long inline code
  `karpenter_pods_startup_duration_seconds` (Karpenter EN/RU), a Gateway code block
  (5px, EN/RU), and the H1 of the RU talk `2026-karpenter-scalability`. Prose CSS fix.
- Hero pills "re:Invent & Keynote Speaker" and "Host · DKT + AWS RU" are English on
  RU pages, and "AWS RU" differs from the canonical "AWS на русском".
- Not verified: Rustem Feyzkhanov's title at re:Invent 2024, the RCA recording
  timestamp, the DevOps Meets event naming, and the "52 slides" count.
- RCA post: no "I work at AWS; this is my own view." clause; the `<video>` has no
  captions. The latency embeds are English-only on the RU page.

## Verification

- Both JSON files parse; no U+2014 or U+2013 remains in content, UI strings or the
  Pod Pending embeds outside the excluded fixture.
- RU `checks.sh` passes on every talk page; the remaining hits in long posts are
  accepted participle adjectives and quotes in HTML attributes. The EN scanner shows
  no new hits in rewritten sentences.
- `npm run build`: 56 pages. `npm run test:smoke`: 20 passed.
- `npm run test:visual`: 9 passed after refreshing all nine baselines. The diffs were
  inspected: text reflow from the October rewrites and this work, and the
  pod-lifecycle heading and caption from 4fd37a5; code blocks keep their styling.
- Rendered pages checked for cities, dates and hero strings; EN and RU home, blog
  index and a talk page at 320px and 1440px show no console errors.

## Limitations

- No live cluster was used for Kubernetes behavior; source code and docs only.
- Local commits only; nothing pushed or deployed.
