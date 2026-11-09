# Site review decisions

- Preserve Astro static output, bilingual routes, Deep Signal tokens, and the prebuilt Slidev boundary.
- Add no dependencies or framework migrations in this review.
- Preserve the intentional public-but-unlisted blog draft model; drafts are not confidential.
- Make AGENTS.md the canonical concise project instructions; keep detailed runbooks in docs.
- Keep repository artifacts in English and user-facing conversation in Russian.
- Separate source/build/browser evidence from production acceptance. Do not push or deploy as part of this review.
- Keep Node 22 aligned with existing CI. Defer the Astro/MDX major migration and
  dependency-advisory remediation to a focused compatibility change.
- Use Paseo's repository-level schema and lifecycle scripts. Leave provider,
  credentials, and desktop state machine-local. No teardown hook is necessary.
- Worktree setup installs existing lockfile dependencies, Astro types, and the
  matching Chromium. Deck artifacts remain an explicit pinned-submodule task.
- Refresh screenshot baselines only after reproducing historical failures on the
  original commit and inspecting images; remove header overlays from prose captures.
- Proofreading uses EN EDIT level L1 and RU edit mode: grammar, calques, typography
  and formatting only. No rewrites, no fact changes; factual doubts go to Viktor.
- Talk and deck titles are official titles and stay as published; tags stay unchanged.
- The `__fixture-syntax-highlighting` post is test data and is excluded.
- Viktor, 2026-11-08: English prose dates use day-month-year ("5 October 2026")
  everywhere; month-year mentions ("October 2026") stay as they are.
- Viktor, 2026-11-08: English UI headings and buttons in `en.json` use sentence case.
- Viktor, 2026-11-08: city names are Cyrillic on RU pages and keep their diacritics
  on EN pages (Kraków, Košice). Official venue and event names stay as written.
- Viktor, 2026-11-08: RU prose keeps Latin `taint`/`toleration` in the Karpenter post.
- Viktor, 2026-11-08: factual problems are fixed against primary sources, and EN/RU
  divergences are resolved so both locales carry the same facts.
- Viktor, 2026-11-09: the headline claims ("keynote", "30+ talks per year", ~10K
  subscribers, 70K+ listens, book 4.8) are true and stay; the speaker rating is 4.6-4.8.
- Viktor, 2026-11-09: hero lede and "Read the blog" CTA; new bio ("since 2009", co-author
  Alexander Dovnar); new podcast and book copy with platform links and a Packt button;
  visible contact address with copy button and a Name + Message form; RU UI neutral for
  controls and «ты» for sentences; footer with "Opinions are my own", RSS and the address.
- Viktor, 2026-11-09: Hello World stays in the blog.
- Viktor, 2026-11-09: new homepage order (hero, latest, blog, six speaking events,
  about, podcasts and book, contact); the Slides section moves into Speaking.
- Viktor, 2026-11-09: RSS via `@astrojs/rss` (dependency approved); Manrope for RU
  headings with self-hosted Cyrillic fonts and no Google Fonts; `uk` browsers go to /en/.
- Viktor, 2026-11-09: "Invite me to speak" block with topics from delivered talks and a
  speaker photo (his stage photo from AWS Summit Berlin); Search Console, Bing Webmaster
  and a privacy-friendly visit counter.
- Viktor, 2026-11-09: one row per event in the speaking timeline; Malta and Adria
  workshops added; the Malta DevOps Agent workshop is the public AWS catalog workshop.
