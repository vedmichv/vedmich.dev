# Phase 4 — Excalidraw Pipeline — Discussion Log

**Gathered:** 2026-05-03
**Mode:** default (4 AskUserQuestion turns, 4 gray areas)
**User language:** RU questions, EN artifacts (per global RU/EN rule)

---

## Gray area selection (multi-select)

**Question:** Какие области обсуждаем для Phase 4 — Excalidraw Pipeline?

**Options presented:**
1. Выбор библиотеки — `@excalidraw/excalidraw` (~1MB devDep, full fidelity) vs `@aldinokemal2104/excalidraw-to-svg` (~50KB wrapper, may lag) vs CLI/manual.
2. Хранение `.excalidraw.json` — (a) committed in repo alongside SVG, (b) separate `diagrams-source/` outside `public/`, (c) vault-only.
3. Рендер SVG в MDX — `<img>` with fixed palette vs inline `<svg>` with `currentColor` vs hybrid two-file output.
4. Скоуп — Slidev-slide-to-SVG fold-in (Phase 1 handoff) + 3rd stress target (karpenter / hosts / manifests / cut DIAG-05).

**Selected:** все 4 области.

---

## Area 1 — Library Choice (DIAG-01)

**Question:** Какую библиотеку для `.excalidraw.json → SVG` выбираем?

**Options presented:**
1. (Recommended) `@excalidraw/excalidraw` official — full-fidelity dev-only, requires JSDOM shim.
2. `@aldinokemal2104/excalidraw-to-svg` wrapper — pure-JS, ~50KB, may lag on new shapes.
3. Excalidraw CLI / web-export (no npm) — manual, not reproducible.

**User selected:** `@excalidraw/excalidraw` официальная (Recommended).

**Decisions captured:** D-01, D-01b (REQUIREMENTS.md DIAG-01 doc-drift fix queued post-phase), D-01c (JSDOM shim choice = planner), D-01d (exact-pin devDep).

---

## Area 2 — Source Storage (DIAG-03 structural)

**Question:** Где храним исходники `.excalidraw.json`?

**Options presented:**
1. (Recommended) `diagrams-source/<slug>/*.excalidraw.json` in repo, outside `public/` — reproducible, not in prod.
2. `public/blog-assets/<slug>/diagrams/*.{excalidraw.json,svg}` side-by-side — simple, but JSON ships to prod.
3. SVG in repo only; `.excalidraw.json` lives in Obsidian vault — clean repo, not CI-reproducible.

**User selected:** option 1.

**Decisions captured:** D-02, D-02b (`public/blog-assets/<slug>/diagrams/*.svg` output path), D-02c (script CLI contract), D-02d (metadata-beside-source pattern with bilingual `descRu`).

---

## Area 3 — SVG Rendering in MDX (DIAG-04)

**Question:** Как рендерим экспортированный SVG в MDX?

**Options presented:**
1. (Recommended) `<img src="...">` with fixed palette — browser-cached, standard, zero preprocessing.
2. Inline `<svg>` via Astro `?raw` import + `currentColor` — token-aware, dark/light auto, but bloats HTML.
3. Hybrid — two SVG files (original + tokenized) — flexible but overengineered for v1.

**User selected:** option 1.

**Decisions captured:** D-03, D-03b (original Excalidraw palette, no recolor), D-03c (dual-channel a11y: alt on img + title/desc inside SVG), D-03d (explicit width/height + CSS `max-width: 100%`).

---

## Area 4 — Scope: Slidev fold-in + 3rd target (DIAG-05 shape)

**Question:** Берём ли Slidev-slide-to-SVG задел и как выбираем 3-й stress-target?

**Options presented:**
1. (Recommended) Нет Slidev fold-in + 3rd target = hosts/karpenter (planner picks) — keeps phase tight, `manifests` stays text-only.
2. Yes Slidev fold-in (separate plan) + 3rd target = hosts — adds 3-4h effort, abstract tool without consumer.
3. No Slidev + narrow DIAG-05 to 1 additional target — fastest ship, pipeline untested at scope.

**User selected:** option 1.

**Decisions captured:** D-04 (defer Slidev further — better solved in Phase 5 Slidev repo CI), D-04b (planner picks target #1: karpenter / hosts; `manifests` text-only), D-04c (Phase 6 companion posts = natural stress-test follow-on), D-06 (REQUIREMENTS.md DIAG-05 doc-drift fix post-phase).

---

## Claude's Discretion (captured in CONTEXT.md <decisions>)

Planner owns:
- Exact JSDOM shim (jsdom / happy-dom / linkedom)
- SVGO plugin config tuning (preserving `<title>`/`<desc>`)
- 3rd (stretch) diagram slot — fill or skip based on content fit
- Batch script presence (`npm run diagrams:build`)
- `diagrams-source/README.md` vs appended to CLAUDE.md
- Script error handling / `--help` flag shape
- `.prose img` margin/aspect adjustments if real MCP render demands them
- `loading="eager"` vs `lazy` decision per diagram position above/below fold

---

## Deferred Ideas (captured in CONTEXT.md <deferred>)

- `scripts/slidev-slide-to-svg.mjs` — deferred further (Phase 1 handoff note closed; revisit in Phase 5 discuss or defer to v1.1)
- Theme-aware diagrams (auto-recolor on light/dark toggle) — with light-mode UI story
- CI auto-rebuild on `diagrams-source/` change — current commit-both approach simpler
- Inline `<svg>` import alternative — revisit if tokens diverge significantly
- Batch mode with glob discovery — not in v1, revisit if count > ~10
- Hybrid two-SVG output — rejected
- Companion post diagrams via pipeline — natural Phase 6 stress-test

---

## Follow-ups required post-phase

1. `.planning/REQUIREMENTS.md` doc-drift commit (D-06):
   - DIAG-01: `@aldinokemal2104/excalidraw-to-svg` → `@excalidraw/excalidraw`
   - DIAG-05: "karpenter / manifests / TBD-third" → "MCP + karpenter + 1-2 stretch"
2. `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` + vault mirror — Priority 1 `excalidraw` row gets concrete delivery path with example (per three-way-sync rule).

---

*Written by `/gsd-discuss-phase 4` on 2026-05-03.*
