# k8s-gateway-api — publish deck + companion article (design)

**Date:** 2026-06-06
**Author:** Viktor Vedmich (via Claude)
**Status:** approved-in-conversation → ready for plan

## Goal

Two sequenced deliverables for the `k8s-gateway-api` Slidev deck (40 slides, vendor-neutral
"zero-to-hero" Kubernetes Gateway API concept deck, authored in `slidev-theme-vv`):

1. **Publish the deck** to a first-party route `vedmich.dev/slides/k8s-gateway-api/`.
2. **Write a bilingual companion article** (EN + RU) on the vedmich.dev blog that reuses the deck's
   slides — embedding the animation/diagram slides as live iframes and the code slides as Shiki
   blocks — rather than re-describing them in prose.

Task 1 ships first so the article can link (and embed) a live deck URL.

## Decisions (locked with Viktor)

| Topic | Decision |
|-------|----------|
| Presentation card | **Evergreen explainer** — `event: "Concept deck · Technical deep-dive"`, `city: null`, `date: 2026-06-06`, no `slides:` override (auto-resolves to `/slides/k8s-gateway-api/`). Not tied to a real event. |
| Article angle | **Expanded narrative** — full prose following the deck's zero-to-hero arc, deeper than slide captions. Modeled on the karpenter companion post. |
| Languages | **EN + RU both**, authored together (site convention = bilingual parity). |
| Slide reuse | **Reuse the deck heavily.** Code slides → Shiki code blocks inline. Animation/diagram slides → **live lazy iframes** (~7 of them) so animation + interactivity survive. |
| Embed mechanism | **Live `<iframe>` on our own domain**, 16:9 responsive, `loading="lazy"`, via a thin reusable `SlideEmbed.astro` component. Always in sync with the deployed deck; zero production assets to maintain. |
| Embed scope | **~7 animation/diagram slides:** 6 (request path), 14 (assembled journey), 15 (who owns what), 25 (canary split), 30 (ReferenceGrant deny→grant), 33 (GAMMA mesh), 34 (capstone arch). Concept slides stay prose; code slides stay Shiki blocks. |
| Diagram SVGs | **Deferred.** No bespoke SVG production this pass — embeds + code carry the visuals. |

## Task 1 — Publish the deck

Process = the hardened autopilot `~/Documents/GitHub/vedmich/vedmich.dev/scripts/deploy-deck.sh`
(canonical WHY = `docs/slides-onboarding.md`). Steps:

1. **Commit deck source** in `slidev-theme-vv` — `presentations/k8s-gateway-api/` is currently
   untracked. Commit it + `POLISH.md` so the build is reproducible. (Also: the long-uncommitted
   `layouts/cover.vue` change — commit it in the same housekeeping pass or call it out.)
2. **Pre-create both cards** `src/content/presentations/{en,ru}/k8s-gateway-api.md` as `draft: true`
   with the evergreen metadata above. Bilingual parity is a hard precondition of the autopilot.
3. **Dry-run** `deploy-deck.sh --slug k8s-gateway-api --theme slidev-theme-vv --dry-run` — read-only,
   prints every diff. Inspect.
4. **Real run** (drop `--dry-run`). The script: builds `--base /slides/k8s-gateway-api/`, pushes
   `dist/` to `vedmichv/slidev:gh-pages`, pins the submodule to that exact SHA, appends the whitelist
   sentinel, un-drafts both cards, makes ONE atomic `main` commit, polls the Pages run, curl-gates the
   live root (auto-reverts on miss).
5. **Verify live** — `/slides/k8s-gateway-api/`, a deep-link (`/10`), `/presenter/`.

## Task 2 — Companion article

- **Files:** `src/content/blog/{en,ru}/2026-06-06-kubernetes-gateway-api-zero-to-hero.mdx`
- **Format:** `.mdx` (enables the `SlideEmbed` component + Shiki `[!code highlight]` blocks).
- **Frontmatter:** `title`, `description`, `date: 2026-06-06`, `tags: ["kubernetes","gateway-api","networking"]`,
  `draft: false`. (Schema: blog collection in `src/content.config.ts`.)

### SlideEmbed.astro (new component)

Thin wrapper: props `slug` (default `k8s-gateway-api`), `slide` (number), `title`, optional
`clicks`/aspect. Renders a 16:9 responsive container with `<iframe src="/slides/{slug}/{slide}"
loading="lazy" title={title}>`. Caption below. No deck deps pulled into Astro (iframe = pure URL).
Verified against the live `vv-demo` deck BEFORE writing prose (see plan Task 2.0).

### Section map (deck arc → article)

| § | Article section | Slides reused | How |
|---|-----------------|---------------|-----|
| 1 | Hook: Ingress is done | 2-3, 8, 36 | prose; key line quoted |
| 2 | How a request reaches a Pod | **6** | live embed + prose |
| 3 | Why Ingress wasn't enough | 7 | prose (3-4 pain points) |
| 4 | The four resources | 10-13 + **15** (who owns what) | prose + 1 embed; ownership model |
| 5 | Assemble the journey | **14** | live embed (the full path animation) |
| 6 | Hands-on: route the shop | 17-21 | Shiki code blocks (install/gateway/route/verify) |
| 7 | HTTPRoute mastery | 23-24, **25** (canary), 26 (filters) | prose + 1 embed + Shiki |
| 8 | Production | 28 (TLS Shiki), 29, **30** (ReferenceGrant) | prose + Shiki + 1 embed |
| 9 | Beyond HTTP + the mesh | 32, **33** (GAMMA) | prose + 1 embed |
| 10 | Reality check + recap | 36-39, **34** (capstone) | prose + 1 embed; CTA → full deck |

~7 live embeds (slides 6, 14, 15, 25, 30, 33, 34), ~6 Shiki code blocks, prose throughout.

### Voice / house rules (from site CLAUDE.md + memory)

- Anti-AI writing: no em dashes, no Unicode bold, ban buzzwords, contractions + first-person SA
  experience. RU and EN are independent good prose, not machine translations of each other.
- Code blocks reuse the comments we just authored on the deck (the 2-line `#` rationale per block).
- Every embed has a descriptive caption; iframes carry a `title` for a11y.

### Verify

`npm run build` clean (MDX + new component compile), both locale routes render, embeds load lazily
and point at the live deck, Shiki highlighting intact, no em dashes.

## Sequencing & gates

1. Task 1 fully (deck live) → 2. Task 2.0 de-risk `SlideEmbed` on `vv-demo` → 3. Task 2 article.
- **Checkpoint A:** after Task 1 dry-run, before the real push.
- **Checkpoint B:** after `SlideEmbed` verified on vv-demo, before writing all prose.

## Out of scope

Bespoke SVG diagrams; `s.vedmich.dev` legacy surface; `PresentationCard.astro` `displayUrl` known
issue; any change to the deck's slide content beyond what's already committed.
