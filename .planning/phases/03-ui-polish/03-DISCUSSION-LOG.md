# Phase 3: UI Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 03-ui-polish
**Areas discussed:** WR-03 folding, i18n keys for CTAs, Card hover behavior, Stagger animation, Spacing/typography audit

---

## WR-03 Folding (pre-phase todo triage)

| Option | Description | Selected |
|--------|-------------|----------|
| Влить в Phase 3 (как есть) | Add tests/unit/shiki-palette-guard.test.ts as part of Phase 3. +30 min, closes Phase 2 debt before Phase 4 Excalidraw churn. | ✓ |
| Отложить — не UI polish | Move to a separate maintenance ticket or Phase 2 hotfix. Phase 3 stays pure UI. Debt remains pending. | |
| Удалить todo | Current defense (Playwright + Astro pinned ^5.18.0) is enough. WR-03 = over-engineering. | |

**User's choice:** Влить в Phase 3
**Notes:** `resolves_phase: 03` in the todo frontmatter + 30-min scope + shipping-before-Phase-4-churn risk tipped the decision.

---

## Gray Area Selection (initial multiSelect)

User selected all four proposed areas: i18n keys for CTAs, Card hover effect, Stagger animation scope, Spacing audit depth.

---

## Area 1: i18n Keys for CTAs

### Q1: Naming for CTA link keys

| Option | Description | Selected |
|--------|-------------|----------|
| Оставить all_posts / all_decks (Recommended) | Use existing top-link keys for bottom CTA too. Fix REQUIREMENTS.md drift post-phase. 0 new keys, 0 migrations. | ✓ |
| Переименовать в see_all | blog.all_posts → blog.see_all; presentations.all_decks → presentations.see_all. Literal REQUIREMENTS.md match but +2 migrations per locale. | |
| Два ключа: top + bottom | Top = "All posts →", bottom = "Read more posts →". Different styles for visual hierarchy. +4 keys. | |

**User's choice:** Оставить all_posts / all_decks
**Notes:** Stay with existing keys; correct REQUIREMENTS.md documentation drift post-phase.

### Q2: Bottom CTA text vs top CTA text

| Option | Description | Selected |
|--------|-------------|----------|
| Идентичный (Recommended) | Same text top and bottom ("All posts →" both). Predictable, 0 new keys. | ✓ |
| Разный стиль | Top = subtle muted link; bottom = explicit teal CTA with bigger padding, visual "final beat". Hierarchy via style. | |

**User's choice:** Идентичный

### Q3: Unify CTA style across Blog + Presentations + Speaking

| Option | Description | Selected |
|--------|-------------|----------|
| Да, все 3 секции одинаково (Recommended) | One visual standard for "all X →" links across Blog, Presentations, Speaking. | ✓ |
| Только Blog + Presentations | Strict per REQUIREMENTS.md. Speaking touched only if it falls into POLISH-06 audit. | |

**User's choice:** Да, все 3 секции одинаково

### Q4: Scope of CTA additions vs existing

| Option | Description | Selected |
|--------|-------------|----------|
| Только bottom (Recommended) | Both BlogPreview and Presentations already have top CTA. Phase 3 adds bottom + verifies top unchanged. | ✓ |
| Переделать top CTA тоже | Stylistic refactor into `<SectionHeaderCTA>` component. More work. | |

**User's choice:** Только bottom

### Q5: Mobile behavior for top CTA next to heading

| Option | Description | Selected |
|--------|-------------|----------|
| whitespace-nowrap + truncate title (Recommended) | Current BlogPreview pattern. H2 short enough (Blog, Recent decks). | ✓ |
| Stack column on mobile | flex-col sm:flex-row — CTA drops under heading <640px. Safer for long locales but shifts layout. | |

**User's choice:** whitespace-nowrap + truncate title

---

## Area 2: Card Hover Behavior

### Q1: Extent of hover changes vs existing .card-glow

| Option | Description | Selected |
|--------|-------------|----------|
| Придерживаться reference app.jsx (Recommended) | Reference has border-brand-primary + glow shadow (we have .card-glow) + 250ms cubic-bezier + group-hover title color. No translate-Y, no amber underline. Verify + maybe ease curve update = POLISH-05 done. | ✓ |
| Следовать REQUIREMENTS.md дословно | Add translate-Y lift + amber underline on title to the existing glow. Literal REQUIREMENTS.md match but diverges from reference. | |
| Гибрид — только translate-Y | Subtle 2px lift, no amber underline. Amber on teal title conflicts with bio.accent pattern. | |

