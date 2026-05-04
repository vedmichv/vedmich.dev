# Excalidraw diagram pipeline

Build-time export of `.excalidraw.json` hand-sketched diagrams to optimized SVG, embedded via `<img>` in MDX with `<title>`/`<desc>` a11y. Zero runtime JS — the wrapper + SVGO run only when an author re-exports a diagram; shipped SVG is a committed static asset.

**Ship status:** Phase 4 (milestone v1.0). Consumers: `2026-03-02-mcp-servers-plainly-explained` (MCP post), `2026-03-20-karpenter-right-sizing` (karpenter split-ownership). Future consumers: companion posts (Phase 6) + any post where a hand-sketched metaphor fits.

***

## Authoring

1. Open Excalidraw: https://excalidraw.com (web) or the desktop app.
2. Draw the diagram. Prefer **Virgil font** (Excalidraw default) — the wrapper auto-embeds 7 Excalidraw fonts with glyph subsetting, and using one font keeps the subset small for the 10 KB post-SVGO budget.
3. Before exporting, press `Shift+1` to "zoom to fit selection". This normalizes the `viewBox` to the exact diagram bounds — avoids an inflated viewBox that inflates SVG size.
4. File → Save as → download `.excalidraw` (which is JSON).
5. Move the file to `diagrams-source/<blog-post-slug>/<diagram-name>.excalidraw.json`, where:
   - `<blog-post-slug>` matches the blog post filename slug (e.g. `2026-03-02-mcp-servers-plainly-explained`).
   - `<diagram-name>` is a short kebab-case identifier (e.g. `client-server`, `split-ownership`).

***

## Metadata

Every `.excalidraw.json` source needs a sibling `.meta.json` file with authored a11y strings. **The script refuses to run without it** — no silent a11y regression.

Create `diagrams-source/<blog-post-slug>/<diagram-name>.meta.json`:

```json
{
  "title": "Short diagram title, sentence case",
  "descEn": "One-sentence English description that names what the diagram shows, who the actors are, and what the flow or relationship is.",
  "descRu": "Optional Russian description — mirror of descEn for bilingual posts."
}
```

- `title` and `descEn` are **required**.
- `descRu` is optional. The script currently injects only `descEn` into the SVG `<desc>`; `descRu` is reserved for a future enhancement (bilingual `<desc xml:lang>` pairs).
- Both strings are XML-escaped by the script before injection — you can write literal `<`, `>`, `&` without manual escaping.

***

## Exporting

Run the pipeline from repo root:

```bash
node scripts/excalidraw-to-svg.mjs \
  diagrams-source/<blog-post-slug>/<diagram-name>.excalidraw.json \
  public/blog-assets/<blog-post-slug>/diagrams/<diagram-name>.svg
```

Success stdout:
```
✓ public/blog-assets/<slug>/diagrams/<name>.svg (NNNN B)
  intrinsic: WxH
  title: <meta.title>
  desc: <meta.descEn>
```

Record `W` and `H` — you'll paste them into the MDX `<img>` tag's `width` and `height` attributes to prevent CLS.

**Error: `exceeds 10 KB budget`** — the diagram has too much content for the budget. Fixes (in order):
1. Press `Shift+1` in Excalidraw and re-export (normalizes viewBox).
2. Remove decorative elements (unnecessary strokes, stray labels).
3. Shorten text labels — every glyph adds ~50-100 B after font subsetting.
4. Reduce the number of distinct fonts — stick to Virgil only if possible.

**Error: `meta sidecar required`** — you forgot step 2 (Metadata). Create the `.meta.json`.

***

## Embedding

In the target MDX or MD post, insert an HTML `<img>` block at the intended position:

```html
<img
  src="/blog-assets/<blog-post-slug>/diagrams/<diagram-name>.svg"
  alt="One-sentence description in the post's locale. Different string per locale."
  loading="lazy"
  width="W"
  height="H"
  style="max-width: 100%; height: auto;"
/>
```

- `src` is absolute from the site root (`/blog-assets/...`), not relative.
- `alt` is **bilingual** — the EN post has EN alt, RU post has RU alt. Same SVG, different `alt`.
- `loading="lazy"` for below-the-fold diagrams. Use `loading="eager"` for the first diagram of a short post (above-the-fold on 1440×900).
- `width` and `height` are numeric pixel values from the script's `intrinsic: WxH` output. These prevent CLS.
- `style="max-width: 100%; height: auto;"` keeps the diagram responsive inside `.prose`.

**Bilingual parity:** every EN edit needs a mirror RU edit with the same `src`/`width`/`height`/`loading` and localized `alt`.

***

## Gotchas

1. **Virgil-only text keeps the budget.** The wrapper auto-embeds whichever Excalidraw fonts your diagram uses. Cascadia + Comic Shanns + Lilita One together can push even a small diagram over 10 KB. If you want mixed fonts, verify the SVG byte count and simplify if needed.

2. **Meta file required — no silent a11y regression.** The script errors out if `<name>.meta.json` is missing OR if `title` / `descEn` are empty. Never comment out the check.

3. **`<title>` + `<desc>` injected PRE-SVGO.** The script injects them before optimization. If you hand-edit the exported SVG and add `<title>`/`<desc>` yourself afterward, SVGO may strip them on the next re-run. Always author via the meta sidecar.

4. **Don't import the wrapper from `src/`.** `@aldinokemal2104/excalidraw-to-svg` is a devDep. Importing it from any file under `src/` would balloon the production bundle by ~15 MB. CI doesn't have a grep gate for this, but it's a live invariant — keep the wrapper in `scripts/` only.

5. **`files` blob is capped at 100 KB.** The script refuses diagrams with embedded raster images larger than 100 KB total. If you need a large raster, serve it separately as a `.png` and compose with CSS.

6. **Original Excalidraw palette is intentional.** The pipeline does NOT recolor the diagram to Deep Signal tokens. The hand-sketched aesthetic (blue strokes, yellow fills) is preserved on purpose.

***

## Further reading

- **`scripts/excalidraw-to-svg.mjs`** — the pipeline script; CLI contract + SVGO config + path-traversal guard.
- **`tests/unit/excalidraw-to-svg.test.ts`** — 9 integration tests covering DIAG-01/02/03 + T-04-01 path-traversal.
- **`.planning/phases/04-excalidraw-pipeline/04-RESEARCH.md`** — library choice rationale, SVGO pitfalls, security domain.
- **`CLAUDE.md` §Architecture** — zero-JS-by-default principle; why this pipeline is build-time-only.
- **`.claude/skills/vv-blog-from-vault/references/visuals-routing.md`** — when to route a diagram to `excalidraw` skill vs `mermaid-pro`.
