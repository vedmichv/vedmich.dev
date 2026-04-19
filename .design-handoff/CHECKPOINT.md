# Deep Signal Migration — Checkpoint

**Timestamp:** 2026-04-19
**Branch:** `deep-signal-design-system`
**Status:** Phase 1–5 выполнены локально, 4 atomic commits готовы. Ждём явного согласия юзера на `git push` + PR.

---

## Где мы остановились

Все 26 шагов плана из `APPLY-PLAN.md` либо выполнены, либо явно отложены.
Ветка готова к push, но НЕ запушена (чтобы юзер сначала подтвердил — автодеплой на прод после merge).

### 4 commits на ветке (vs main aaaf03a)

```
82a352a  Phase 5: Document Deep Signal migration + Publishing Workflow
9a6f3da  Phase 3: Apply Deep Signal to components, content, and taglines
c9ff835  Phase 2: Migrate tokens to Deep Signal + self-hosted fonts
341220e  Phase 1: Import Deep Signal handoff bundle and fonts
```

### Осталось сделать

1. **Подтвердить push** — юзер сказал "сделай compact" после того как я показал 4 коммита. После возобновления спросить: пушить + открыть PR?
   Команды:
   ```
   git push -u origin deep-signal-design-system
   gh pr create --title "Deep Signal design system" --body "..."
   ```
2. (Опционально, отложено) Vault-обновления — `~/Documents/ViktorVedmich/40-Content/45-Personal-Brand/vedmich.dev Website.md` и `DESIGN.md` (отметить Tailwind-миграцию как Done). Юзер делает сам в Obsidian — не в скоупе репо.

---

## Что принципиально важно помнить (не терять)

### Стратегия миграции: Strategy B (выбрана из 3)
- **Не переименовываем Tailwind утилиты** (`text-accent`, `bg-bg`, `text-warm` остались как есть).
- `@theme` в `global.css` **ремапит значения** через shim aliases: `--color-accent: var(--brand-primary)`.
- Zero breakage на 50+ use-sites утилит. Canonical tokens тоже доступны (`bg-brand-primary`).

### Архитектура токенов — 3 слоя
1. `src/styles/design-tokens.css` — canonical `:root` + `.light` override + 10 gradients + fractalNoise + type scale (Deep Signal truth).
2. `src/styles/global.css` `@theme` — Tailwind 4 bridge (canonical utilities + shim aliases for backwards compat).
3. Component utilities — `text-accent`, `bg-surface`, `font-display`, `.noise-overlay`, `.typing-cursor`, `.card-glow`.

### КРИТИЧНЫЙ constraint Tailwind 4
**`@theme` инлайнит цвета статически** (`bg-surface` → literal `#1E293B`). Поэтому `.light` override из `design-tokens.css` НЕ переключает Tailwind утилиты — работает только для raw CSS правил (`body`, `.typing-cursor`, `.card-glow`).
→ Light mode только для OG/LinkedIn рендера, НЕ user-toggle.
Задокументировано в `CLAUDE.md`.

### Проверки пройдены
- `npm run build` → zero errors, 7 pages, 873 ms
- 9 WOFF2 в `dist/fonts/`
- Zero `#06B6D4` в `dist/`
- Google Fonts ссылки удалены
- Favicon: teal VV rounded square (был cyan V)
- Playwright screenshots EN/RU hero/about/podcasts/book — все в teal/amber палитре, Space Grotesk headlines, JetBrains Mono role, AA-compliant text

### Скрытые поломки, которые починены (не в APPLY-PLAN)
1. `design-tokens.css` имел EOF artefact `</content></invoke>` + `:root` блок отсутствовал — полностью переписан.
2. Font paths были относительные (`url('fonts/...')`) → в prod 404 — переписаны на `/fonts/...`.
3. `.card-glow` хардкод cyan rgba → `var(--shadow-glow)`.
4. `.typing-cursor` → `var(--brand-primary-hover)` (#2DD4BF, AA small size).
5. `prose-cyan` в blog [...slug] (EN+RU) — встроенная тема Typography, переопределяла наш accent. Заменена на token-driven prose overrides.
6. Google Fonts `<link>` удалены, `<link rel="preload">` добавлены для LCP-шрифтов.
7. Tagline + bio обновлены "Cloud Architecture" → "AI Engineer" (chat decision).
8. Skills: prepend "AI Engineering".

### Что отложено явно
- **⌘K Search Palette** (из UI kit chat) — отдельная будущая фаза, не в скоупе миграции.
- **Vectorization of `vv-logo-hero.png`** (2 MB) — handoff даёт только PNG, нужна ручная векторизация.
- **Architecture Diagram utilities** (DESIGN.md §14) — пока нет UI поверхности, которая их требует.
- **Tailwind utility-name sweep** (rename shim aliases to canonical) — отложено; shims останутся пока не появится время.

---

## Измененные/созданные файлы

### New
- `src/styles/design-tokens.css` — пересобран с нуля
- `public/fonts/*.woff2` × 9
- `public/vv-logo-hero.png`, `vv-logo-primary.svg`, `vv-logo-inverse.svg`
- `.design-handoff/` — полный handoff bundle
- `.design-handoff/APPLY-PLAN.md` + этот CHECKPOINT.md

### Modified
- `CLAUDE.md` — Deep Signal LIVE + Publishing Workflow
- `public/favicon.svg` — teal VV (был cyan V)
- `src/styles/global.css` — @theme bridge с shim aliases
- `src/layouts/BaseLayout.astro` — Google Fonts out, preload in
- `src/components/Header.astro` — VV logo + Space Grotesk wordmark
- `src/components/Hero.astro` — soft mesh + noise + AA-compliant text colors
- `src/components/{About,Podcasts,Speaking,Book,Presentations,BlogPreview,Contact}.astro` — `font-display` на h2
- `src/pages/{en,ru}/blog/[...slug].astro` — `prose-cyan` → token-driven
- `src/data/social.ts` — "AI Engineering" prepended to skills
- `src/i18n/{en,ru}.json` — tagline + bio update
- `.gitignore` — exclude `.playwright-mcp/`

---

## Как возобновить после compact

1. Читать `.design-handoff/CHECKPOINT.md` (этот файл) — полный контекст.
2. Читать `.design-handoff/APPLY-PLAN.md` — оригинальный план.
3. Запустить `git log --oneline main..HEAD` — увидеть 4 коммита.
4. Спросить юзера: пушить + открыть PR? (`git push -u origin deep-signal-design-system` + `gh pr create`).
5. Если да — открыть PR со скриншотами из `.design-handoff/after-*.png`.
