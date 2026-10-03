# Content workflow

## Authoritative sources

`src/content.config.ts` defines frontmatter. UI translations live in
`src/i18n/en.json` and `ru.json`. Talks and presentation cards are Content
Collections, not arrays in `src/data/social.ts`.

## Blog posts

Create `src/content/blog/{en,ru}/<slug>.md` or `.mdx`:

```yaml
---
title: "A concrete technical topic"
description: "A useful standalone summary of the article."
date: 2026-10-03
tags: ["kubernetes", "architecture"]
draft: true
---
```

The route is `/{locale}/blog/<slug>/`. `author` defaults to Viktor Vedmich; the
RU page localizes this default in the byline. Optional fields are `reading_time`
and `cover_image`. The latter overrides the default social image. Otherwise the
site uses `public/og-default.png`, generated from its editable SVG source by
`node scripts/generate-social-card.mjs`. Blog pages emit article metadata.

The layout supplies H1. Start sections at H2. Preserve matching translation
slugs; do not add placeholder translations. Navigation falls back to the target
locale's collection index when a published counterpart is absent. Preserve
existing public slugs.

`draft: true` is a PUBLIC unlisted preview. The direct URL is built, excluded
from homepage/list/search/sitemap, and marked noindex. This is not access
control. Never include private information, credentials, or client material.
Promote only with publication authorization.

Use reusable components for code copying, book links, diagrams, `HtmlEmbed`,
and `SlideEmbed`. Keep images responsive; provide alt text and iframe titles;
respect reduced motion. `HtmlEmbed` assumes trusted same-origin HTML.

## Speaking and presentations

Talks live under `src/content/speaking/{en,ru}/`. Required fields are title,
event, city, date, and tags. Optional video/slides URLs feed detail-page links.
Keep draft visibility consistent when extending the collection.

Decks live under `src/content/presentations/{en,ru}/`. Required fields include
title, event, nullable city, date, description, and tags. Without a `slides:`
override the card points to `/slides/<slug>/`, so the deck must be deployed and
whitelisted before promotion. An external URL is an explicit override. Read
the slide onboarding runbook; do not edit generated files in `slidev/`.

## Obsidian source material

Use public/personal sources only when the task calls for them. The vault is
outside this repository and is not needed to build or test. Prefer targeted
QMD searches when available, then read the source. Verify current paths.

Useful areas include the Kubernetes book, technical knowledge base, published
podcast notes, conference materials, certification notes, and personal
homelab/PKM writing.

Do not source confidential material from `10-AWS/11-Active-Clients/`,
`14-Tips-AWS-Internal/`, or `16-Amazon-Employer/`, including relocated
equivalents. Employer/client confidentiality survives a file move.

Convert Obsidian internal links into explanatory prose or public links. Remove
internal references; verify factual claims and publication rights. Do not invent
credentials, audience counts, ratings, or event details.

## Acceptance

Build, inspect EN/RU content, check metadata/links and narrow screens, and
verify noindex/discovery for drafts. Embeds need rendered-content checks:
a successful request does not prove that a deck or visualization loaded.
Commit intended files only; pushing main is a publication action.
