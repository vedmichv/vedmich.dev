# Phase 8: Presentations — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 08-presentations-match-card-format
**Areas discussed:** Tag badges, All decks placement + data migration scope, Section background, Data shape + padding polish

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Tag badges — teal vs muted | Teal Badge primitive vs current muted chips | ✓ |
| "All decks →" placement | Header inline vs footer ghost button | ✓ |
| Section background | bg-surface vs transparent | ✓ |
| Data shape + padding polish | social.ts shape, card padding, URL tracking | ✓ |

**User's choice:** All four areas selected (multiSelect).
**Notes:** User added freeform note "Помни говорить со мной на русском" — updated memory accordingly.

---

## Tag badges

### Q: Стиль teal Badge — какие tokens используем для bg/border?

| Option | Description | Selected |
|--------|-------------|----------|
| brand-primary-soft/30 + brand-primary | Uses existing design tokens with alpha modifiers | ✓ |
| Точно ref: bg-brand-primary/10 + border-brand-primary/40 | Byte-match ref rgba alpha | |
| Новый token --badge-teal-bg / --badge-teal-border | Introduce dedicated badge tokens in design-tokens.css | |

**User's choice:** `brand-primary-soft/30` + `brand-primary/40` — reuse existing tokens (D-01, D-02).

### Q: Размер текста тегов?

| Option | Description | Selected |
|--------|-------------|----------|
| 11px / 600 / tracking 0.08em | Match Badge primitive byte-for-byte | ✓ |
| 10px (как сейчас) | Change only color, keep current size | |
| 12px/500 (Tailwind text-xs) | Standard Tailwind size | |

**User's choice:** 11px/600/tracking 0.08em — exact ref match (D-01).

---

## "All decks →" placement + index page scope

### Q: Где размещаем "All decks →"?

| Option | Description | Selected |
|--------|-------------|----------|
| Header inline (как сейчас и Speaking) | Consistent with Phase 7, drift from ref | ✓ |
| Footer ghost button (как ref) | Byte-match ref, inconsistent with Speaking | |
| Оба — header link + footer button | Redundant for 6 cards | |

**User's choice:** Header inline — consistency with Phase 7 Speaking pattern beats byte-match to ref (D-04).

### Q: Куда ведёт "All decks →"?

| Option | Description | Selected |
|--------|-------------|----------|
| s.vedmich.dev (как сейчас) | External Slidev index, no new pages | |
| /{locale}/presentations — новая index-страница | Full list on vedmich.dev | ✓ |
| Anchor #presentations | No separate page | |

**User's choice:** `/{locale}/presentations` internal index page (D-05, D-14, D-15).

### Q: Насколько "большая" index-страница?

