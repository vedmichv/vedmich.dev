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

## Open questions for Viktor

Facts (nothing was changed):

1. Pod Pending draft, lines 3, 16, 20, 22: the post says `kubectl logs` on an
   unscheduled pod returns nothing and does not fail. The API server answers
   `BadRequest: pod ... does not have a host assigned`. Checked against Kubernetes
   source, not on a cluster.
2. Karpenter, line 3: the description says Salesforce "moved" the fleet; the body says
   the migration is ongoing. RU line 22 has a sentence about uniform CPU, memory and
   GPU per group that EN lacks. The Related list (line 234) links a Warsaw MCP talk
   dated after the post.
3. Gateway API, line 305: confirm v1.6 (June 30, 2026) is still the latest release.
4. hello-world: "Zero JavaScript by default" is outdated (search, reveals, embeds);
   EN calls the podcast "AWS RU Podcast", the rest of the site "AWS на русском".
5. RCA agent: the post judges AWS services without the "I work at AWS; this is my own
   view." clause; the EN skill only flags it in EDIT. The `<video>` has no captions.

EN/RU divergences (RU adds or drops a detail; choose which side is right):

- Manifests: "identity" dropped in RU line 39; "one of its groups" vs «его группу».
- MCP: «(MRTR)» only in RU line 52; «давно» only in RU line 107.
- Latency: two extra RU paragraphs on terms (26, 28) and several extra RU details
  (63, 147, 168).
- Gateway API: modality differs on line 9; slide vs section on line 17.
- RCA agent: «Слайды на английском.» only in RU line 299; RU line 54 narrows EN.
- Talks: "Lithuania" missing in RU `2026-devops-meets-rca-agent`; extra RU details in
  `2026-techrace-ai-maturity` and `2026-techrace-enterprise-ai-platform`.
- UI and decks: `presentations.*` translates "decks" as «доклады»; "theme" dropped in
  RU `slurm-ai-demo`; "evolving" and "at scale" missing in RU `about.bio_before`.

Site-wide consistency:

- EN date format is mixed: blog posts use "October 5, 2026", talk pages use
  "5 December 2024". Spelling is now American everywhere.
- RCA blog title is now sentence case; the talk and deck titles stay Title Case.
- `en.json` mixes Title Case and sentence case in headings (six Title Case strings).
- Talk files `2026-genai-mcp-systems` and `2026-karpenter-scalability` carry 2026 in
  the slug but date 2025-07-01 (public slugs, not changed).
- `CDK8S` vs `cdk8s`, `DevOpsDays` vs `devopsdays`, `Krakow` vs `Košice` in frontmatter.
- The four latency embeds in `public/embeds/ltb/` are English-only in the RU post.
- `Hero.astro:53` has «» around an English book title, and `Hero.astro:43` reads
  "opens in new tab" without an article (component code, not changed).

## Verification

- Both JSON files parse; no U+2014 or U+2013 remains in content or UI strings
  outside the excluded fixture.
- `npm run build`: 56 pages, no warnings.
- `npm run test:smoke`: 20 passed (after the one-time `npx playwright install chromium`).
- `npm run test:visual`: on clean `4fd37a5`, 7 of 9 were already failing (prose
  baselines of manifests, MCP and Karpenter EN/RU, plus `pod-lifecycle-parity`); these
  baselines predate the October rewrites and were left untouched. This change made
  the two hello-world prose snapshots differ; the diffs show text reflow only and
  were refreshed after inspection.

## Limitations

- Factual claims were not re-verified against external sources.
- No browser walk-through of every page beyond smoke and visual tests.
- Local commits only; nothing pushed or deployed.
