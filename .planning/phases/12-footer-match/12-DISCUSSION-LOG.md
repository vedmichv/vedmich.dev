# Phase 12 — Footer match · DISCUSSION-LOG

**Phase:** 12
**Date:** 2026-05-01
**Mode:** discuss (default)
**Language:** Questions in Russian, artifacts in English (per CLAUDE.md rule)

---

## Gray Areas Selected (multiSelect)

User selected ALL 4 gray areas for discussion:

1. Social icons — drop or keep?
2. Container + padding + bg alignment
3. Copyright year — dynamic vs static
4. Font size + bilingual text

---

## Area 1 — Social icons

**Question:** Social icons в футере — удаляем или оставляем? Reference их не имеет, но в Phase 10 мы их вынесли в Contact-секцию как компакт-чипы.

**Options presented:**
- **Удалить полностью (Recommended)** — strict match с app.jsx:640-648; контакты уже в Contact-секции (Phase 10 letter-badges); убираем import socialLinks + 5 SVG path-блоков
- Оставить soc-иконки — ignore reference, keep as fallback nav to socials on pages без Contact section
- Уменьшить до 2 (LinkedIn + GitHub) — гибрид: минимум professional-контактов

**User selected:** Удалить полностью (Recommended)

**Rationale:** Reference = truth. Contact section already covers all 5 platforms via letter-badges. Dead-code cleanup is a bonus.

---

## Area 2 — Container + padding + background

**Question:** Container width + padding + background — насколько строго матчим reference? (max-w-[1120px] + 32px/24px + нет bg + border 1px solid)

**Options presented:**
- Полный reference-match (Recommended) — max-w-[1120px], px-6 py-8, no bg, border-border solid
- **Reference-match + mobile guard** — same but keep px-4 sm:px-6 для мобильных
- Матчим только width, остальное сохраняем — keep bg-surface/30 + border-border/50 alpha

**User selected:** Reference-match + mobile guard

**Rationale:** Reference never rendered 375px; 24px padding on mobile is too tight. `px-4 sm:px-6` is the project-wide pattern (matches `Footer.astro` current + Header + most sections).

---

## Area 3 — Copyright year

**Question:** Копирайт year — динамический или статический?

**Options presented:**
- **Динамический (Recommended)** — new Date().getFullYear() + i18n template; auto-updates post-2027
- Статический 2026 — hardcode pixel-match; manual update every January

**User selected:** Динамический (Recommended)

**Rationale:** Living site needs auto-updating year. Reference was a 2026-snapshot artifact. No maintenance burden.

---

## Area 4 — Font size + bilingual text

**Question:** Font size и bilingual text: 13px vs 14px, и переводить ли 'Built with Astro'?

**Options presented:**
- **text-[13px] + bilingual (Recommended)** — pixel-match reference font-size via Tailwind arbitrary; preserve RU 'Создано на Astro'
- text-sm + bilingual — 14px preserves Tailwind token rhythm; bilingual parity
- text-[13px] + EN-only — pixel-match but violates bilingual constraint

**User selected:** text-[13px] + bilingual (Recommended)

**Rationale:** 13px = pixel-match. Bilingual is a v0.4 global constraint (REQUIREMENTS.md); breaking it for 1 footer string would be inconsistent with the rest of the milestone.

---

## Scope-Creep Redirects

None during this discussion. No gray areas bled into new capabilities.

---

## Claude's Discretion (not asked, downstream-decidable)

- **Specific Tailwind arbitrary syntax** — `text-[13px]` (Tailwind 4 supports arbitrary values directly). Executor can confirm.
- **Removal order** — delete the `import { socialLinks }` line when removing the `.map` block, not before (avoid stale imports mid-diff). Executor handles.
- **Flex direction** — reference uses row-flex `justify-content: space-between`. Current has `flex-col sm:flex-row` responsive switch. Planner decides: keep responsive (safer for 375px) or collapse to single-axis row (matches reference at all sizes — `© 2026…` and `Built with Astro` are short).

---

## Deferred Ideas

None.

---

## Decisions Summary (for CONTEXT.md → PLAN.md)

| # | Decision | Locked |
|---|---|---|
| D-01 | Remove 5 social SVG icons + socialLinks import | ✅ |
| D-02 | Container: `max-w-[1120px]`, `px-4 sm:px-6 py-8`, `border-t border-border` (solid), no bg | ✅ |
| D-03 | Dynamic year via `new Date().getFullYear()` + i18n template preserved | ✅ |
| D-04 | `text-[13px]` + bilingual i18n (`i.footer.built_with` stays RU/EN) | ✅ |
| D-05 | Final shape = 2-span flex, ~14 lines, zero JS | ✅ |