| Option | Description | Selected |
|--------|-------------|----------|
| Простая full list — те же карточки без лимита | All decks in same grid, reuse component | |
| Content Collection миграция (как Speaking Phase 7) | Full migration: src/content/presentations/{en,ru}/*.md | ✓ |
| Homepage-only: убрать "All decks" | No separate page | |

**User's choice:** Content Collection migration — mirror Phase 7 Speaking pattern (D-06 through D-10).

### Q: Presentations Content Collection schema — какие поля?

| Option | Description | Selected |
|--------|-------------|----------|
| Точно как Speaking: title/event/city/date/tags + slug/video/slides | Consistent with Phase 7 schema | ✓ |
| Минимальный: title/date/event/tags/slug/excerpt | Only current social.ts fields | |
| Unified "Activities" schema — Speaking + Presentations merged | Future Activities Hub vision | |

**User's choice:** Match Speaking schema for consistency (D-08).

### Q: Талки и деки — одна сущность или разные?

| Option | Description | Selected |
|--------|-------------|----------|
| Разные: talk = выступление; deck = слайды | Separate collections, optional cross-link | ✓ |
| Одна: deck = artifact talk'а | Filter speaking.where(t => t.slides) | |

**User's choice:** Separate collections — deck can exist without talk (Slurm online decks) (D-11).

### Q: Individual deck page /{locale}/presentations/{slug} — делаем?

| Option | Description | Selected |
|--------|-------------|----------|
| Тонкие страницы + "Open slides → s.vedmich.dev" | meta/OG only, external redirect to Slidev | |
| Полная миграция Slidev → vedmich.dev/presentations/{slug}/ в Phase 8 | Full integration | (considered) |
| Отложить individual pages — только index + card format | Collection + index, no slug pages | ✓ |

**User's choice:** Option 2 was interest but acknowledged too much for Phase 8. Chose Option 3 with plan to do full Slidev migration as separate phase/milestone.
**Notes:** User said "Я хотел бы сделать 2-ой пункт гное сли снейчас то много то давай сделаем отдьной фазой чтобы не нагромождать ситльно" — clear scope discipline.

### Q: Homepage — сколько деков?

| Option | Description | Selected |
|--------|-------------|----------|
| Latest 6 (как сейчас) | Matches ref subtitle "6 talks" | ✓ |
| Latest 3 (как Blog) | Less homepage noise | |
| Все | Homepage = index | |

**User's choice:** Latest 6 — matches reference subtitle and current state (D-12).

### Q: Сортировка?

| Option | Description | Selected |
|--------|-------------|----------|
| По дате desc (newest first) | Standard chronological | ✓ |
| Группировать по year (как Speaking) | Timeline layout | |

**User's choice:** Date desc — card grid doesn't need timeline grouping (D-12).

---

## Section background

### Q: Presentations section background?

| Option | Description | Selected |
|--------|-------------|----------|
| bg-surface (#1E293B) — точно как ref | Zebra rhythm with Blog below | ✓ |
| Transparent (как сейчас) | Drift from ref | |

**User's choice:** `bg-surface` — matches ref `bg={VV.surface}` (D-17).

---

## Data shape + card polish

### Q: Excerpt — фронтматтер или body?

| Option | Description | Selected |
|--------|-------------|----------|
| description: string в фронтматтере | Predictable, like Blog schema | ✓ |
| Body первые N слов | Auto-extract | |

**User's choice:** Dedicated `description` field in frontmatter (D-08, D-09).

### Q: City — отдельное поле или в event?

| Option | Description | Selected |
|--------|-------------|----------|
| Отдельное поле (как Speaking) | event: 'AWS Community Day', city: 'Bratislava' | ✓ |
| В event строкой (как ref) | event: 'AWS Community Day · Bratislava' | |

**User's choice:** Separate `city: string | null` field — consistent with Speaking (D-08, D-22).

### Q: Card padding + URL line — подогнать к ref?

| Option | Description | Selected |
|--------|-------------|----------|
| Да: p-6 (24) + mono 11 solid teal tracking 0.06em | Byte-match ref Card primitive | ✓ |
| Оставить p-5 (20) | Less mobile bleed risk | |

**User's choice:** Tighten to ref — p-6, 11px solid teal, tracking 0.06em (D-21, D-22).

---

## Cleanup questions

### Q: Убираем export presentations из social.ts?

| Option | Description | Selected |
|--------|-------------|----------|
| Да, убираем (как Speaking Phase 7) | Single source of truth | ✓ |
| Оставляем export для обратной совместимости | Backward compat | |

**User's choice:** Remove — single source of truth (D-25).

### Q: SearchPalette — обновляем на Content Collection query?

| Option | Description | Selected |
|--------|-------------|----------|
| Обновляем на Content Collection query | Scope of Phase 8 | ✓ |
| Отложить в отдельную фазу | Leave social.ts | |

**User's choice:** Update in-phase (D-26).

---

## Claude's Discretion

Deferred to planner / executor:
- Exact `<PresentationCard>` component vs inline JSX choice (recommended component)
- Exact i18n `back_link` reuse (check if Phase 7 created suitable key)
- Exact Tailwind class grouping style
- Excerpt migration — copy verbatim vs touch up (default: copy verbatim)

---

## Deferred Ideas

### Unified Slides migration (future milestone v0.5)
- Migrate all Slidev builds into `vedmich.dev/presentations/{slug}/` as native Astro+Slidev combined build
- Individual deck pages with embedded viewer, full meta, OG, video embeds, PDF download
- `s.vedmich.dev` subdomain: decision on 301 redirect vs retire
- Est. effort: 8-16+ hours — warrants own milestone
- User considered doing in Phase 8 but agreed to split

### Talk ↔ Presentation cross-linking (later)
- If speaking talk `slides` field matches Presentations slug, link internally
- Requires individual deck pages first (Unified Slides milestone)

### Tag filter page (later)
- `/presentations?tag=kubernetes`
- Out of Phase 8 scope

### Pagination on index (later, if >15-20 decks)
- Current: all decks on one page
