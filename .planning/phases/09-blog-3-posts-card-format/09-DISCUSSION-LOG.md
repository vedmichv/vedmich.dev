# Phase 9: Blog — 3 posts with correct card format — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `09-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 09-blog-3-posts-card-format
**Areas discussed:** Content sourcing, Card format + BlogPreview, Index/slug pages, RU translation, Publishing flow / reusable skill

---

## Area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Источник контента | QMD vault vs write from scratch; post length + structure | ✓ |
| Card format + прочее | Migration from p-5 bg-bg → p-6 bg-surface + teal badges; zebra rhythm; component extraction | ✓ |
| Index pages + slug pages | Unify `/blog/` and `/blog/[slug]` with new card format | ✓ |
| RU translation strategy | 6 files; full translation vs frontmatter-only vs hybrid | ✓ |
| **Flow публикации (user-added)** | SOP for vault → post → publish; potentially a reusable skill | ✓ |

**User's choice:** All 4 pre-listed areas + added a 5th "prescribe publishing flow".

---

## Content sourcing

### Sub-question 1: Откуда берём контент для 3 постов?

| Option | Description | Selected |
|--------|-------------|----------|
| QMD search + адаптация (Recommended) | Use QMD MCP to search vault per topic, adapt into posts. Exclude confidential paths. Manifests piece written from scratch. | |
| Claude пишет с нуля | Without vault — from general knowledge. Fast but no authentic voice. | |
| Я пришлю drafts сам | User provides drafts/paths. Claude formats and translates. Max authenticity but slow. | |
| Other (free text) | "Просмотреть мои скилы — есть штука которая записывает истории сессий и после этого можно делать статьи — в целом оно базируется на QMD в том числе. Давай сделаем глубже анализ волта и что там сохраняется." | ✓ |

**User's choice:** Free-text → "deeper analysis of vault + skills (session history) → combine."
**Notes:** Triggered deeper investigation — found `recall`, `sync-claude-sessions`, `episodic-memory` skills; found `25.70-Claude-Summaries/` diary with 2026-04-12 through 2026-04-26 entries; confirmed karpenter carousel exists at `45.20-Brand-Kit/carousel-templates/karpenter-1000-clusters/` with stats (1,000+ Salesforce clusters, 70% cost cut, <60s provisioning, 3 traps + 4-step rollout).

### Sub-question 2: Структура каждого поста?

| Option | Description | Selected |
|--------|-------------|----------|
| Short-form: hook + 3-5 sections (Recommended) | ~500-800 words, REQ-002 compliant with a modest ceiling lift. | |
| Long-form tutorial | ~1500-2500 words, deep-dive. | |
| На усмотрение по теме | Karpenter deep with numbers, MCP concise, Manifests opinion. | ✓ |

**User's choice:** "На усмотрение по теме."
**Notes:** Calibration becomes D-06 in CONTEXT.md — Karpenter long, MCP medium, Manifests opinion-sized.

---

## Sourcing deep-dive (after free-text prompt)

### Sub-question 3: Как используем vault при написании?

| Option | Description | Selected |
|--------|-------------|----------|
| Per-post: QMD + diary + skills (Recommended) | Combined vault search + session recall. | |
| Покажи мне drafts перед записью | Draft then review loop. | |
| Создать `gsd-blog-from-vault` skill тоже | Build reusable skill in addition to 3 posts — expands Phase 9 scope. | |
| Other (free text) | "Комбинация по репостке MDDI + skills и типа создать реально потом скилл. Третья штука, надо будет создавать для того, чтобы написать на базе того что у нас есть статьи. Что думаешь?" | ✓ |

**User's choice:** Free-text → combine vault + skills + create a reusable skill.
**Notes:** Transcription "MDDI" is likely "MD" / "MDX" or a typo for "MCP" or a misrecognized word — treated as "markdown + skills + create reusable skill." Led to D-32 through D-40 about `vv-blog-from-vault` project-local skill.

### Sub-question 4: Упоминать ли carousel / доклады как companion?

| Option | Description | Selected |
|--------|-------------|----------|
| Да — пост ссылается на LinkedIn carousel / доклад (Recommended) | Cross-channel promotion. Karpenter post → carousel; MCP post → Warsaw talk. | |
| Нет — blog = самостоятельный | No cross-refs to avoid decay when slides renamed/removed. | |
| Other (free text) | "Может быть как самостоятельным, так и ссылаться. Нужно быть готовым к тому и тому." | ✓ |

