# Phase 4: Hero — match reference pixel-for-pixel — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 04-hero-reference-match
**Areas discussed:** h1 mobile, Tagline i18n split, Background, Visual details (cursor + noise), Content strategy (Hero-as-pitch — emerged from user), Rename Kubernaut→Kubestronaut, Authority signals, K8s cert pills, Pill interaction, Speaker pill copy, Podcasts pill copy, CTA strategy, Tagline final, Nav highlight, IO scope, Kubestronaut target, Section height target

---

## Opening strategy shift (user-initiated)

**Signal:** User's freeform note on the first AskUserQuestion ("ЭТО САМАЯ важная часть всего сайта... я спикер reInvent... CNCF kubestronaut!!! КСТАТИ ИМЕНО ТАК ПИШЕТЬСЯ... я автор книги! Я запустил 2 подкаст !!! Может на каждый штуку клики и переходы").

**Impact:** Phase 4 scope widened from "visual pixel-match" to "**Hero as the site's primary pitch** with clickable authority pills". ROADMAP's 15-item typography diff still applies. Content strategy pivoted away from 6 cert pills.

---

## Rename 'CNCF Kubernaut' → 'CNCF Kubestronaut' — scope

| Option | Description | Selected |
|---|---|---|
| Везде в Phase 4 | social.ts + i18n + BaseLayout + CLAUDE.md in single phase commit | ✓ |
| Только Hero + data | Hero.astro + social.ts only | |
| Отдельная микро-фаза | Rename now, Phase 4 later | |

**User's choice:** Везде в Phase 4 (Recommended).
**Notes:** Factology fix — Kubestronaut is the correct CNCF program name.

---

## Authority signals in Hero (replacing 6 cert pills)

| Option | Description | Selected |
|---|---|---|
| re:Invent Speaker 2023 | Link to #speaking, BOA310/4.7 specifics | |
| CNCF Kubestronaut | Teal-active pill, external CNCF link | ✓ |
| Author «Cracking the K8s Interview» | Link to #book | ✓ |
| Host: DKT + AWS RU | Link to #podcasts | ✓ |

**User's choice:** All three above, PLUS re:Invent Speaker — but reframed as broader authority.
**Notes:** User explicit: "не спикер reInvent 2023 а вобще спикер reInvent и также keynote speaker — важно чтоб люди хотели меня купить". Position as conference-grade / keynote-capable speaker, not tied to a single year.

---

## K8s cert pills (CKA/CKS/CKAD/KCNA/KCSA)

| Option | Description | Selected |
|---|---|---|
| Свернуть в один 'Kubestronaut' | Kubestronaut implies all 5 | ✓ |
| Оставить все 6 + новые | 10-12 pills total | |
| Две строки | Signals row + K8s row | |

**User's choice:** Свернуть в один 'Kubestronaut' (Recommended).
**Notes:** Aligns with "не должно занимать много места". Individual cert pills are noise.

---

## Pill interaction pattern

| Option | Description | Selected |
|---|---|---|
| Smooth scroll | `<a href="#section">` — Zero-JS | ✓ |
| Модальный popover | JS-heavy | |
| External only | Uses off-site links | |

**User's choice:** Smooth scroll на секцию (Recommended).
**Notes:** Kubestronaut is the only external link (CNCF page); others scroll in-site.

---

## Speaker pill copy

| Option | Description | Selected |
|---|---|---|
| 're:Invent & Keynote Speaker' | Two signals in one pill | ✓ |
| 'Keynote & re:Invent Speaker' | Keynote emphasis | |
| Два отдельных pill | 5 pills total | |

**User's choice:** 're:Invent & Keynote Speaker' (Recommended).
**Notes:** Compact high-authority signal. Links to #speaking.

---

## Podcasts pill copy

| Option | Description | Selected |
|---|---|---|
| 'Host · DKT + AWS RU' | Brand names | ✓ |
| '2 Podcasts · 10K+ subs' | Numeric metrics | |
| 'Podcast Host' | Minimal | |

**User's choice:** 'Host · DKT + AWS RU' (Recommended).
**Notes:** Metrics go stale; brand names are recognized by the target audience.

---

## CTA buttons

| Option | Description | Selected |
|---|---|---|
| 'Get in touch' + 'Read more →' | Reference version | ✓ |
| 'Book a call' + 'Read my book →' | Sales-y | |
| 'Hire me' + 'See my talks →' | Aggressive (risk: Viktor is AWS FTE) | |