**User's choice:** Придерживаться reference app.jsx

### Q2: Speaking fit with unified hover

| Option | Description | Selected |
|--------|-------------|----------|
| Оставить как есть (Recommended) | Speaking = timeline (border-l-2 rows), not card. Title already has hover:text-brand-primary. No card-glow forcing. | ✓ |
| Превратить timeline row в card | Wrap each talk in bg-surface rounded-xl border card-glow. Scope creep. | |
| Hover на year card | Year = static label, not clickable. Drop. | |

**User's choice:** Оставить как есть

### Q3: Transition token standardization

| Option | Description | Selected |
|--------|-------------|----------|
| Оставить transition-normal токен (Recommended) | Current .card-glow uses var(--transition-normal). Verify token matches reference 250ms cubic-bezier — if not, update token (affects whole system). | ✓ |
| Инлайн для card hover | Override .card-glow directly with 250ms cubic-bezier(0.16,1,0.3,1). Token stays for rest of UI. Duplicates value. | |

**User's choice:** Оставить transition-normal токен

### Q4: Update --transition-normal globally (discovered during Q3)

| Option | Description | Selected |
|--------|-------------|----------|
| Обновить --transition-normal на expo-out (Recommended) | 250ms cubic-bezier(0.16, 1, 0.3, 1) matches reference. Expo-out curve. Affects every consumer. | ✓ |
| Оставить ease-out | Drift acceptable, difference barely perceptible. 0 changes but reference not fully matched. | |

**User's choice:** Обновить --transition-normal на expo-out
**Notes:** Token discrepancy discovered: design-tokens.css:235 had `250ms ease-out`, reference has `250ms cubic-bezier(0.16,1,0.3,1)`. User agreed on global update.

### Q5: CSS transition prop list vs `transition: all`

| Option | Description | Selected |
|--------|-------------|----------|
| Оставить точечный list (Recommended) | `transition: box-shadow var(--transition-normal), border-color var(--transition-normal);` Browser-safe, doesn't animate random children properties. | ✓ |
| transition: all 250ms ease | Matches reference simpler form. Can animate group-hover:text-brand-primary on h3 unintentionally. | |

**User's choice:** Оставить точечный list

### Q6: Title hover affordance

| Option | Description | Selected |
|--------|-------------|----------|
| Нет — оставить (Recommended) | Reference Card doesn't change title inside — only border + glow. Our group-hover:text-brand-primary is additive, doesn't break ref. OK. | ✓ |
| Amber underline всё-таки | Adds visual affordance but mixes 2 brand colors on one element (teal text + amber underline). Conflicts with About.bio amber accent. | |
| Разделить по секциям | Blog = teal title + teal glow. Presentations = amber accent (matches amber slug URL). Asymmetric — scope creep. | |

**User's choice:** Нет — оставить

---

## Area 3: Stagger Animation

### Q1: Cascade scope

| Option | Description | Selected |
|--------|-------------|----------|
| Только карточки в grid (Recommended) | Heading + subtitle appear together; cards stagger 60ms per child. Simple, feels natural on fast scroll. | ✓ |
| Heading → subtitle → cards | Full chain — h2 first, subtitle +80ms, grid +160ms with 60ms between cards. More cinematic, delays first paint perception. | |
| Все animate-on-scroll в секции | Stagger all animate-on-scroll elements in the section. Chaotic in About (bio + skills parallel). | |

**User's choice:** Только карточки в grid

### Q2: Stagger interval

| Option | Description | Selected |
|--------|-------------|----------|
| 60ms (Recommended) | Mid-range 50-100ms window. For 3-4 cards: 180-240ms chain + 600ms fadeInUp = ~900ms total. Fast enough. | ✓ |
| 80ms | More explicit cascade. 6 cards = 480ms chain. Possible "lurch" on fast scroll. | |
| 100ms | Upper spec boundary. Cinematic but slows whole section. | |

**User's choice:** 60ms

### Q3: Implementation technique

| Option | Description | Selected |
|--------|-------------|----------|
| CSS :nth-child animation-delay (Recommended) | Pure CSS, 0 JS. Works for direct DOM children of grid. | ✓ |
| data-stagger attribute + JS | JS reads data-stagger, sets style.animationDelay per index. Flexible but violates zero-JS default. | |
| CSS variables per card | --stagger-idx on each card, CSS computes delay. Dirtier than nth-child; works even if children aren't siblings. | |

**User's choice:** CSS :nth-child animation-delay

### Q4: Target sections

