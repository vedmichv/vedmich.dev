# Site review: vedmich.dev, 2026-11-09

Read-only review. No file in the repository was edited, nothing was built or tested in the shared checkout. All browser evidence comes from the live site https://vedmich.dev (Playwright, bundled Chromium via @playwright/test 1.59.1, reduced motion on) and from reading the source at HEAD 3338e38.


> Status after the review: S-01 (broken `<head>`) is fixed in ce4cdbd. The
> screenshots, raw data and scripts referenced below stay outside the repository
> (local review cache); the findings and proposals are complete without them.

## 0. Scope, method, limits

| Item | Detail |
|---|---|
| Live version | Deployed commit b7eb9c9 (GitHub Pages run of 2026-11-08 21:41Z). Local `main` is 10 commits ahead of `origin/main` and not deployed. Two of them matter here: `3fe95de` (hero pills localized) and `1771c58` (horizontal scroll fix in articles). Findings that these commits already fix are marked "fixed locally, not deployed". |
| Source | HEAD 3338e38. The uncommitted work of the other agents (blog posts, embeds, diagrams) was not reviewed. |
| Pages checked | 53 sitemap URLs + the unlisted Pod Pending post + 2 live Slidev decks, widths 320 / 390 / 768 / 1440 for EN and RU home, blog index, a post, talks index, a talk, slides index, 404. |
| Checks run | Head and metadata crawl of every page, link check (194 unique links), layout/overflow, console errors, contrast by pixel sampling, keyboard tab order, landmarks and headings, search queries, contact flow (no submit), root-redirect by locale, no-JS rendering, Performance API (LCP, CLS, long tasks, transfer sizes), third-party request audit, platform-font audit through CDP, compiler-level reproduction of the head bug. |
| Not done | No Lighthouse run (lab numbers below come from the Performance API on a fast connection, not field data). No screen-reader session. No real mail client. No Search Console or analytics data (none exists, see S-09). Amazon, Spotify and YouTube pages could not be read by bots, so ratings, listens and subscriber counts stay unverified. |
| Skills applied | `en-work-writing` (genre-public, identity-en, anti-ai), `ru-tech-writing` (glossary, voice, anti-ai, identity), `viktor-vedmich-design`. The proposed RU copy passes `checks.sh --address ty` (all PASS). The EN scanner could not run (ripgrep missing), so the EN copy was checked by hand against the Tier A list. |
| Evidence files | Screenshots: `shots/`. Raw data: `data/` (meta.json, perf.json, a11y.json, contrast.json, layout-report.json, links-bad.json, text dumps). Scripts: `*.mjs` next to this file. |

Status of the October review recommendations (docs/reviews/2026-10-03-site-review.md):

| October item | Status on 2026-11-09 |
|---|---|
| 1. Dependency migration | Open. Astro 5.18.0 installed, 7.4.7 is latest (two majors). See T-01. |
| 2. Type-check gate | Open. No `check` script, no `@astrojs/check`. |
| 3. Deterministic Cyrillic typography | Open and measured: see D-01. |
| 4. Sitemap draft parser | Open. Still a top-level frontmatter regex (`astro.config.mjs`); works for today's content. |
| Social metadata (og:image etc.) from the October fix | Regressed by a head bug introduced in that same change: see S-01. |

---

## 1. Executive summary

The site is lean (123 to 370 KB per page, about 2 KB of JavaScript, CLS 0, no third party on the main pages), EN and RU have the same content (7 of 7 posts, 15 of 15 talks), and the October accessibility work holds up. What holds the site back is not craft but three things: a live bug in the document head, a hero and speaking record that do not tell organizers and recruiters what Viktor offers (and contain claims nobody can verify), and discovery gaps for engineers (no RSS, search that skips talks, no structured data).

### Top 10 changes, ranked by impact against effort

| # | Change | Who it helps | Impact | Effort | Needs Viktor |
|---|---|---|---|---|---|
| 1 | Fix the broken `<head>` on every page: `og:url`, `og:locale`, all `twitter:*`, `og:image:height` and `article:published_time` sit in `<body>`, and the text "!Astro.props.image &&" is printed at the top of every page (S-01) | Everyone who shares a link or uses a screen reader | High | S | No |
| 2 | Contact: show the address `viktor@vedmich.dev` with a copy button, rename "Send", drop the pointless Email field (I-05, C-08) | Recruiters, organizers, anyone on webmail | High | S | Copy approval |
| 3 | Speaking: add the talks that exist publicly but are missing (DKT Conf 2026, AWS Summit Warsaw 2026, InfoQ Dev Summit Munich 2025, AWS Community Day Adria), replace "30+ per year", "4.5-4.7/5.0" and "keynote" with checkable facts, add an "Invite me to speak" block and a small speaker kit (I-02, C-02, C-06) | Conference organizers | High | M | Yes (data, claims) |
| 4 | Hero lede and bio rewrite: say what Viktor does and what the site offers, drop "15+ years" (superseded by "since 2009") and the unverifiable "keynote" (C-01 to C-03) | Recruiters, organizers, search snippets | High | S | Yes (copy) |
| 5 | Homepage order: a "Latest" strip first, Blog and Speaking before Podcasts and Book, Speaking capped at 6 rows, Slides folded into Speaking (I-01) | Engineers, organizers | High | M | Yes |
| 6 | RSS feed for EN and RU, `<link rel="alternate">`, a footer with RSS, GitHub and the contact address (I-07, S-02) | Engineers, podcast listeners | Med-High | S to M | Yes (hand-written endpoint or new dependency) |
| 7 | Podcasts: a "Listen on" row (Apple Podcasts, Spotify, Yandex Music, YouTube, Podbean), link to dk-t.dev, dated stats instead of bare numbers (I-04, C-04) | Podcast listeners | Medium | S | Yes (links, stats) |
| 8 | Self-host Cyrillic fonts (Inter and JetBrains Mono have Cyrillic; Space Grotesk does not) and choose a display face for RU headings; stop loading Google Fonts in embeds (D-01, P-04) | Russian-language readers | Medium | M | Yes (display font) |
| 9 | Search: index talks, podcasts and the book, add body text, normalize case and typos (I-06) | Engineers, organizers | Medium | M | No |
| 10 | Structured data (Person, WebSite, BlogPosting, Event), per-post social cards, title and description trimming, remove U+2014 from meta text (S-03 to S-05) | Search and sharing | Medium | M | No |

Next tier (small, do together): talk tag contrast 3.81:1 (A-02), literal backticks around inline code (D-05), three different left edges across sections (D-02), localized 404 (C-10), `lang="en"` on English titles in RU lists (A-04), RU UI string address (C-09), `/en/blog` links without trailing slash (S-06), i18n leaks in Book (A-05).

### What is already good (keep)

- Performance: home 370 KB / 14 requests, blog index 123 KB, post 181 KB, LCP 100 to 176 ms lab, CLS 0, TBT 0 (data/perf.json).
- No analytics, no cookies, no third-party request on home, blog index, talks and most posts.
- Skip link, teal focus ring, logical tab order, one H1 per page, landmarks present (data/a11y.json).
- Reduced motion handled; content readable with JavaScript off (29 of 29 reveal elements visible, post H1 present).
- Contact success copy is honest ("should have opened with a draft"), as AGENTS.md requires.
- Link health: 194 unique links from 53 pages, no broken external link (LinkedIn answers 999 to bots only).
- Unlisted post (Pod Pending) is noindex, absent from sitemap, listings and search.

---

## 2. Decisions Viktor needs to make

1. Which headline claims stay: "keynote speaker", "30+ talks per year", "speaker rating 4.5-4.7/5.0", "~10K subscribers", "70K+ listens", book "4.8" (C-02). Each is unverifiable from public sources; proposals below replace them with computed or dated facts.
2. Hero hierarchy: the tagline ends with "AI Engineer" (brand priority 1) while the role line says "Senior Solutions Architect". Keep both, or lead with one (C-01).
3. A photo of Viktor (About and speaker kit). The site has no portrait; organizers and recruiters expect one (C-03).
4. A footer line "Opinions are my own" (AWS employee, site names AWS in the hero). Recommended; your call (C-10).
5. Address in RU UI strings: the UI says «вы» (Найдите, Напишите, Ваше имя) while posts say «ты». Recommendation: impersonal wording for buttons and labels, «ты» in sentences (C-09).
6. Cyrillic display face for RU headings: Inter Cyrillic Semibold, or a geometric Cyrillic face (Manrope, Onest) (D-01).
7. RSS: hand-written endpoint (no dependency) or `@astrojs/rss` (new dependency, AGENTS.md asks first). Newsletter yes or no (I-07).
8. Analytics: none today. Search Console plus Bing Webmaster (DNS verification, no code) is the minimum; a privacy-friendly counter is optional (S-09).
9. Backfill the speaking list. Leads with sources are in I-02; the rest needs your own list.
10. Homepage restructure and the "Slides" section merge (I-01, I-09).
11. Should uk-UA and be-BY browsers be routed to /ru/? Today they are (I-10).
12. What happens to "Hello World: launching vedmich.dev": keep in the blog index, or move to an "About this site" page (I-08).
13. How podcast numbers stay fresh: a dated constant you edit, or an RSS fetch at build time (I-04).