**User's choice:** Free-text → both modes supported.
**Notes:** Led to D-08/D-09/D-10 — companion link as optional end-of-post section, skill detects and offers.

---

## Skill/posts split

### Sub-question 5: Как разводим skill и 3 поста?

| Option | Description | Selected |
|--------|-------------|----------|
| Гибрид: skill внутри Phase 9 (Recommended) | 3 waves: (1) card rewrite, (2) build skill, (3) use skill to write 6 posts. 5-6 hours total. | ✓ |
| Разделить: Phase 9 → 3 posts + card, skill в v0.5 | Faster Phase 9 (2-3 hours), skill moves to next milestone. | |
| Сделать skill первым, посты позже | Phase 9 becomes "Blog skill + card format", posts move to Phase 9b / Phase 13. | |

**User's choice:** Гибрид: skill внутри Phase 9 (Recommended).
**Notes:** Locked as D-01/D-02 — 3 sequential waves inside single Phase 9.

---

## Card format

### Sub-question 6: BlogPreview фон секции и цвет карточки?

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror ref: транспарент section + bg-surface cards (Recommended) | ref `app.jsx:553-574` Blog section has no `bg={VV.surface}` — inherits base, cards are surface. Preserves zebra. | ✓ |
| Keep current: `bg-surface/30` section + `bg-bg` cards | Current inverted style, breaks zebra consistency. | |
| bg-surface section + bg-base cards (inverted) | Similar to Presentations but breaks zebra (3 surface sections in a row — Podcasts/Speaking/Presentations already surface). | |

**User's choice:** Mirror ref (Recommended).
**Notes:** D-15 — transparent section, bg-surface cards.

### Sub-question 7: BlogCard extract в отдельный компонент?

| Option | Description | Selected |
|--------|-------------|----------|
| Да: `<BlogCard>` в 3 местах (Recommended) | Mirror Phase 8 `<PresentationCard>`. Used in BlogPreview, index, future related-posts. | ✓ |
| Inline в BlogPreview (как раньше) | No component, duplicate markup. | |

**User's choice:** Extract (Recommended).
**Notes:** D-20.

### Sub-question 8: Unify `/blog/` и slug pages?

| Option | Description | Selected |
|--------|-------------|----------|
| Да — `/blog/` тоже использует BlogCard (Recommended) | Parity with Phase 7/8. Index = same grid as homepage. Slug pages get tag-badge + typography updates. | ✓ |
| Нет — только BlogPreview | Incremental, blog index stays 1-col list. | |

**User's choice:** Unify (Recommended).
**Notes:** D-21, D-22, D-23, D-24.

### Sub-question 9: Схема blog collection — трогаем?

| Option | Description | Selected |
|--------|-------------|----------|
| Не трогаем, tags делаем required (Recommended) | Minimal change: `tags` `.optional()` → required. Consistent with speaking/presentations. | ✓ |
| Добавить поля (author/reading_time/cover_image) | Full forward-looking schema. | (partially — see below) |

**User's choice:** Tighten tags to required (Recommended).
**Notes:** D-25. BUT next question (slug-page update) selected reading_time + author, so schema extended additively with those fields as optional (D-25 note).

---

## Slug + index pages

### Sub-question 10: Slug page — что меняем? (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Tag badges → teal (D-01 стиль) (Recommended) | Consistency with cards. | ✓ |
| Типография h1 → display-36 font-display | Bigger display, tighter tracking. | ✓ |
| Mono date overline вместо text-sm | Match card overline style. | ✓ |
| Reading time + author (с skill впередёд) | Forward-looking metadata. | ✓ |

**User's choice:** All 4.
**Notes:** Led to D-23, D-25 schema additions, D-28 header rendering, D-42 new i18n keys.

### Sub-question 11: /blog/ index page layout?

| Option | Description | Selected |
|--------|-------------|----------|
| 3-col grid (= homepage BlogPreview) (Recommended) | Parity with Phase 7/8 index pages. | ✓ |
| 1-col лента | Keep current vertical list layout. | |

**User's choice:** 3-col grid (Recommended).
**Notes:** D-21.

---

## RU translation

### Sub-question 12: RU перевод 3 постов?

| Option | Description | Selected |
|--------|-------------|----------|
| Полный перевод body (Recommended) | Like hello-world.md. Tech terms stay English. | ✓ |
| RU frontmatter переведен, body EN | Like Phase 8 presentations. Poor for blog prose. | |
| Гибрид по теме | Karpenter + MCP full; Manifests opinion EN-only. | |

**User's choice:** Full translation (Recommended).
**Notes:** D-29, D-30 rules.