| Option | Description | Selected |
|--------|-------------|----------|
| Blog + Presentations (Recommended) | Two cards-based sections. Speaking timeline already has per-year animate-on-scroll, different rhythm. | ✓ |
| + Speaking (talk rows) | Talk rows in timeline. Stagger by year AND by row-within-year. Two-level cascade complexity. | |
| + About (skills pills) | Skills chips as stagger. Not in POLISH-04 scope. | |

**User's choice:** Blog + Presentations

---

## Area 4: Spacing/Typography Audit

### Q1: Audit depth

| Option | Description | Selected |
|--------|-------------|----------|
| Лёгкий проход (Recommended) | Open live site on 1440×900 + 375px via Playwright MCP. Compare to app.jsx in browser. Fix only obvious nits. Not pixel-perfect — polish pass. | ✓ |
| Систематическая карта | Go section-by-section, document every delta in AUDIT.md, fix each. 7 sections × 2 viewports = 14+ audit points. Systematic but heavy. | |
| Только изменённые в Phase 3 секции | Blog + Presentations only. But REQUIREMENTS.md POLISH-06 says "all homepage sections". | |

**User's choice:** Лёгкий проход

### Q2: What counts as a "nit"

| Option | Description | Selected |
|--------|-------------|----------|
| Token drift и alignment ошибки (Recommended) | Hardcoded color/size, wrong padding (not 4px grid), bad alignment, margin conflicts. Narrow scope. | ✓ |
| Всё что не маппится 1:1 на app.jsx | Any visual delta = fix. Most strict. Risk of scope creep on refactoring "good enough" sections. | |
| Только что пользователь показал пальцем | Manual walkthrough with user. Subjective but accurate. | |

**User's choice:** Token drift и alignment ошибки

### Q3: Documentation format

| Option | Description | Selected |
|--------|-------------|----------|
| AUDIT.md с before/after (Recommended) | Table in .planning/phases/03-ui-polish/AUDIT.md: section \| viewport \| finding \| fix \| status. Screenshots before/after in the dir. Artifact for future audits. | ✓ |
| Коммиты без audit doc | Each fix = atomic commit (fix(03): ...). Git log = audit trail. Simpler but no before/after record. | |

**User's choice:** AUDIT.md с before/after

### Q4: Playwright visual gate on phase close

| Option | Description | Selected |
|--------|-------------|----------|
| Before/after на обоих viewport (Recommended) | Start-of-phase baseline screenshots 1440×900 + 375px of all homepage sections. End-of-phase re-capture after each fix. Human verifies deltas. No pixel-diff automation. | ✓ |
| Только 1440×900 | Desktop-first product. Mobile sanity check without before/after. | |

**User's choice:** Before/after на обоих viewport

---

## Wrap-up Check

| Option | Description | Selected |
|--------|-------------|----------|
| Готов к CONTEXT.md (Recommended) | All key decisions captured. Researcher + planner have enough. | ✓ |
| Ещё обсудить | Topics: reduced-motion fallback for stagger; wave/plan ordering; verify list for POLISH-01..06. | |

**User's choice:** Готов к CONTEXT.md

---

## Claude's Discretion

Decisions deferred to the planner during PLAN.md authoring:

- Final class name for stagger variant (`.animate-on-scroll-stagger` vs `.stagger` vs `.animate-stagger`)
- `:nth-child` cap handling for grids > 10 cards (bounded cascade vs progressive decay vs unbounded)
- Post-`--transition-normal`-update scan: which other site-wide consumers need a different curve (SearchPalette, Header hover, Footer). If any break, case-by-case override with a new token name.
- `AUDIT.md` table column count / scoring format
- Before/after screenshot naming convention
- Exact CTA visual style unification shape across Blog + Presentations + Speaking (D-01c)
- Empty-state guard on bottom CTA (probably same as top: `posts.length > 0`)

---

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. Summary:

### Future UI / design-system phase
- Shared `<SectionHeaderCTA>` component (extract duplicated h2 + link pattern)
- Design-tokens drift audit (systematic review of all token consumers)
- Translate-Y lift + amber underline on card hover (rejected; revisit if reference adopts)

### Phase 4 / Phase 5
- `--transition-fast` + `--transition-slow` token reference-alignment review

### Not in v1.0
- Dark/light mode toggle (already deferred; stagger works in both modes)
- Automated visual regression CI gate (Percy / Chromatic style)
- View counters / analytics that could measure scroll-to-reveal time
- Tag filter UI on blog index (outside Phase 3 scope — blog-index not homepage)

---

*End of discussion log.*