---

## 3. Findings by area

Format: evidence, impact, proposal, effort (S under 1 hour, M half a day, L days), whether it needs Viktor.

### 3.1 Positioning and copy

#### C-01 The hero says who Viktor is, not what the visitor gets

- Evidence: hero text (`src/i18n/en.json:30-37`): name, role, "Distributed Systems · Kubernetes · AI Engineer", four pills, CTAs "Get in touch" and "Read more". There is no sentence about what the site offers. Search engines fill the gap themselves: a web search on 2026-11-09 returned, for https://vedmich.dev/ru, the snippet "Виктор Ведмич: Senior Solutions Architect в AWS, Keynote Speaker CNCF Kubestronaut. Kubernetes Interview» Host. Интервью с экспертами, мок-интервью" (pills glued together), and for /en the podcast card text "AWS services, architectural patterns ... Vendor-agnostic perspective from inside AWS. 70+ episodes · 70K+ listens". The meta description is not used.
- Impact: the first screen does not answer "what is here for me" for any of the four audiences; the snippets in search are accidents.
- "Read more →" goes to `#about`, which is already on screen under the hero (1440 px): a wasted CTA.
- Proposal (EN, facts only from the site and identity-en.md):
  - Lede under the tagline: "I design cloud architecture for enterprise teams at AWS. Here I write about Kubernetes and AI agents in production, share my talks and slides, and host two podcasts."
  - CTAs: "Get in touch" and "Read the blog".
  - Pills: "Speaker at re:Invent and AWS Summits" | "CNCF Kubestronaut" | "Author of “Cracking the Kubernetes Interview”" | "Host of DKT and “AWS на русском”".
- Proposal (RU, `checks.sh` PASS):
  - Lede: «Я проектирую облачную архитектуру для крупных клиентов в AWS. Здесь пишу про Kubernetes и AI-агентов в проде, выкладываю доклады со слайдами и веду два подкаста.»
  - CTAs: «Написать» и «Читать блог».
  - Pills: «Выступал на re:Invent и AWS Summit» | «CNCF Kubestronaut» | «Автор книги «Cracking the Kubernetes Interview»» | «Ведущий подкастов DKT и «AWS на русском»».
- Also: the RU host pill in local `ru.json` still says "Ведущий · DKT + AWS RU" ("AWS RU" is not the canonical name; the October-November review noted this). The live RU pills are still English (fixed locally in 3fe95de, not deployed).
- Meta description (home), shorter and with content: EN "Viktor Vedmich, Senior Solutions Architect at AWS. Kubernetes and AI agents: posts, conference talks with slides, a book and two podcasts." RU «Виктор Ведмич, Senior Solutions Architect в AWS. Kubernetes и AI-агенты: статьи, доклады со слайдами, книга и два подкаста.»
- Effort: S. Needs Viktor: yes (copy, and the "AI Engineer" order, decision 2).

#### C-02 Claims that can go stale or cannot be verified

| Claim (where) | What I could check | Status | Proposal |
|---|---|---|---|
| "Senior Solutions Architect @ AWS" (hero, meta) | Matches identity-en.md (since 2025). InfoQ Dev Summit 2025 speaker page uses the same title. | Verified against approved facts | Keep. Some external pages still say "Senior Developer Advocate"; not on this site. |
| "15+ years" (About, EN and RU) | identity-en.md and identity.md: "in the industry since 2009", never "15+ years". 2009 to 2026 is 17 years. The InfoQ bio says "10+ years", so three versions are in circulation. | Superseded | Replace with "since 2009" (C-03). It stays true every year without edits. |
| "re:Invent & keynote speaker" (hero) | re:Invent: 3 talks on the site (BOA310 2023, DEV317 and DEV327 2024). Keynote: no keynote appears on the site, in the talk files, or in public search results. | re:Invent verified, keynote unverified | Drop "keynote" until a keynote is named. If one exists, link it. |
| "30+ technical deep-dives per year" (Speaking) | The site's own list has 6 talks in 2026, 3 in 2025, 5 in 2024. | Contradicted by the page itself | Replace with a computed line (C-06). |
| "Speaker rating: 4.5-4.7/5.0" (Speaking) | Only one rating exists on the site (4.7, re:Invent 2023 BOA310). No source or period for the range. | Unverifiable | Name source and event ("re:Invent 2023 session survey") or remove. |
| "100+ episodes" (DKT) | dk-t.dev shows "DKT 106" in preparation; the DKT100 episode is dated 2026-07-16 on the Podbean page. | Verified | Keep, add date (I-04). |
| "~10K subscribers" (DKT) | YouTube channel page is not readable by bots. | Unverifiable | Date it or remove. |
| "70+ episodes" (AWS на русском) | Episode 074 was published in October 2026 (YouTube Music listing). | Verified | Keep, add date. |
| "70K+ listens" (AWS на русском) | No public total found. Per-episode YouTube Music views are in the hundreds. | Unverifiable; already indexed by search as page text | Date it or remove. |
| Book "4.8" with five full stars (Book) | Amazon page not readable by bots; Goodreads shows 10 ratings for the author's two books. `Book.astro:5-7` says "Update manually". | Unverifiable, no count, no date | Show "4.8 on Amazon (n ratings, Nov 2026)" or drop the number. Five full stars next to 4.8 over-claims; use a partial star or text only. |
| CNCF Kubestronaut | Credly badge URL returns 200: "Kubestronaut ... issued by The Linux Foundation to Viktor Vedmich". | Verified | Keep. `certifications` in `src/data/social.ts` is dead data; either show the five certifications in About or delete it. |
| "© 2026" (footer) | Computed at build time. | Correct after the next build | If there is no deploy in January, the year is stale. A scheduled weekly rebuild (T-03) fixes it and keeps build-time stats fresh. |
| Gateway API deck: "Current as of Gateway API v1.5 (Feb 2026)" | The article says v1.6 shipped 30 June 2026 and v1.7 on 29 October 2026. | Stale in the deck (deck repo) | Update the deck source or add "as of" wording. |

Effort: S per item. Needs Viktor: yes for every "unverifiable" row.

#### C-03 About: bio

- Evidence (`en.json:41`): "Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale. Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud, Kubernetes, and GenAI / agentic platforms. CNCF Kubestronaut and author of ..."
  - "15+ years" is superseded (C-02). "designing and evolving ... at scale", "owning end-to-end architecture" are corporate filler for a non-native reader and say little. The book has a co-author (Alexander Dovnar, approved fact) that the site never mentions.
- RU evidence (`ru.json:41`): «с 15+ годами опыта в проектировании и развитии масштабных распределённых систем» is a calque of the EN sentence with a four-word genitive chain; «отвечаю за сквозную архитектуру» calques "end-to-end architecture".
- Proposal EN: "I am a Solutions Architect and AI Engineer, working in the industry since 2009. Since 2021 I have been at AWS, where I design architecture for enterprise customers: hybrid cloud, Kubernetes, and GenAI and agentic platforms. I am a CNCF Kubestronaut and the co-author, with Alexander Dovnar, of “Cracking the Kubernetes Interview”."
- Proposal RU: «Я Solutions Architect и AI Engineer, в индустрии с 2009 года. С 2021 года работаю в AWS: проектирую архитектуру для крупных клиентов. Это hybrid cloud, Kubernetes, GenAI и агентные платформы. CNCF Kubestronaut. Вместе с Александром Довнаром написал книгу «Cracking the Kubernetes Interview».»
- Check with Viktor: "design architecture" replaces "own end-to-end architecture". If "own" (responsibility) matters, say "I am responsible for the architecture of ...".
- Also add: a portrait (decision 3), languages ("talks in English and Russian"), a "Download short bio" block for organizers (I-02), and the five certifications as a quiet line using the existing `certifications` data.
- Expertise pills: 11 equal pills mix themes (Python next to AI Engineering) and repeat the tagline. Trim to about 7 or group in three rows (Platforms, AI, Delivery).
- Effort: S. Needs Viktor: yes.

#### C-04 Podcasts