**User's choice:** 'Get in touch' + 'Read more →' (Recommended).
**Notes:** Stays aligned with reference; Viktor is AWS FTE so "Hire me" is inappropriate.

---

## Tagline final

| Option | Description | Selected |
|---|---|---|
| 'Distributed Systems · Kubernetes · AI Engineer' (ref) | Ref-faithful | ✓ |
| 'Architecting distributed AI systems at scale' | Active voice | |
| Skip tagline | Save ~30px | |

**User's choice:** Reference version.
**Notes:** 3-key i18n split (_before / _accent / _after), matches Phase 3 bio pattern.

---

## h1 on mobile (375px)

| Option | Description | Selected |
|---|---|---|
| clamp(40px, 8vw, 64px) | Smooth degrade | ✓ |
| text-[64px] strict | Overflow/wrap on mobile | |
| 2-step breakpoint | Still overflows on 375 | |

**User's choice:** clamp (Recommended).
**Notes:** Canonical 64px at 1440; 40px at 375 keeps "Viktor Vedmich" on one line.

---

## Background strategy

| Option | Description | Selected |
|---|---|---|
| Новый токен --grad-hero-flat | Canonical tokens | ✓ |
| Inline style | Token-free | |
| Перепишем .hero-deep-signal | No new token | |

**User's choice:** Новый токен (Recommended).
**Notes:** Aligned with project rule "never hardcoded hex, always a token".

---

## Noise overlay

| Option | Description | Selected |
|---|---|---|
| Оставить | Prevents banding | ✓ |
| Дропнуть | Strict ref match | |

**User's choice:** Оставить (Recommended).
**Notes:** Real web gradients posterize without noise; reference is a React mockup.

---

## Cursor

| Option | Description | Selected |
|---|---|---|
| Inline '_' | Match ref literally | ✓ |
| CSS '|' | Current implementation | |

**User's choice:** Inline '_' (Recommended).
**Notes:** Matches `app.jsx:394-398` exactly.

---

## Nav active-state highlight (IntersectionObserver)

| Option | Description | Selected |
|---|---|---|
| Не нужно, только scroll | Zero-JS strict | |
| Да, IntersectionObserver | One observer, ~20-30 LOC | ✓ |

**User's choice:** Да, IntersectionObserver.
**Notes:** User override of the recommended option. Hero pills drive this UX — shipping without feedback in nav would be half-baked.

---

## IO scope (which phase)

| Option | Description | Selected |
|---|---|---|
| Включить в Phase 4 | Scope creep but integrated UX | ✓ |
| Новая фаза 4.1 or 12+ | Clean boundaries | |

**User's choice:** Включить в Phase 4.
**Notes:** Treated as integral to Hero pill interaction.

---

## Kubestronaut pill target

| Option | Description | Selected |
|---|---|---|
| CNCF Kubestronaut program | Official program page (external) | ✓ |
| LinkedIn profile | Personal proof | |
| #about section | In-site | |

**User's choice:** CNCF Kubestronaut program (Recommended).
**Notes:** URL — https://www.cncf.io/training/kubestronaut/. Legitimizes the credential.

---

## Section height target

| Option | Description | Selected |
|---|---|---|
| ~520px (ref content + padding) | Ref-matched | ✓ |
| ~420px (compress further) | Tightens but breaks ref | |
| min 520, flex with pills wrap | Grows naturally | |

**User's choice:** ~520px.
**Notes:** User wants ability to "сжимать ещё больше" post-ship if needed. Follow-up pre-approved (drop "Hi, I'm" or tighten paddings to 64/48).

---

## Claude's Discretion

- Cursor animation location — inline `<style>` vs extract to `design-tokens.css`.
- Exact Tailwind syntax for clamp vs two-step breakpoint (prefer clamp, fall back if bug).
- `scroll-margin-top: 80px` on anchor targets to avoid sticky-header overlap.
- Order of 4 Hero pills on the row — proposed order may be re-sorted if wrap looks ugly at 1440px.
- Grep `global.css` for `.typing-cursor` pre-delete to confirm no other consumer.

---

## Deferred Ideas

- Pill popovers with detail (tooltip/modal) — JS-heavy; deferred.
- Podcast metrics in pill — stale data risk.
- Hero CTA → Calendly — requires setup; Phase 10 owns Contact.
- h1 letter-by-letter typing animation — Zero-JS violation.
- Mobile Hero rework — revisit if 375px feels cramped post-ship.
- Section height tightening to ~420px — Phase 4.1 follow-up if 520px feels too tall.
- Remove `.typing-cursor` from `global.css` — micro-cleanup inside Phase 4 after grep.
