# Deep Signal Migration — Checkpoint

**Timestamp:** 2026-04-19 (evening)
**Branch:** `main` (merged, deployed)
**Status:** ✅ LIVE on https://vedmich.dev — 11 commits fast-forwarded + deployed.

---

## Что сделано в этой сессии

### 1. VV favicon geometry fix (commit `f04e23f`)

Старые пути читались как "W" в 32×32 фавикон-слоте. Новые — 2 идентичные
зеркальные V с одинаковой толщиной штриха:
- Left V: `M14 26 L22 26 L30 60 L38 26 L46 26 L34 74 L26 74 Z`
- Right V: `M54 26 L62 26 L70 60 L78 26 L86 26 L74 74 L66 74 Z`

Применено в: `public/favicon.svg` + 3 handoff-канонах (`vv-favicon.svg`,
`vv-logo-primary.svg`, `vv-logo-inverse.svg`).

### 2. Presentations → "Recent decks" (commit `063f383`)

Расширено с 2 до 6 декoв, по структуре `ref-content.json`:

| Date | Event | City | Slug |
|---|---|---|---|
| 2026-04-19 | AWS Community Day | Bratislava | karpenter-prod ⚠️ |
| 2026-03-08 | Code Europe | Krakow | mcp-platform ⚠️ |
| 2026-02-14 | Slurm AI for DevOps | — | slurm-prompt-engineering ✅ |
| 2026-01-22 | Slurm AI for DevOps | — | slurm-ai-demo ✅ |
| 2025-11-05 | KubeCon EU | Paris | eks-multi-az ⚠️ |
| 2025-09-18 | DevOpsConf | online | dkt-workflow ⚠️ |

⚠️ = 4 слага ведут в 404 на `s.vedmich.dev` (Slidev decks ещё не созданы).
User: "ссылки пока битыми не страшно — мы наполним позже".

**Component rewrite (`src/components/Presentations.astro`):**
- Мета-строка `YYYY-MM-DD · Event · City` — `JetBrains Mono` (code DNA)
- Title `Space Grotesk` semibold, description `Inter` text-secondary
- Teal URL pill `s.vedmich.dev/slug` (брендирует каждую карточку)
- Uppercase tag chips моно-шрифтом
- "All decks →" ссылка в верхнем правом углу

**i18n:**
- `presentations.title`: "Recent decks" / "Свежие доклады"
- `presentations.subtitle`: "6 talks · all slides at s.vedmich.dev" /
  "6 докладов · все слайды на s.vedmich.dev"
- Новый ключ `presentations.all_decks`: "All decks" / "Все доклады"

### 3. Deploy

```
git checkout main
git merge --ff-only deep-signal-design-system   # 11 commits fast-forwarded
git push origin main                            # GitHub Actions deploy ~90s
```

GitHub Actions run `24632358552` — завершён успехом за 37s. Live content
verified via HTTP grep + Playwright screenshot.

---

## Где мы сейчас

- ✅ Deep Signal теперь LIVE (branch `deep-signal-design-system` вмержен в `main`)
- ✅ VV logo симметричный — читается
- ✅ Presentations = 6 декoв как в reference
- ⏸ Остальные несоответствия reference-дизайну — в бэклоге

## Остальной reference-backlog (audit → что ещё расходится)

Из сравнения `current-content.json` vs `ref-content.json`:

| № | Секция | Gap |
|---|---|---|
| 1 | **Header** | Нет Search (⌘K). EN · RU — работает, но без комбо "EN/RU". |
| 2 | **Hero** | Плоский. В ref: terminal `~/vedmich.dev $ whoami`, inline cert badges, 2 CTA. |
| 4 | **Blog** | 1 post live vs 3 в ref (Karpenter / MCP / K8s manifests by hand). |
| 5 | **Speaking** | Без `→` arrows перед каждым talk, без inline "· City". |
| 6 | **Podcasts** | DKT avatar есть, но "DKT" / "AWS RU" monogram badges отсутствуют. |
| 7 | **Book** | 3D cover есть, но нет "PACKT" + "V. Vedmich" эмбоссинга обложки. |
| 8 | **Contact** | Иконки, но не single-letter badges L/G/Y/𝕏/T + "Write me a message" CTA. |

**Приоритет user'а:** пойдём последовательно по спискy, пункт за пунктом
(точный порядок TBD после компакта).

## Ссылки

- Live: https://vedmich.dev
- Repo: https://github.com/vedmichv/vedmich.dev
- Reference kit: `/Users/viktor/Downloads/vedmich.html` (Claude artifact, 1.2MB React)
- Reference text: `ref-content.json` (plaintext audit extract)
- Current text: `current-content.json`
- Reference screenshot: `reference-1440-full.png`
- Vault DESIGN.md: `40-Content/45-Personal-Brand/45.20-Brand-Kit/DESIGN.md`

## Untracked артефакты (screenshots + audit files — НЕ в git)

```
current-1440-full{,-v2,-v3}.png    # before-скрины
live-presentations-1440.png        # live after-скрин
ref-*.png + reference-1440-full.png # reference images from Claude artifact
current-content.json + ref-content.json  # text extracts for audit
```

Эти файлы — рабочие (audit helper'ы), можно либо закоммитить в
`.design-handoff/reference-audit/`, либо добавить в `.gitignore`.
Решение отложено до следующей сессии.

## Как возобновить после компакта

1. Читать этот CHECKPOINT.md + `ref-content.json` + `reference-1440-full.png`
2. `git log --oneline -5 main` → убедиться что `063f383` — последний коммит
3. `curl -sI https://vedmich.dev | head -3` → HTTP 200
4. Открыть `vedmich.dev/en/#presentations` — проверить что 6 карточек на месте
5. Спросить user какой пункт reference-backlog'а берём следующим (Hero terminal,
   Blog 3 posts, Contact monograms, Speaking arrows, Book PACKT, Header search)