- Evidence (`en.json:49-53`, `ru.json:49-53`):
  - EN: "Technical deep-dives into DevOps, Kubernetes, and infrastructure." ("deep-dive" is a Tier A tell in anti-ai.md.) "Vendor-agnostic perspective from inside AWS." contradicts itself: a host who works at AWS cannot be vendor-agnostic, and "faux independence" is a trust marker in voice.md (Фальшь).
  - RU: «Глубокие технические погружения в DevOps...» (calque, «погружение» is a listed AI-tell). «Всё на русском.» on a Russian page states the obvious. «Взгляд изнутри AWS без привязки к вендору» repeats the contradiction. An older index snapshot of the RU page said «Независимый взгляд изнутри AWS», so this wording has drifted twice.
  - Both cards link to one platform only: DKT to YouTube, AWS на русском to Spotify. The two shows are on more platforms (dk-t.dev lists Spotify, Apple Podcasts, Yandex Music, Podbean; "AWS на русском" is on Apple Podcasts, Yandex Music, Spotify, YouTube, Podbean). Yandex Music matters for RU listeners. The DKT co-host (Alexander Dovnar) is not named. Neither card links to dk-t.dev, the show's own site.
  - Label "Listen" on a link that opens a YouTube channel.
- Proposal EN:
  - DKT: "A podcast and community about DevOps, SRE, AI, system design and cloud. Interviews with engineers, mock interviews, and news that listeners send in. I host it with Alexander Dovnar."
  - AWS на русском: "A Russian-language podcast about AWS services, architecture patterns, AI applications and IT careers. I have hosted it since 2021, so you hear the view from inside AWS."
- Proposal RU:
  - DKT: «Подкаст и сообщество про DevOps, SRE, AI, system design и облака. Интервью с инженерами, мок-интервью и разбор новостей, которые присылают слушатели. Веду его вместе с Александром Довнаром.»
  - AWS на русском: «Подкаст о сервисах AWS, архитектурных паттернах, применении AI и IT-карьере. Веду его с 2021 года, поэтому смотрю на всё изнутри AWS.»
- Source of the DKT wording: dk-t.dev ("Подкаст и сообщество. Говорим о DevOps, SRE, AI, System Design и облачных технологиях. Разбираем новости"). "Inside AWS" is kept because it is already in the current copy; identity.md warns that this claim needs the brief, so confirm it.
- Platform row: Apple Podcasts, Spotify, Yandex Music, YouTube, Podbean as small links under each card, plus "dk-t.dev". Verify URLs before use (I found `podcasts.apple.com/by/podcast/aws-на-русском/id1600771698` and the dk-t.dev list).
- Effort: S. Needs Viktor: yes (links, "inside AWS", stats).

#### C-05 Book

- Evidence (`en.json:68`): "A comprehensive guide covering Kubernetes concepts, architecture, networking, security, and real-world scenarios to help you ace your next interview." "comprehensive" is a Tier B word; "ace" is an idiom for a non-native reader (non-native.md). RU (`ru.json:68`): «Полное руководство по концепциям, архитектуре, сетям, безопасности Kubernetes и реальным сценариям...» is a calque of "comprehensive guide", and the chain «по ... безопасности Kubernetes и реальным сценариям» is ambiguous (does Kubernetes attach to every noun?).
- Missing: the co-author, the publisher (Packt: the cover and packtpub.com list it), a non-Amazon link. Amazon is not a purchase route for part of the RU-speaking audience; the Packt page sells directly. Reader reviews exist (dev.to, Medium) and are free social proof.
- Proposal EN: "A guide to Kubernetes interviews: core concepts, architecture, networking, security and real-world scenarios. Written with Alexander Dovnar and published by Packt." Buttons: "Get on Amazon" and "Buy from Packt".
- Proposal RU: «Книга для подготовки к собеседованию по Kubernetes: основные понятия, архитектура, сети, безопасность и реальные сценарии. Написана вместе с Александром Довнаром, издательство Packt.»
- Effort: S. Needs Viktor: yes (Packt link, reviews to quote).

#### C-06 Speaking: subtitle, highlight, thin pages

- Evidence: subtitle "30+ technical deep-dives per year. Speaker rating: 4.5-4.7/5.0" (see C-02). Highlight "★ Speaker rating: 4.7/5.0" appears on one talk only (`2023-reinvent-cdk8s.md`).
- Proposal subtitle, computed at build time so it cannot go stale: EN "{N} talks since {year} on Kubernetes, AWS and AI agents, in English and Russian." RU «{N} докладов с {year} года про Kubernetes, AWS и AI-агентов, на английском и русском.» Use `Intl.PluralRules('ru')` for «доклад / доклада / докладов». Current value would be "15 talks since 2023" (more after the backfill, I-02).
- Invite line under it: EN "Need a speaker? Send the date, format and audience to viktor@vedmich.dev." RU «Нужен докладчик? Дата, формат и аудитория: viktor@vedmich.dev.»
- Thin talk pages (one or two generic sentences, no video, no slides, no format):

| Page | Current text (EN or RU) | Problem |
|---|---|---|
| 2024-kubernetes-security | "Essential security practices for Kubernetes clusters, covering RBAC, network policies, and threat mitigation." / «Ключевые практики безопасности для кластеров Kubernetes, включая RBAC, сетевые политики и противодействие угрозам.» | Could describe any talk. |
| 2026-karpenter-production | "Real-world lessons from running Karpenter in production environments, focusing on cost optimization and operational best practices." / «Реальные уроки эксплуатации Karpenter в продакшен-окружениях с фокусом на оптимизацию затрат и операционные best practices.» | Stock phrases; «с фокусом на» and «best practices» are calques. No case, no number. |
| 2026-karpenter-scalability | "Deep dive into Karpenter's architecture and production deployment patterns for cost-efficient Kubernetes cluster autoscaling." / «Глубокое погружение в архитектуру Karpenter и паттерны развёртывания...» | "Deep dive" and «глубокое погружение» are tells. |
| 2024-cdk8s-iac, 2023-reinvent-cdk8s | Two sentences, same text as each other | Duplicate content across two talk pages. |

  I cannot rewrite these without inventing facts (fact lock). Ask Viktor these five questions per talk and write 80 to 120 words from the answers: what problem did the talk start from, what was the one case or number, what did the audience leave with, was there a live demo, in which language was it given? The Karpenter article (published 20 March 2026) already has the facts for the two Karpenter talks.
- Titles on RU pages: 8 of 15 titles are English, 7 are Russian, in one list. Decide a rule: show the title in the language the talk was given, and add `lang="en"` (A-04).
- Effort: S for the subtitle, M for the five thin pages. Needs Viktor: yes.

#### C-07 Slides naming and copy

- Evidence: the nav says "Slides", the route is `/presentations/`, the section title says "Recent decks", the subtitle "Decks: 2 · slides open right in the browser", the button "All decks", the deck URLs `/slides/<slug>/`. The index page (`/en/presentations/`) lists all decks but its H1 is "Recent decks". RU: «Свежие слайды», «Презентаций: 2 · слайды открываются прямо в браузере» (the colon form avoids plural endings but reads like a database row). "Deck" is jargon for non-native readers.
- Proposal: one word, "Slides" / «Слайды», as title everywhere; drop the count while there are only two decks; subtitle EN "Slides open in the browser." RU «Слайды открываются в браузере.» Remove the truncated slug line (`vedmich.dev/slides/ai-agents-devops-tas…`) from cards; replace by "40 slides · English" if known.
- Effort: S. Needs Viktor: no.

#### C-08 Contact copy and the mailto form

- Evidence (`en.json:83-104`, `Contact.astro`):
  - Three names for one action: nav "Contact", heading "Let's connect", hero button "Get in touch", form button "Write me a message", submit "Send". "Let's connect" is LinkedIn-speak. RU: heading «Связаться» (infinitive) but nav «Контакты».
  - The form asks for Name and Email, then opens the mail client. The Email field has no function: the mail app sends from the user's own address. "Send" implies a submission that does not happen; AGENTS.md says never imply a sent message. The success panel then flips immediately with a check mark.
  - The address `viktor@vedmich.dev` is not visible in the default state (`addressVisible: false`); it appears only in the success panel and inside `<noscript>`. People on webmail (Gmail, Outlook web) get no mail client and no address.
  - The generated subject contains U+2014 (`Contact.astro:204-205`, "vedmich.dev [U+2014] name").