### Sub-question 13: Стиль blog voice?

| Option | Description | Selected |
|--------|-------------|----------|
| Тех-эксперт от первого лица (Recommended) | AWS SA experience voice. | ✓ |
| Punchy opinionated (Manifests style) | Short sentences, strong claims. | |
| Neutral tutorial-style | Objective, no strong "я". | |

**User's choice:** Tech-expert first-person (Recommended).
**Notes:** D-31.

---

## Publishing flow / skill design

### Sub-question 14: Что входит в `vv-blog-from-vault` skill? (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Vault search → extract sources (Recommended) | QMD/Grep, exclude confidential. | ✓ |
| Session-history + recall integration (Recommended) | For opinion posts. | ✓ |
| Draft generation (EN + RU) (Recommended) | Frontmatter + body in both locales. | ✓ |
| Companion link management | Auto-suggest carousel/talk links. | ✓ |
| Other (free text) | "Также продумать где должны быть схемы — excalidraw, может картинки — может схему её или анимационные схемы надо помочь, подсказать, показать, направить, и если что сгенерировать. Многое есть в презентациях уже по анимациям. Скорее всего будут добавляться скиллы которые позволят это сделать." | ✓ |

**User's choice:** All 4 + free-text addition → visuals/diagrams/animations routing.
**Notes:** D-34, D-37, D-38, D-39, D-40. Led to image-prompt generation for NanoBanana/GPTImage in next question.

### Sub-question 15: Publishing flow (post-draft)?

| Option | Description | Selected |
|--------|-------------|----------|
| Непрямо в скилл: verify + push (Recommended) | Build + screenshot + commit + push + report. | ✓ |
| Только до draft — push вручную | Safer with review loop. | |
| Interactive wizard | Question-by-question construction. | |

**User's choice:** In-skill verify + push (Recommended).
**Notes:** D-34 (verify+push step), D-43 (CLAUDE.md publishing authority), D-44 (atomic asset commit).

### Sub-question 16: Где живет skill?

| Option | Description | Selected |
|--------|-------------|----------|
| Project-local `.claude/skills/vv-blog-from-vault/` (Recommended) | Committed with repo. | ✓ |
| Global `~/.claude/skills/vv-blog/` | Rides with vv-* family. | |
| Hybrid project-local + symlink from global | Over-engineering for MVP. | |

**User's choice:** Project-local (Recommended).
**Notes:** D-32.

### Sub-question 17: Интеграция схем/картинок/анимаций? (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Анализ «где нужна схема?» (Recommended) | Skill scans draft for visual-worthy patterns. | ✓ |
| Поиск готовых ассетов в vault и presentations (Recommended) | Reuse before generate. | ✓ |
| Предлагать route to skills (Recommended) | Delegate to mermaid-pro / excalidraw / art / viktor-vedmich-design. | ✓ |
| Анимации в blog постах (CSS/SVG) | Zero-JS-compatible animations. | ✓ |
| Other (free text) | "Если что либо через NanoBanana or GPTImage генерация картинок, а точнее создание промта для того чтобы лучше всего сделать картинку." | ✓ |

**User's choice:** All 4 + image-prompt generation.
**Notes:** D-36 (delegate pattern), D-37 (visuals-audit heuristics), D-39 (reuse first), D-40 (animations deferred to first real need).

---

## Claude's Discretion (captured separately)

Left to Claude / planner / executor within Wave execution:
- Exact prose wording of the 3 posts (Wave 3) — skill drafts, user reviews on live after push
- mermaid diagram content choice for karpenter post
- Whether to reuse carousel PNG slides as inline images vs fresh mermaid
- SKILL.md description text and trigger phrases
- Script languages (prefer Python per `sync-claude-sessions` precedent)
- Reading-time computation approach (optional-with-fallback vs default-null-with-fill)
- Final tag list per post (start from REQ-002 suggested tags)

---

## Deferred ideas (captured in CONTEXT.md `<deferred>`)

1. RSS feed
2. Obsidian → blog auto-sync daemon (watch mode)
3. Tag filter / archive pages
4. Pagination on /blog/
5. Reading progress / TOC
6. Multi-site syndication (Dev.to, Medium, LinkedIn API)
7. Post cover image rendered at card level
8. CSS/SVG animations inside posts (enabled but not built)
9. MDX migration (only if a specific post needs mermaid)
10. Skill extraction to global `~/.claude/skills/vv-blog/`
11. Companion auto-update when new carousel/talk lands

---

*Discussion log generated: 2026-04-26*
