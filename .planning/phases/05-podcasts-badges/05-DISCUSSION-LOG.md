# Phase 5: Podcasts — DKT teal + AWS RU amber badges — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 05-podcasts-badges
**Areas discussed:** DKT logo fate, Card structure, Stats styling, Click interaction, AWS RU badge text, Section title i18n

---

## Gray-area selection

| Option | Description | Selected |
|---|---|---|
| Судьба DKT PNG-логотипа | a) drop PNG → pure text badge; b) hybrid — keep PNG + add badge; c) drop here, keep asset | ✓ |
| Структура карточки (horizontal → vertical) | Full rewrite to vertical stack vs just icon swap in current flex | ✓ |
| Stats — accent color vs muted | Ref-faithful muted mono vs keep accent-colored emphasis | ✓ |
| Паттерн интеракции карточки | Whole-card link, ref static div + ghost button, or hybrid | ✓ |

**User free-text note:** "Да важно быть в оригинау но не надо все повторять - вот с лого на DKT кажется надо оставить"

**Interpretation:** ref-faithful as baseline, but DKT PNG logo stays (brand recognition > text badge).

---

## DKT logo fate

| Option | Description | Selected |
|---|---|---|
| DKT: лого + teal-badge; AWS RU: amber-badge | Both cards get badges; DKT also shows logo | |
| DKT: только лого; AWS RU: amber-badge | Asymmetric: DKT relies on logo recognition, AWS RU gets text badge | ✓ |
| Обе симметрично: лого+бейдж | Requires AWS asset (forbidden — AWS orange is employer brand) | |

**User's choice:** DKT: только лого; AWS RU: amber-badge
**Notes:** Asymmetric by design — DKT has a brand asset, AWS RU doesn't. Ref mockup used text badges only because logos weren't available in the mockup source.

---

## Card structure

| Option | Description | Selected |
|---|---|---|
| Вертикальный стек по референсу (но DKT с лого) | Badge/logo → title → desc → stats → Listen; ref-faithful structure | ✓ |
| Horizontal flex (сохранить текущий) | Icon/badge left, text block right — not ref-faithful but logos look bigger | |
| Гибрид: вертикаль с выравниванием по высоте | Force logo and badge into same-height slot for visual parity | |

**User's choice:** Вертикальный стек по референсу (но DKT с лого)
**Notes:** Full rewrite to match reference layout. Logo occupies the badge slot in DKT card.

---

## Stats styling

| Option | Description | Selected |
|---|---|---|
| Mono muted (ref-faithful) | `font-mono text-xs text-text-muted` — ref exactly | ✓ |
| Цветной акцент (teal/amber) | Current: text-accent/70 DKT, text-warm/70 AWS RU — emphasizes social proof | |
| Mono + цветной гибрид | Mono font, but accent color — middle ground | |

**User's choice:** Mono muted (ref-faithful)
**Notes:** Drops the current emphasis on numeric social proof in favor of ref-faithful tech-metadata look.

---

## Click interaction

| Option | Description | Selected |
|---|---|---|
| Whole-card link + 'Listen →' footer-строка | Existing pattern: whole `<a>`, footer row with arrow icon (no button) | ✓ |
| Ref-паттерн: static div + ghost button | Static card, only ghost button is clickable | |
| Гибрид: whole-card + nested ghost button | Invalid HTML (nested `<a>`), rejected | |

**User's choice:** Whole-card link + 'Listen →' footer-строка
**Notes:** Fitts's law (big target). Keeps Zero-JS. Footer row reads as affordance without adding Button component.

---

## AWS RU badge text

| Option | Description | Selected |
|---|---|---|
| 'AWS RU' (реф-точно) | 6 chars, locale-invariant, matches Phase 4 brand-name pattern | ✓ |
| 'AWS на русском' | 15 chars — too long for 11px uppercase badge | |

**User's choice:** 'AWS RU' (реф-точно)
**Notes:** Locale-invariant brand tag, consistent with `CNCF Kubestronaut` / `DKT` precedent.

---

## Section title i18n

| Option | Description | Selected |
|---|---|---|
| Оставить локализацию (Podcasts / Подкасты) | Current pattern, consistent with other sections | ✓ |
| 'Podcasts' везде (ref-faithful) | Ref shows English; /ru/ users would see EN among RU | |

**User's choice:** Оставить локализацию
**Notes:** Consistent with Phase 3/4 bilingual pattern.

---

## Claude's Discretion

- Exact badge background opacity (`bg-brand-accent-soft` token vs `bg-brand-accent/10` arbitrary).
- Height chrome for DKT logo (current `w-14 h-14 rounded-xl bg-white/95 p-1 ring-1 ring-border` vs slimmer).
- Component organization — two explicit card blocks (preferred) vs keeping `podcasts[]` map with badge-slot field.
- `AWS RU` badge `leading-none` vs default line-height for baseline alignment.

## Deferred Ideas

- Extract Badge primitive into `src/components/Badge.astro` if Phase 6 (Book PACKT label) surfaces a second consumer.
- Dynamic podcast stat counts from YouTube/Spotify APIs (out of scope for v0.4).
- Equal-height logo/badge slot normalization (only if visual verify flags it — user said "don't overdo ref").