- Proposal EN: heading "Contact"; text "Talk invitations, podcast guests, questions about a post: viktor@vedmich.dev. You can also find me here:" Buttons "Write an email" and "Copy address". Form fields: Name, Message. Submit "Open in my email app". Success heading "Your email app should open"; body "A draft is ready in your email app. Send it from there. If nothing opened, the address is viktor@vedmich.dev."
- Proposal RU: заголовок «Контакты»; текст «Приглашения выступить, гости подкастов, вопросы по статьям: viktor@vedmich.dev. Ещё я здесь:»; кнопки «Написать письмо» и «Скопировать адрес»; submit «Открыть в почтовом приложении»; success «Почтовое приложение должно открыться», «Черновик письма появится в почтовом приложении, отправить его нужно оттуда. Если ничего не открылось, адрес для письма: viktor@vedmich.dev.»
- Subject line: "vedmich.dev: message from {name}".
- Effort: S. Needs Viktor: copy approval only.

#### C-09 Address mix in RU interface strings

- Evidence: `ru.json` uses «вы» forms (Найдите меня, Напишите мне, Ваше имя, Проверьте почтовый клиент, Отправьте его, Начните вводить запрос, Попробуйте). `checks.sh --address ty` flags only «Ваше имя»; the rest are imperatives in the plural. The blog posts are «ты».
- Proposal: functional UI (buttons, labels, placeholders) in infinitive or neutral wording; sentences addressed to the reader in «ты» to match the posts.

| Key | Now | Proposed |
|---|---|---|
| contact.subtitle | Найдите меня на этих платформах | Ещё я здесь: |
| contact.write_me_cta | Напишите мне | Написать письмо |
| form.name_placeholder | Ваше имя | Имя |
| form.message_placeholder | О чём хотите поговорить? | О чём поговорим? |
| success.heading | Проверьте почтовый клиент | Почтовое приложение должно открыться |
| search.empty_hint | Начните вводить запрос. Попробуйте: «karpenter», «mcp», «kubernetes». | Введи запрос. Например: «karpenter», «mcp», «kubernetes». |
| presentations.subtitle | Презентаций: {N} · слайды открываются прямо в браузере | Слайды открываются в браузере. |

- Effort: S. Needs Viktor: yes (decision 5).

#### C-10 Footer and 404

- Footer (`Footer.astro`): copyright and "Built with Astro" only. Proposal EN: "© 2026 Viktor Vedmich · Opinions are my own · RSS · Site source". RU: «© 2026 Виктор Ведмич · Мнения мои личные · RSS · Исходники сайта». "Opinions are my own" is a decision (4).
- 404 (`src/pages/404.astro`): English only even for `/ru/...` paths (verified: `/ru/blog/nope/` shows "Page not found", `lang="en"`). No navigation beyond two home links. Proposal: the inline script already runs on the 404; add a branch for paths starting with `/ru/` that swaps the text (RU: «Страница не найдена» / «Ссылка могла устареть, или страницы ещё нет.») and add links to Blog and Talks. Keep the Slidev deep-link logic untouched (AGENTS.md).
- Effort: S. Needs Viktor: only the disclaimer.

#### C-11 Calques and "announcing" sentences in content (for the people editing the posts)

The rejected pattern («Сначала точно назовём, что в Ingress не так на уровне устройства.») is a sentence that announces the next step instead of making it. It is gone from the working tree. Remaining instances of the same family on the live site or at HEAD, with the fix pattern "state the content, not the plan":

| Where | Text | Fix |
|---|---|---|
| RU Karpenter, line 17 | «Дальше: чем Karpenter отличается, три ловушки, где его сильные стороны оборачиваются против команды, поэтапный переход и что мониторить.» | A table-of-contents sentence. The H2 headings already say this. Cut it or turn it into one claim the reader can disagree with. |
| RU Gateway card description (live) | «Разбираем его преемника на одном живом магазине» | «живой магазин» calques "one running shop" (a running example). «на одном сквозном примере: интернет-магазине». |
| RU deck description (Gateway) | «Не привязанный к вендору преемник Ingress целиком» | Ambiguous («целиком» attaches to what?). «Преемник Ingress, не привязанный к вендору: четыре ресурса, ...». |
| RU RCA card description | «...вырастает из одного вызова модели в ограниченный цикл расследования, что нужно, чтобы такого агента эксплуатировать, и какое место занимают Strands и AgentCore» | «ограниченный цикл расследования» is a calque ("bounded investigation agent") and the sentence is a list of three topics. Lead with the question and the answer. |
| EN hello-world | "Just the way I like my infrastructure: lean and efficient." | Idiom plus a pose. Cut. |
| EN site copy | "deep-dives" (podcast, speaking), "comprehensive", "ace", "owning end-to-end" | See C-03 to C-06. |

The post texts are being rewritten by other agents; I did not repeat a full pass. Meta descriptions for the posts should be at most 155 characters (S-05).

---

### 3.2 Information architecture and navigation

#### I-01 Homepage: order, length, what comes first

- Evidence: section order Hero, About, Podcasts, Book, Speaking, Slides, Blog, Contact. The page is 5782 px tall at 1440, 8475 px at 390 and 10011 px at 320 (EN; RU is 68 to 289 px taller). The blog, which is the main asset for engineers, is the second-to-last section and shows 3 cards. The Speaking section prints all 15 talks and duplicates `/en/speaking/` completely. On mobile each talk row uses 230 px of width because of a 100 px year column. Podcasts and Book (two of the least requested things for three of the four audiences) sit before any content.
- Proposal order: Hero (with lede) → Latest strip (newest post, newest talk, newest episode, one line each, computed at build time) → Blog (3 cards) → Speaking (6 newest rows, "All talks →", invite block) → About (with portrait) → Podcasts and Book as one two-column band "Also" → Contact. Fold the Slides section into Speaking: each talk row shows small badges "Video · Slides · Article" from the existing `video`, `slides`, `post` fields. Keep `/presentations/` as the deck index.
- Nav (7 items today): Blog, Speaking, Podcasts, Book, About, Contact (6 items); Slides lives under Speaking.
- Impact: engineers reach the posts first; organizers get the invite block; the homepage gets much shorter, most of all on phones.
- Effort: M. Needs Viktor: yes (decision 10).

#### I-02 Speaking record is incomplete; no organizer path

- Evidence: the site lists 15 talks (2023: 1, 2024: 5, 2025: 3, 2026: 6). Public sources show at least four more:
  1. DKT Conf 2026 (Russian), "Агент вместо дежурного", recording from 00:40:36, page https://dk-t.dev/slides/agent-instead-of-oncall (DKT Conf was on 2026-08-15 in Minsk per identity.md).
  2. AWS Summit Warsaw, 6 May 2026, EXPO XXI, DOP202 "Integrated AI Agents & Code Assistants with MCP & AWS" (Viktor's own LinkedIn post).
  3. InfoQ Dev Summit Munich 2025, 15 October 2025, "Beyond Speed Limits: Exploring the Performance Power of Valkey" (https://devsummit.infoq.com/speakers/viktorvedmich).
  4. AWS Community Day Adria: "Building an RCA Agent with Amazon Bedrock AgentCore" (https://www.awscommunityadria.com/speakers/viktor-vedmich; date not read).
  5. Older: DevOpsConf Moscow 2022 author page, FinOps talks (YouTube, Nov 2023 and 2024). Not verified.
- There is no "Invite me to speak" action, no list of topics offered, no formats (talk, chalk talk, workshop), no languages, no short bio to copy, no photo, no upcoming-talks slot. Three different bios circulate (15+ years on this site, 10+ years at InfoQ, 20+ in old brand documents).
- Proposal:
  - Backfill the talks above (EN and RU files, matching slugs).
  - Add to `/speaking/` a block "Invite me to speak": three topics Viktor wants to give (his decision), formats, languages, "viktor@vedmich.dev" with a prefilled subject, and a "Speaker kit" subsection with a 50 and a 100 word bio in EN and RU, a headshot download, and the canonical title line.
  - Add an "Upcoming" row at the top when there is one; omit it when there is not.
  - Per row badges (Video, Slides, Article); the data already exists.
- Effort: M (L if the speaker kit gets its own page). Needs Viktor: yes (the list, topics, bio, photo).

#### I-03 Talks, slides, posts and videos are not connected

- Evidence: `speaking.post` and `presentations.post` point from a talk or deck to its article, but a post never links back. Only two talks have a slide link or an article (`2026-rca-agent-agentcore`, Gateway). Posts hand-write a "Related" list (Karpenter does, with two talks; others do not). Talks of the same event pair (the two Tech Race Summit sessions, two Code Europe sessions, two cdk8s sessions) do not link to each other. The 404 shell restores deck deep links, but the talk page does not link to specific slides.
- Proposal: on a post page, find speaking and presentations entries whose `post` equals this post and render "This post grew out of: talk X (video, slides)". On a talk page, render sibling talks of the same event/date. In `content.config.ts` allow an optional `related: string[]` on posts for manual links. This removes the hand-written "Related" lists and keeps EN/RU consistent.
- Effort: M. Needs Viktor: no.

#### I-04 Podcasts: one card each, no home

- Evidence: the search engine already treats the podcast card text as the page snippet (C-01). Listeners searching "AWS на русском подкаст" land on Spotify or Apple, not here. There is no page with the episode list, platforms, hosts, a guest/topic submission, or the latest episode. Numbers are static strings (`dkt_stats`, `aws_stats`) with no date.
- Proposal: (1) now: platform row and dk-t.dev link in the cards (C-04), numbers with a date: "100+ episodes (Nov 2026)". (2) later: `/podcasts/` page per show with latest 5 episodes fetched from the Podbean RSS at build time, hosts, "propose a topic" mailto. A weekly scheduled rebuild keeps it fresh (T-03).
- Effort: S now, M later. Needs Viktor: yes (links, stats mechanism).

#### I-05 Contact path

See C-08. Structural point: the address must exist as plain text on the page, in the footer and in the Contact section, with a copy button. Add `mailto:` links with a subject for specific purposes ("Invite me to speak", "Be a guest on the podcast").
- Effort: S.

#### I-06 Search quality

- Evidence (live, Playwright, `data/` and `shots/04-search-en.png`):

| Query | Results | Comment |
|---|---|---|
| karpenter | 1 post | Two Karpenter talks exist; talks are not indexed |
| tashkent | 0 | Two talks happened there |
| re:Invent | 0 | Three talks |
| cdk8s | 0 | Two talks |
| podcast / book / speaking | 0 | Sections and cards are not indexed |
| Dovnar | 0 | Co-author, host |
| cost | 0 | Body text is not indexed; only title, tags and the front-matter description |
| kubernets (typo) | 0 | No tolerance |
| RU: кластеры | 0, while кластер gives 1 | Substring only, no stemming |
| RU: ташкент, подкаст, книга, ингресс | 0 | |

- Cause (`src/data/search-index.ts`): `buildSearchIndex` includes only presentations (2) and blog posts (7); `body` is the front-matter description; `fuzzyScore` is a case-insensitive substring match with a token-AND fallback; the function is named fuzzy but is not.
- Proposal: (1) index speaking entries (title, event, city, tags, first 300 characters of the body), the two podcasts and the book as "Page" items; (2) index the first 400 characters of each post body plus the H2 headings; (3) normalize: lower-case, strip diacritics (Košice, Kraków), `ё`→`е`, and for RU trim common endings (a 4-to-5 character prefix match is enough for a personal site); (4) allow one typo for words of 6+ characters (Levenshtein 1); (5) show the kind label for talks ("Talk"). Keep the build-time JSON and the `<` escaping that the smoke test checks.
- Effort: M. Needs Viktor: no.

#### I-07 No RSS, no "latest", no newsletter, no "now"

- Evidence: no feed (`/rss.xml`, `/feed.xml`, `/en/rss.xml` all return the 404 page), no `<link rel="alternate" type="application/rss+xml">`, `@astrojs/rss` is not installed. There is no "latest" signal on the home page and no way to follow except social links.
- Proposal: a feed per locale (`/en/rss.xml`, `/ru/rss.xml`) generated at build; unlisted posts excluded exactly as the sitemap does; full description plus link, not full text. `@astrojs/rss` (4.0.19) is the usual route and needs a dependency approval; a 40-line `src/pages/en/rss.xml.ts` endpoint with manual XML escaping needs none. Add `<link rel="alternate">` in `BaseLayout`, an RSS link in the footer and in the blog index header, and a "Follow" row: RSS, Telegram (RU audience), LinkedIn. A newsletter is optional and needs a third-party service (decision 7); RSS plus Telegram covers both audiences without one.
- A "Now" line (what Viktor is working on, one sentence, dated) is cheap in the Latest strip and keeps the site feeling alive between posts.
- Effort: S to M. Needs Viktor: yes (dependency choice).

#### I-08 Thin, redundant and unlisted pages

| Page | Observation | Proposal |
|---|---|---|
| "Hello World: launching vedmich.dev" (EN/RU) | Listed in the blog index, search and sitemap between technical posts. Dated 3 Mar 2026. Contains the idiom noted in C-11. | Keep as an "About this site" page linked from the footer, remove it from the blog index and the Latest strip. Decision 12. |
| `/en/presentations/` | 2 cards, third grid column empty; H1 "Recent decks" for a complete list | Fold into Speaking (I-01); keep the URL. |
| Home Speaking section | Copy of `/speaking/` | Cap at 6 rows. |
| Five thin talk pages | C-06 | Rewrite from facts. |
| `/slides/vv-demo/` | Public Slidev showcase titled "slidev-theme-vv [U+2014] Full Showcase", in the deploy whitelist, not linked, not in the sitemap, no noindex | Remove from the whitelist or add noindex in the deck. |
| Two draft decks (`slurm-*`) | `draft: true`, hidden | Fine. |
| Pod Pending post | Unlisted, noindex, only EN | Fine. |

Effort: S. Needs Viktor: decision 12.

#### I-09 Naming drift and navigation order

- Slides / Presentations / Decks: three words in one flow (C-07).
- Nav order mirrors page order today; after I-01 reorder both together.
- The language switcher links to the same page; for untranslated pages the fallback goes to the collection index (verified in the October work). Good.

#### I-10 Locale routing

- Evidence: `/` redirects with JavaScript: ru-RU → /ru/, en-US → /en/, de-DE → /en/, uk-UA → /ru/ (the code treats `be` and `uk` as Russian). With JavaScript off, every visitor is sent to /en/ by `<noscript>` meta refresh. A stored `vedmich-lang` preference overrides the browser for ever.
- Impact: Ukrainian-language browsers receive the Russian site by default. That may be wrong for part of the audience; there is no Ukrainian version.
- Proposal: send `uk` to /en/ (decision 11); show a small "Switch language" hint on first visit instead of silently remembering; keep the no-JS fallback.
- Effort: S. Needs Viktor: yes.

---

### 3.3 Design and UX (Deep Signal)

Checked at 320, 390, 768, 1440, EN and RU; screenshots in `shots/` (`home-en-1440.png`, `home-ru-390.png`, `post-en-1440.png`, `talks-en-1440.png`, and crops in `shots/crops/`). The system is consistent in tone and tokens; the findings below are drift, not redesign.

#### D-01 Cyrillic typography is not deterministic

- Evidence: `public/fonts/` has only `*-latin-*.woff2`. Space Grotesk has no Cyrillic at all. CDP platform-font audit on /ru/ (data from `fonts.mjs`): H1 "Виктор Ведмич": 12 glyphs in the system font (.SF NS on macOS), 2 in Space Grotesk. About paragraph: 135 of 304 glyphs in the system font, 169 in Inter. Section titles "Выступления" and "Связаться": 11 and 9 glyphs, all system. On Windows this becomes Segoe UI, on Android Roboto. Mono text with Cyrillic falls back to Menlo.
- Impact: the RU site, a core audience, has no consistent headline face and mixed metrics inside a single paragraph; every cross-platform screenshot differs; the brand's display font is absent from every RU heading.
- Proposal: add `inter-cyrillic-{400,500,600,700}` and `jetbrains-mono-cyrillic-{400,500}` (about 25 KB each) with `unicode-range`. For RU display text either use Inter Cyrillic 600/700 with `letter-spacing: -0.02em` (simplest, consistent), or a geometric Cyrillic face close to Space Grotesk (Manrope, Onest). Consider variable fonts: 8 static files (190 KB on a first visit) become 3.
- Effort: M. Needs Viktor: yes (decision 6).

#### D-02 Three left edges and two heading scales on one page

- Evidence (measured on /en/ at 1440 px, `edges.mjs`): header logo x=184; hero and About x=160; Podcasts, Book and Contact x=168; Speaking, Slides, Blog x=184. At 390 px: hero and About x=24, Podcasts, Book and Contact x=16. H2: About is 28 px / 600 (the token `--text-h2`), all others are 30 px / 700 (`text-3xl font-bold`). Cause: containers use `max-w-[1120px]` with or without inner `px-6`, and `max-w-6xl` (1152 px) with `px-4 sm:px-6`.
- Proposal: one `.section-container` (`max-w-[1120px] mx-auto px-6`) and one H2 class mapped to the token scale (28 px / 600, or move the token to 30/700 and keep it). Apply to Hero, About, Podcasts, Book, Contact.
- Effort: S. Needs Viktor: no.

#### D-03 Two tag styles; one fails contrast

- Evidence: cards and posts use mono, uppercase, boxed tags (11 px, teal on teal-soft, 5.18:1). Talk pages use rounded-full 14 px pills (`speaking/[...slug].astro`, `bg-brand-primary-soft border-brand-primary text-brand-primary`): teal #14B8A6 on #134E4A measures 3.81:1 by pixel sampling, below AA 4.5:1 for 14 px text (A-02). The speaking detail page also uses `rounded-full` hero-like pills while the rest of the site uses 4 px radii for tags.
- Proposal: reuse the mono boxed tag component on talk pages (also fixes contrast). Make tags links to a filtered list when tag pages exist (I-06 backlog).
- Effort: S.

#### D-04 Speaking layout wastes space

- Evidence: at 1440, rows occupy about 600 of 1100 px; the right half is empty (shot `talks-en-1440.png`). At 390 the 100 px year column plus 24 px gap leaves about 230 px for text, so titles wrap to 3 and 4 lines (`crops/home-ru-390-02.png`). There is no marker for video, slides, article, language or format.
- Proposal: year as a sticky small heading above the rows on mobile (single column), two columns on desktop (event/title left, badges right: "Video", "Slides", "Article", "RU"). Hide the city when the event name already contains it ("devopsdays Tashkent · Tashkent", "AWS Summit Berlin · Berlin", "AWS Summit Hamburg · Hamburg", "AWS Summit Amsterdam · Amsterdam").
- Effort: S to M.

#### D-05 Inline code shows literal backticks

- Evidence: `getComputedStyle(code, '::before').content` is "`" inside `.prose`; the Karpenter post shows "`karpenter.sh/v1`" with visible backticks (shot `crops/post-en-1440-00.png`). This is the default of `@tailwindcss/typography`.
- Impact: looks like a Markdown leak to the engineers who read the posts.
- Proposal: add `prose-code:before:content-none prose-code:after:content-none` plus a subtle background and 2 px radius to the three prose wrappers (post EN/RU, talk). Check the Shiki palette test after the change (AGENTS.md).
- Effort: S.

#### D-06 Placeholders that look like placeholders

- Social chips in Contact use a letter in a circle ("L", "G", "Y", "T", and the double-struck "𝕏" for X) instead of icons, although `@iconify-json/simple-icons` and `logos` are already installed and `socialLinks[].icon` is defined and unused. The design skill specifies Lucide or inline social SVGs. Use `astro-icon` with the existing icon sets.
- Book rating: five solid stars next to "4.8" (C-02).
- Deck cards show a truncated mono slug line (C-07) and an ISO date in the overline while blog cards show "4 Oct 2026". Pick one human date format.
- Effort: S.

#### D-07 Header and small items

- Desktop nav appears only from 1280 px (`xl`). Between 1024 and 1279 px (small laptops, tablets) the 7 links are behind a burger although about 1010 px is enough for EN. Optional: switch at 1100 px.
- The search button shows "⌘K" to everyone; Ctrl+K works (verified in `SearchPalette.astro:346`). Show "Ctrl K" on non-Mac user agents.
- Hero role "Senior Solutions Architect @ AWS" wraps to two lines at 320 and 390 with "AWS" orphaned. Add `text-balance`.
- Token naming: `text-text-muted` maps to `--text-secondary` (#94A3B8) while the real `--text-muted` (#78909C) is `text-text-muted-new`; two meanings of "muted" invite mistakes.

#### D-08 Motion, themes, widths (observations, no action needed)

- Reduced motion: honored (reveals are visible, cursor blink and hover transforms disabled).
- Dark only, no `color-scheme` meta, so native form controls and scrollbars are not themed. Add `<meta name="color-scheme" content="dark">` and `color-scheme: dark` on `html` (S). A light theme is a brand decision and not recommended here.
- Overflow at 320 and 390: no horizontal scroll on any tested page except the Karpenter post, whose inline code and a table reach x=456 on live (fixed locally in 1771c58, not deployed). Re-test all posts after deploy.

#### D-09 Images

- `public/images/book-cover-3d.jpg` is 1216x1500, 141 KB, shown at 140 to 192 CSS px. A 400x494 WebP is about 20 KB. `dkt-logo.png` is 400x400 (39 KB) shown at 48 px. `vv-logo-hero.png` is 64x64 for a 32 px slot: fine.
- Effort: S (sharp is already a devDependency).

---

### 3.4 Accessibility

What passes (data/a11y.json): one `<header>`, `<nav>`, `<main>`, `<footer>`; one H1; headings are ordered H1, H2, H3; the skip link appears on first Tab (shot `02-skip-link-focus-en.png`); focus ring is the teal 2 px outline on nav, pills and buttons (shots `03-focus-*.png`); the language switch carries `aria-current`; external social links announce "opens in a new tab"; the contact success region is a polite live region; mobile menu closes on Escape and returns focus.

#### A-01 Stray text before the skip link

The text node "!Astro.props.image &&" is the first child of `<body>` on every page (S-01). Screen readers read it first; the fixed header covers it visually at 80 percent opacity, so sighted users rarely see it (shot `01-stray-text-header-hidden.png`). Fixed by S-01.

#### A-02 Contrast

- Method: screenshots of 14 representative elements, background = most frequent pixel colour, text = farthest colour, WCAG ratio.
- Result: all pass AA except the talk-page tag pills: #14B8A6 on #134E4A = 3.81:1 at 14 px / 500. Others measured: card tags 5.18, secondary text on surface 5.71, hero greeting on the gradient 4.97, hero `whoami` 5.05, amber highlight 6.81, footer text 6.96.
- Proposal: see D-03 (reuse the boxed tag style) or use `--brand-primary-hover` (#2DD4BF) for the pill text.
- Effort: S.

#### A-03 New-tab links without notice

Podcast cards, the book card and deck cards use `target="_blank"` with no "opens in a new tab" in the accessible name (social chips, Credly and talk buttons have it; `a11y.json` lists 6 without). Add the same suffix through `i18n.contact.opens_in_new_tab` or drop `target="_blank"` for same-site deck links (decks are on this domain).

#### A-04 Language of parts

- RU pages contain English talk titles and deck titles (8 of 15 in the speaking list) with no `lang="en"`; the EN page contains «AWS на русском» with no `lang="ru"`. Screen readers will read English titles with a Russian voice (WCAG 3.1.2, AA).
- Proposal: add `lang` where the title language differs from the page (frontmatter field `title_lang` or detect Cyrillic).
- Effort: S.

#### A-05 i18n leaks in the Book section

`Book.astro:73` `aria-label="4.8 out of 5 on Amazon"` and `Book.astro:60` `alt="… [U+2014] book cover"` are English on the RU page and contain U+2014. Move both to `i18n`. Also: `PresentationCard` overline and `Decks coming soon...` empty states are hard-coded in components; the blog slug pages hard-code "Back to blog" / «Назад к блогу» instead of using the i18n files. Effort: S.

#### A-06 Contact form

Labels are real `<label>` elements, `autocomplete` is set, the success region is announced. The Email field is required but unused by the handoff (C-08); removing it removes a validation barrier too. The hero greeting `~/vedmich.dev $ whoami` is decorative: add `aria-hidden="true"` so it is not read as content.

#### A-07 Media

RCA post `<video>` has no captions (known from the proofreading review); iframes are titled (0 untitled on 5 posts checked). Add a transcript or `<track>` when the demo is revised.

---

### 3.5 SEO and sharing

#### S-01 (P0) The document head is cut short on every page

- Evidence: on /en/, /ru/, blog index, posts and talks the browser DOM has `og:image:height`, `article:published_time`, `og:url`, `og:locale`, `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt` in `<body>`, and the text "!Astro.props.image &&" as the first body node (`head-check.mjs`, `data/en-home.html`). `document.head.querySelector('meta[name="twitter:card"]')` is null. Social crawlers that take only `<head>` (some of them do) see no `og:url`, no `twitter:card`, no `article:published_time`. The October smoke test only checks `og:image` and hreflang, both still in the head.
- Root cause (reproduced with the Astro compiler 2.13.1 on `BaseLayout.astro`, without a build): the `<noscript><style>` block inside `<head>` (`BaseLayout.astro:66-70`) makes the compiler emit `</head>` before the next expression that contains markup (`{!Astro.props.image && <meta .../>}`), and the following expression is output as literal text. Introduced in commit 16c1319 (2026-10-03). Moving the `<noscript>` block to the end of `<head>`, just before `</head>`, or removing it, gives `og:url after </head>: false`, `twitter:card after </head>: false`, `leaked text: false` (script `compile4.mjs`).
- Proposal: move the `<noscript>` block to the end of the head (it only needs to exist, order does not matter). Alternatively replace it with `html:not(.js) .animate-on-scroll { opacity: 1 }` and a one-line `document.documentElement.classList.add('js')` in the head. Add a smoke test:
  ```ts
  test('social metadata lives in <head> and no template text leaks', async ({ page }) => {
    for (const path of ['/en/', '/ru/', '/en/blog/hello-world/', '/en/speaking/2023-reinvent-cdk8s/']) {
      await page.goto(path);
      for (const sel of ['meta[property="og:url"]', 'meta[property="og:locale"]', 'meta[name="twitter:card"]', 'meta[name="twitter:image"]'])
        await expect(page.locator(`head ${sel}`)).toHaveCount(1);
      expect(await page.locator('body').innerText()).not.toContain('Astro.props');
    }
  });
  ```
  After the fix, re-check with the LinkedIn Post Inspector and the X card validator.
- Effort: S. Needs Viktor: no. Deploy only with publication authorization.

#### S-02 No RSS

See I-07. Add the alternate link in the layout once the feed exists.

#### S-03 No structured data

- Evidence: `application/ld+json` count 0 on all 56 pages.
- Proposal (JSON-LD, built in `BaseLayout`, escape the less-than sign as the six characters backslash, u, 0, 0, 3, c, per AGENTS.md):
  - Home: `Person` (name, jobTitle "Senior Solutions Architect", worksFor Amazon Web Services, `sameAs` from `socialLinks`, `knowsAbout`), plus `WebSite`.
  - Posts: `BlogPosting` (headline, datePublished, dateModified, author, image, inLanguage, `mainEntityOfPage`).
  - Talks: `Event` (name, startDate, location with city, performer) only where the date and place are certain; otherwise `CreativeWork`.
  - Book: `Book` with `author` ×2, `isbn` 9781835460030, publisher Packt.
  - Podcasts: `PodcastSeries` ×2 once they have pages.
  - `BreadcrumbList` on posts and talks.
- Effort: M. Needs Viktor: no (facts are already on the site).

#### S-04 Open Graph and Twitter

- Every post except the RCA post, and every talk, shares the same card (`/og-default.png`, the person card). Link previews of different posts look identical.
- Missing: `og:site_name`, `og:locale:alternate`, `article:modified_time` (rewritten posts keep their original date; there is no `updated` field in the schema), `article:tag`, `twitter:creator`.
- Proposal: generate a card per post and talk at build time with the existing `scripts/generate-social-card.mjs` approach (SVG template + `sharp`, no new dependency): title in Space Grotesk, date and tags in mono, brand colors. Add an optional `updated` date to the blog schema, render "Updated 5 Oct 2026" under the date, and emit `article:modified_time` and `dateModified`.
- Effort: M. Needs Viktor: no.

#### S-05 Titles, descriptions, U+2014

- Titles over 60 characters (title + " · Viktor Vedmich", SERP shows about 60): 33 of 53 pages. Longest: RU latency post 100, EN latency post 88, `2025-devopsdays-tashkent-mcp` 85 (EN), 91 (RU), `2023-reinvent-cdk8s` 84.
- Descriptions over 160 characters: EN Gateway 206, EN RCA 243, RU Gateway 217, RU RCA 269, Pod Pending 207 (unlisted). The two decks: description 298 characters wrapped in literal quotes (S-07).
- U+2014 inside meta text: the EN and RU blog index descriptions (`src/pages/en/blog/index.astro:17`, `ru/blog/index.astro:17`); AGENTS.md forbids it in new prose.
- Proposals: add optional `seo_title` (at most 60) and `seo_description` (at most 155) to the blog and speaking schemas, fall back to the current fields. Replacements: EN blog index "Notes on Kubernetes, cloud architecture and AI agents from Viktor Vedmich, Senior Solutions Architect at AWS." RU «Заметки про Kubernetes, облачную архитектуру и AI-агентов. Пишет Виктор Ведмич, Senior Solutions Architect в AWS.»
- Effort: S to M.

#### S-06 Sitemap, canonical, hreflang

- Sitemap (53 URLs) includes `https://vedmich.dev/` whose canonical is `/en/` (a redirect shell); it has no `lastmod` and no `xhtml:link` alternates (`@astrojs/sitemap` supports `i18n` option). Decks under `/slides/` are not listed (sitemap only sees Astro routes).
- hreflang pairs and canonical are correct on every checked page; `x-default` exists only on `/`. Add `x-default` → the EN URL on every EN/RU pair.
- The post pages link back with `href="/en/blog"` and `href="/ru/blog"` (no trailing slash; `src/pages/en/blog/[...slug].astro:34`, `src/pages/ru/blog/[...slug].astro:44`), and the RCA posts link to the MCP post without the slash (EN and RU): each costs one redirect hop on GitHub Pages (link check, 4 distinct URLs). Use trailing slashes.
- Effort: S.

#### S-07 The decks' own metadata

- Evidence: the live Slidev pages have `<title>Kubernetes Gateway API: From Zero to Hero - Slidev</title>` (suffix "- Slidev"), `og:title` with the same suffix, `description` wrapped in literal quotes with `\n` escapes (298 characters), `author` with literal quotes, no `og:image`, no canonical, no `twitter:card`. The RCA deck has a 106-character title and no description. Shared deck links show a plain unbranded preview.
- Cause: headmatter in the deck repo (`vedmichv/slidev`), not in this repo; generated assets must not be edited here (AGENTS.md).
- Proposal: in the deck headmatter, use a short `title`, an unquoted one-line `description`, `seoMeta` with `ogImage` and `ogUrl` (Slidev supports it), and set `htmlAttrs`. Do it once in the theme/template.
- Effort: S per deck, in the other repo. Needs Viktor: no.

#### S-08 404 and robots

- 404: `noindex`, real 404 status, URL retained; EN only (C-10). `robots.txt` allows all and lists the sitemap index. Fine.
- Deep links `/slides/<slug>/<n>` used inside the Gateway and RCA posts (17 distinct links) return HTTP 404 and are rescued by the client-side shell in `404.astro` (verified: `/slides/k8s-gateway-api/6?clicks=0` renders slide 6 of 40). It works for people. Crawlers and link previewers see a 404. Acceptable; if it matters, link posts to the deck root with a visible "slide 6" label.

#### S-09 No measurement

- Evidence: no analytics script, no verification meta tag. Viktor cannot see which posts or talks people read, and the rewrite priorities in this review are partly guesses.
- Proposal: Google Search Console and Bing Webmaster Tools with DNS TXT verification (no code), submit `sitemap-index.xml`; optionally GoatCounter or Plausible (cookie-free), or Cloudflare Web Analytics if the DNS moves behind Cloudflare. Mention it in the footer if added.
- Effort: S. Needs Viktor: yes (decision 8).

---

### 3.6 Performance and privacy

#### P-01 Page weight and timing (data/perf.json; mobile viewport 390x844, DPR 2, no CPU throttling)

| Page | Requests | Transfer | LCP | CLS | Notes |
|---|---|---|---|---|---|
| /en/ | 14 | 370 KB | 136 ms | 0 | woff2 154 KB, book cover 141 KB, DKT logo 39 KB, CSS 16 KB, JS 2 KB |
| /ru/ | 14 | 371 KB | 140 ms | 0 | same |
| /en/blog/ | 9 | 123 KB | 100 ms | 0 | |
| Karpenter post | 11 | 184 KB | 144 ms | 0 | |
| Gateway post | 12 | 184 KB | 128 ms | 0 | embeds load Google Fonts (P-04) |
| RCA post | 16 | 771 KB | 108 ms | 0 | `speaker-screen.jpg` 436 KB, deck poster 151 KB |
| Talk page | 11 | 160 KB | 176 ms | 0 | one request to `i.ytimg.com` (thumbnail) |
| Deck (Slidev) | 29 | 362 KB | 572 ms | 0 | JS 261 KB (Vue), request to fonts.googleapis.com |

These are fast-network lab values, not field data. No problems beyond the items below.

#### P-02 Fonts

Eight woff2 files (Inter 400/500/600, Space Grotesk 500/600/700, JetBrains Mono 400/500, 190 KB) on a first visit; only three are preloaded (`BaseLayout.astro`), the rest are discovered late, so the swap happens in two steps (no CLS was measured). With Cyrillic (D-01) the count doubles; variable fonts (Inter and JetBrains Mono ship variable builds; Space Grotesk too) keep it at 3 to 4 files. Effort M, bundled with D-01.

#### P-03 Images

D-09. The RCA post serves 588 KB of JPEG above the fold; add `width`/`height`, `loading="lazy"` for the lower images, and WebP/AVIF through `sharp` at build time. Effort S to M.

#### P-04 Third parties and privacy

- Main pages: none. Talk pages: one request to `i.ytimg.com` for the YouTube thumbnail (the lite embed loads the player only on click), which sends the visitor's IP to Google on page view.
- Embeds in posts load Google Fonts from `fonts.googleapis.com` and `fonts.gstatic.com`: live latency EN and RU (4 + 9 and 4 + 12 requests) and Gateway (7 + 2). 15 files in `public/embeds/` reference them. This contradicts "self-hosted fonts" in AGENTS.md and the site's own no-third-party stance, and it is probably how the RU embeds get Cyrillic (Space Grotesk has none).
- Decks load Google Fonts too (`fonts.googleapis.com`).
- Proposal: point embeds to `/fonts/` once the Cyrillic subsets exist (D-01); for the Slidev theme, bundle the fonts. Add `youtube-nocookie.com` for the player and fetch a local poster instead of the `ytimg` thumbnail if privacy matters (S to M).
- Effort: S to M. Needs Viktor: no (this is an existing project rule).

#### P-05 Caching

GitHub Pages serves everything with `cache-control: max-age=600`, including fingerprinted `/_astro/*.css` and fonts. Repeat visits revalidate every 10 minutes. Only a CDN in front (Cloudflare) would allow `immutable`; not worth a migration alone. Note only.

#### P-06 JavaScript

About 2 KB of module JS plus small inline scripts (header, search, contact, reveal). No framework. Good; keep it.

---

### 3.7 Technical health from the repository

#### T-01 Dependency age (do not upgrade now; plan)

| Package | Installed | Latest on npm | Gap |
|---|---|---|---|
| astro | 5.18.0 | 7.4.7 | two majors |
| @astrojs/mdx | 4.3.14 | 8.1.3 | four majors |
| @astrojs/sitemap | 3.7.0 | 3.7.4 | patch |
| tailwindcss / @tailwindcss/vite | 4.2.1 | 4.3.5 | minor |
| @tailwindcss/typography | 0.5.19 | 0.5.20 | patch |
| @playwright/test | 1.59.1 | 1.65.0 | six minors |
| sharp | 0.34.5 | 0.35.5 | minor |
| astro-icon | 1.1.5 | 1.2.0 | minor |
| Node (CI, .nvmrc) | 22 | | Check the Node 22 end-of-life date (spring 2027) before planning |

No Dependabot or Renovate configuration (`.github/` has only `workflows/`). The October audit reported 22 affected packages; re-run `npm audit` when planning, none of it affects the static output directly. A migration to the current Astro line is its own project (content layer, MDX, Shiki palette test, SVG exporter, screenshots), and the head bug (S-01) is a compiler quirk worth re-testing on the new version. Enable Dependabot security updates now (S, decision).

#### T-02 Test gaps, and what each would have caught

| Gap | Would catch |
|---|---|
| Assert head metadata for each page type: `og:url`, `og:locale`, `twitter:*`, `article:*`, canonical and hreflang pairs are inside `<head>`; body text has no template leaks | S-01 (the live bug) |
| 320 px overflow on every post and talk route (existing test covers the header only) | The Karpenter overflow |
| RU/EN parity: same slug sets for blog and speaking, reciprocal hreflang | Drift between locales |
| Link checker for internal links (trailing slashes, missing anchors) and, nightly, external links | `/en/blog` redirects, rotten URLs |
| Contrast check on tag components (axe-core in Playwright, `@axe-core/playwright` is a new dev dependency: ask) | A-02 |
| Feed validity and unlisted-exclusion once RSS exists | Leaking drafts through the feed |
| JSON-LD parse and `<` escaping once structured data exists | |
| Post-deploy check of the live URL (head metadata, one deck deep link) | A broken deploy or deck shell |

#### T-03 CI and deploy notes (`.github/workflows/`)

- The production build runs twice in `deploy.yml`: `npm run build` and again inside the Playwright `webServer` command (`npm run build && npm run preview`). About a minute saved by building once and using `PLAYWRIGHT_BASE_URL` against `npm run preview`.
- Smoke tests run before the whitelisted decks are copied to `dist/slides/`, so deck availability and the 404 deep link are tested only with a mocked shell. Copy decks first, then test, or add a post-deploy job that requests the live site.
- No post-deploy verification step (the `deploy` job ends at `actions/deploy-pages`).
- No scheduled run. A weekly cron on `deploy.yml` would refresh the footer year and any build-time statistics (C-02, I-04).
- `check.yml` skips the visual suite (documented); fine.
- Actions are pinned to major tags (`@v4`), not SHAs: acceptable for a personal site.
- The whitelist copies `vv-demo` (internal showcase) to production (I-08).
- Type check: still none (October item 2). If tooling dependencies are acceptable, `@astrojs/check` + `typescript` give the first real signal on the `.astro` files; the `{!x && <meta/>}` quirk is not a type problem and needs the head test above.

#### T-04 Data hygiene seen while reading the source

- Slug and date disagree: `2026-genai-mcp-systems` and `2026-karpenter-scalability` are dated 2025-07-01 (Code Europe 2025) and listed under 2025. Slugs must stay (AGENTS.md); keep in mind when linking.
- `certifications` and `socialLinks[].icon` in `src/data/social.ts` are not used by any component.
- Blog schema has no `updated` date; rewritten posts keep their original date (the MCP post dated 2 March 2026 describes the 2026-07-28 spec).
- Sitemap filter reads only top-level files with a regex and is silent for `draft: true # comment` (October item 4).
- Speaking drafts are filtered on the home and the index but individual speaking pages for drafts are still built (`getStaticPaths` includes drafts and `noindex` is set); consistent with the blog policy, just undocumented in content-workflow.md.

---

## Appendix A: the P0 fix, as a patch description (not applied)

In `src/layouts/BaseLayout.astro`, remove lines 66 to 70 (`<noscript><style>.animate-on-scroll { opacity: 1 !important; }</style></noscript>`) from the middle of the head and re-insert them immediately before `</head>`. Compiler check: after the move, none of `og:url`, `twitter:card`, `article:published_time` are emitted after the `</head>` marker and no template text is printed as literal output (`compile4.mjs`). Then `npm run build`, the new head test (S-01) and `npm run test:smoke`.

## Appendix B: evidence index

| What | File |
|---|---|
| Head and body metadata, per page | `data/meta.json`, `head-check.mjs`, `data/en-home.html` |
| Stray text, header hidden | `shots/01-stray-text-header-hidden.png` |
| Compiler reproduction | `compile.mjs`, `compile2.mjs`, `compile3.mjs`, `compile4.mjs` |
| Layout at 320/390/768/1440 (EN, RU) | `shots/<page>-<lang>-<width>.png`, `shots/crops/`, `data/layout-report.json` |
| Section edges and heading sizes | `edges.mjs` |
| Fonts audit | `fonts.mjs` |
| Contrast | `pix.mjs`, `pix3.mjs`, `data/contrast.json` |
| Keyboard and landmarks | `a11y.mjs`, `data/a11y.json`, `shots/02-*`, `shots/03-*` |
| Search | `search-test.mjs`, `shots/04-search-en.png` |
| Contact state | `misc.mjs`, `shots/05-contact-form-en.png` |
| 404 (RU path) | `shots/06-404-ru-path.png` |
| Post structure, inline code | `post-check.mjs`, `shots/07-post-end-en.png` |
| Header widths | `header.mjs`, `shots/08-*` |
| Deck deep link | `deck.mjs`, `shots/09-deck-deeplink-6.png` |
| Performance | `perf.mjs`, `data/perf.json` |
| Third parties | `thirdparty.mjs` |
| Links | `links.mjs`, `data/links-bad.json` |
| Proposed copy checks | `tmp/ru-proposals.txt`, `tmp/en-proposals.txt` |

## Appendix C: public sources used for fact checks (read 2026-11-09)

- DKT: https://dk-t.dev/ (platform list, episode numbering), https://devopskitchentalks.podbean.com (DKT100 dated 2026-07-16).
- AWS на русском: search results for episodes 067 (2 April 2026), 072 and 074 (October 2026); Podbean hosting; Apple Podcasts id1600771698.
- Book: https://www.packtpub.com/product/cracking-the-kubernetes-interview/9781835460030, reviews at dev.to (aairom) and Medium (Alain Airom), Goodreads author page.
- Speaking leads: https://dk-t.dev/slides/agent-instead-of-oncall, https://devsummit.infoq.com/speakers/viktorvedmich, https://www.awscommunityadria.com/speakers/viktor-vedmich, Viktor's LinkedIn post for AWS Summit Warsaw.
- Credly badge: https://www.credly.com/badges/29c4754e-7a00-46aa-bc2d-4aabe735f4a3/public_url (HTTP 200).
- npm registry latest versions (T-01).
