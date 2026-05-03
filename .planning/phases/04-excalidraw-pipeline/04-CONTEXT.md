# Phase 4: Excalidraw Pipeline - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a build-time `.excalidraw.json → SVG` export pipeline at `scripts/excalidraw-to-svg.mjs` using the official `@excalidraw/excalidraw` package as a devDependency (never imported in `src/`), with SVGO post-processing for the ≤ 10 KB budget and `<title>`+`<desc>` injection for a11y. Diagram sources live at `diagrams-source/<slug>/*.excalidraw.json` (repo, outside `public/`) and exported SVGs ship to `public/blog-assets/<slug>/diagrams/*.svg`. MDX posts embed via `<img src="/blog-assets/..." alt="..." loading="lazy" width height>` — browser-cached, explicit dimensions, zero runtime JS. Pipeline is validated by (a) replacing the ASCII client-↔-server ↔-resource diagram in the existing MCP post (EN + RU) and (b) stress-testing on 1-2 additional real diagrams (karpenter NodePool topology and/or a hosts/three-tier diagram — planner picks the best content fit during research).

**Affects:** `scripts/excalidraw-to-svg.mjs` (new), `package.json` (devDeps: `@excalidraw/excalidraw`, JSDOM shim, `svgo`), `diagrams-source/<slug>/*.excalidraw.json` (new directory + source JSON files authored in Excalidraw desktop/web), `public/blog-assets/mcp-servers-plainly-explained/diagrams/client-server.svg` (new) + 1-2 additional target dirs, `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` + `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` (swap ASCII diagram for `<img>` tag), 1-2 additional MDX/MD posts for DIAG-05, `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` (Priority 1 row for `excalidraw` gains a concrete delivery path via this pipeline — vault mirror per three-way-sync), docs/CLAUDE.md mention of the pipeline.

**Not in this phase (explicit):**
- **Slidev-slide-to-SVG task** (deferred from Phase 1 handoff) — different pipeline (Slidev Vue + scoped `<style>` vs Excalidraw JSON), no current consumer (PodLifecycleAnimation already ported to primitives in Phase 1). Deferred to a new backlog item or folded into a future milestone; NOT executed in Phase 4.
- **Interactive Excalidraw embedding** — `@excalidraw/excalidraw` as a runtime React component. Explicitly rejected per REQUIREMENTS.md + PITFALLS.md Pitfall 6 (~1 MB bundle blows zero-JS budget). Pipeline is strictly dev-time export.
- **`manifests` post (2026-02-10-why-i-write-kubernetes-manifests-by-hand)** as a stress-test target — it's an opinion piece with no structural content for a diagram. REQUIREMENTS.md DIAG-05 names "karpenter / manifests / TBD-third"; `manifests` gets corrected to text-only in a post-phase doc-drift commit (D-04b).
- **Automatic `<title>`/`<desc>` inference from diagram content** — injection is required (DIAG-03) but copy comes from a per-diagram config file, not AI guesswork. Simple `{ title, desc }` JSON beside the source.
- **Theme-aware diagrams** (automatic recolor on light/dark theme toggle) — deferred. Phase 4 renders SVGs with original Excalidraw palette via `<img>`. If the site later ships light-mode toggle, re-export is a later task (D-03b).
- **CI step to auto-rebuild diagrams on `diagrams-source/` change** — out of scope. Diagrams rebuild locally; committed SVG is source of truth in CI. GH Actions continues to run `astro build` only.
- **Inline `<svg>` import** (`?raw` + `set:html`) — rejected (D-03). `<img>` tag is the canonical renderer.
- **`manifests` / other opinion post getting a diagram injection purely for stress-test quota** — diagrams added only where they clarify content, not to hit a number. Planner picks fit; DIAG-05 gets reshaped to "1-2 additional stress-test diagrams" if needed.

</domain>

<decisions>
## Implementation Decisions

### Library Choice (DIAG-01)
- **D-01:** ~~**Use official `@excalidraw/excalidraw` as devDependency.**~~ **SUPERSEDED by D-01e (2026-05-03).** Original rationale kept for history: full-fidelity coverage of every shape, fonts, palette; maintained in lockstep with desktop. Reversed after RESEARCH.md verified the package declares React 17/18/19 as peer dep, has **no documented Node-headless path**, and would add ~4-6h of jsdom + font-loader glue work outside the phase estimate.
- **D-01b:** ~~**REQUIREMENTS.md DIAG-01 drift — accepted.**~~ **REVERSED by D-01e.** `@aldinokemal2104/excalidraw-to-svg` is NOT a pure-JS "~50 KB pure-JS wrapper" as described — it's a thin Node wrapper over `@excalidraw/utils` (the OFFICIAL export library), with worker-thread jsdom + auto-embed of 7 Excalidraw fonts + glyph subsetting. Full upstream fidelity is preserved via `@excalidraw/utils` transitively. REQUIREMENTS.md was always right.
- **D-01c:** ~~**Planner selects JSDOM-shim strategy.**~~ **OBVIATED by D-01e.** Wrapper runs jsdom inside a worker thread — no shim choice needed in the main script. Assumption that "all three shims are devDeps — runtime footprint unchanged either way" was correct but moot since the wrapper encapsulates this.
- **D-01d:** **Pin exact version** — pattern preserved, target package changed. Install with `npm install -D @aldinokemal2104/excalidraw-to-svg@1.1.1` (mirrors Phase 2's `astro@5.18.0` pin discipline). Prevents silent API change between phases breaking the script.
- **D-01e (2026-05-03, user reconciliation after RESEARCH.md):** **Use `@aldinokemal2104/excalidraw-to-svg@1.1.1` as the primary export library.** Reasoning:
  1. **Upstream fidelity preserved** — wrapper pulls in `@excalidraw/utils@0.1.3-test32` (the OFFICIAL Excalidraw export library, minus React). Same shape/font/palette coverage as D-01 intended.
  2. **Documented Node-headless path** — the package's entire reason for existing. Official `@excalidraw/excalidraw` has no such path.
  3. **Footprint ~15 MB vs ~90 MB devDeps.** React + Radix + Jotai + browser-fs-access not pulled in.
  4. **Worker-thread jsdom isolation** — no main-thread global pollution, matches project's zero-JS-in-src/ hygiene.
  5. **Font handling built-in** — auto-embeds all 7 Excalidraw fonts (Excalifont, Virgil, Cascadia, Comic Shanns, Liberation Sans, Lilita One, Nunito) with glyph subsetting via `subset-font@^2.4`. Avoids hand-rolling WOFF2 `@font-face` injection.
  6. **Script LOC — ~60 vs ~180.** Matches phase estimate (2-3h) vs D-01 literal's 6-9h.
  7. **Maintained** — v1.1.1 published 2026-04-08 (25 days old at reconciliation time), MIT licensed.
  8. **REQUIREMENTS.md DIAG-01 was always correct** — D-01b's "accepted drift" was wrong. D-06 post-phase commit now REVERSES direction: DIAG-01 language stays as-is (already references the wrapper); no REQUIREMENTS.md edit needed for library choice. D-06 still fixes DIAG-05 `manifests` → `MCP + karpenter + stretch` per D-04b.

### Source Storage (DIAG-03 structural decision)
- **D-02:** **Source-of-truth `.excalidraw.json` lives at `diagrams-source/<slug>/<name>.excalidraw.json`** — repo root, outside `public/`. Committed, versioned with git, never served to prod (not in `dist/` after `astro build`). Enables CI / local re-export when palette or SVGO config changes without manual re-import from vault.
- **D-02b:** **Output path: `public/blog-assets/<slug>/diagrams/<name>.svg`** — matches DIAG-03 and the existing `public/blog-assets/2026-03-20-karpenter-right-sizing/` convention. The `<slug>` matches blog post slug so `public/blog-assets/<slug>/` remains the "assets for this post" landing.
- **D-02c:** **Script contract — positional args, explicit paths:** `node scripts/excalidraw-to-svg.mjs <source.excalidraw.json> <dest.svg> [--title "..."] [--desc "..."]`. No directory-scan / auto-discovery in v1 — predictable, diff-greppable in commit messages. Batch mode via a tiny shell `for` loop if needed. Planner may add a convenience `npm run diagrams:build` script that runs a pre-defined list, but not in scope for phase unless trivial.
- **D-02d:** **Metadata file convention.** Each `<name>.excalidraw.json` gets a sibling `<name>.meta.json` with `{ "title": "...", "descEn": "...", "descRu": "..." }` (bilingual desc since MCP post is EN + RU). Script reads metadata, injects `<title>` + bilingual `<desc>` into exported SVG (one SVG serves both locales — alt text stays on `<img>`, not inside SVG). If `<name>.meta.json` is missing, script errors out — no silent a11y regression.

### SVG Rendering in MDX (DIAG-04)
- **D-03:** **`<img src="/blog-assets/<slug>/diagrams/<name>.svg" alt="..." loading="lazy" width="..." height="...">`** in MDX. Canonical, browser-cached, respects prose typography scoping, explicit dimensions prevent CLS, `loading="lazy"` defers off-screen diagrams, `alt` is bilingual (EN post has EN alt, RU post has RU alt — different MDX strings, same SVG).
- **D-03b:** **Original Excalidraw palette rendered as-is.** No `currentColor` post-processing in v1. Rationale: (a) hand-sketched Excalidraw aesthetic depends on the intentional palette (blue strokes, yellow fills, etc.); swapping to single-tone tokens loses the diagrammatic clarity, (b) site is dark-only for users — light mode tokens only activate in OG/LinkedIn render templates, not on `/blog/<slug>`. If light/dark toggle ever ships, re-export is a later task.
- **D-03c:** **`<title>`+`<desc>` inside the SVG, `alt` on the `<img>`.** Dual-channel a11y: screen readers reading the DOM hit `alt`; screen readers embedded inside `<svg>` (some legacy setups) hit `<title>`/`<desc>`. `alt` is localized (per-locale MDX); `<title>`/`<desc>` stay in the author's language (EN primary, optional RU via `descRu` in meta if needed). Not duplicating — different surfaces.
- **D-03d:** **Fixed intrinsic size from exported SVG + CSS max-width.** Script reads viewBox, writes `width="X" height="Y"` (numeric, no unit — HTML accepts intrinsic pixel values). In MDX: `<img ... style="max-width: 100%; height: auto;">` or via a shared prose style (planner decides if worth adding to `.prose` block in `global.css`). Keeps LCP safe — no aspect-ratio flash.

### Scope — Slidev + Stress Target (DIAG-05 shape)
- **D-04:** **No Slidev-slide-to-SVG fold-in in Phase 4.** Phase 1 explicitly deferred `scripts/slidev-slide-to-svg.mjs` to Phase 4 as a scope candidate (01-CONTEXT.md §Deferred Ideas). Decision here: **defer further.** Reasons: (a) different pipeline — Slidev slide = Vue component + scoped `<style>`; Excalidraw = clean JSON. No meaningful code reuse, (b) no consumer in v1.0 — PodLifecycleAnimation already ported to primitives in Phase 1 (<10 min target hit), (c) +3-4h effort blows the phase's 2-3h estimate, (d) honest call: Slidev export is better solved by `slidev export --format svg` inside the `vedmichv/slidev` repo's CI (Phase 5 integration), not by a codegen script in `vedmich.dev`. New todo captured in deferred section.
- **D-04b:** **Stress-test targets: MCP post (DIAG-04 required) + 1-2 additional diagrams — planner picks from karpenter / hosts-three-tier / other content-fit candidates.** NOT `manifests` (opinion piece, no diagram fit). REQUIREMENTS.md DIAG-05 names "karpenter / manifests / TBD-third" — `manifests` gets corrected to "karpenter / TBD / TBD" in the post-phase doc-drift commit. Planner evaluates: (i) `karpenter-right-sizing.mdx` NodePool topology (strong fit — already has PodLifecycleAnimation, one more visual aids the narrative), (ii) vault-sourced hosts/three-tier architecture diagram (if planner finds content that warrants a blog post extension), (iii) MCP post might itself warrant 2 diagrams (client-server flow + server-resource fan-out). Minimum ship: MCP-client-server + 1 karpenter diagram. Stretch: +1 if trivial.
- **D-04c:** **Phase 6 companion posts are natural stress-test follow-on.** DKT + AWS RU companion posts (Phase 6) will exercise the pipeline again on real content. Phase 4 is the infrastructure + first content drop; Phase 6 is the validation-via-usage.

### a11y Budget + Dimensions
- **D-05:** **SVG per-file budget: ≤ 10 KB after SVGO** per DIAG-02. Script runs SVGO with default preset + `removeTitle: false` + `removeDesc: false` (preserve injected a11y nodes). If output > 10 KB, script errors and prints SVGO diff summary — forces author to simplify the diagram or adjust canvas zoom (PITFALLS.md Pitfall 9 — zoom-to-fit before export).
- **D-05b:** **No `.prose img` override needed in v1.** Existing typography handles `<img>` with `max-width: 100%` via `@tailwindcss/typography`. Planner verifies on actual MCP post render — if diagrams look cramped or oversized on 1440/375px, add a scoped override then.

### REQUIREMENTS.md Doc-Drift Fix (post-phase)
- **D-06 (revised 2026-05-03 per D-01e):** **Post-phase corrective commit** updates `.planning/REQUIREMENTS.md`:
  - ~~DIAG-01: `@aldinokemal2104/excalidraw-to-svg` → `@excalidraw/excalidraw`~~ **DROPPED — REQUIREMENTS.md DIAG-01 was always correct; library choice per D-01e now aligns with the document.**
  - DIAG-05: "karpenter / manifests / TBD-third" → "MCP + karpenter + 1-2 stretch" (D-04b). **Still needed.**
  - Pattern mirrors Phase 3 D-01e.

### Claude's Discretion (planner decisions)
- **Exact JSDOM shim** (jsdom / happy-dom / linkedom) — planner picks during research based on `@excalidraw/excalidraw` export API surface.
- **SVGO plugin config tuning** — default preset or custom stripped-down list; must preserve `<title>`/`<desc>` and accurate fills/strokes.
- **3rd (stretch) diagram slot** — fill or skip based on content fit. If karpenter NodePool diagram lands cleanly, stretch is a 2nd karpenter diagram or new MCP post 2nd diagram.
- **Batch script** (`npm run diagrams:build`) — add only if planner finds its implementation cost < 30 LOC; otherwise documented shell `for` loop in runbook.
- **`diagrams-source/README.md`** — 1-pager runbook ("how to author a diagram, export, embed") lives in `diagrams-source/README.md` or a section of `docs/` or appended to `CLAUDE.md`. Planner picks the most-discoverable home.
- **Script error handling** — exit codes, stderr messages, `--help` flag. Keep simple (mjs, no commander); match Phase 1's `scripts/generate-icons.mjs` conventions.
- **Metadata file format** — `{ title, descEn, descRu }` locked; extensions like `altEn`/`altRu` for `<img>` pre-generation deferred unless planner sees clean fit.

### Folded Todos
*No pending todos matched Phase 4 (gsd-sdk `todo.match-phase 4` returned 0). Nothing folded.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §Phase 4 Excalidraw Pipeline — 5 success criteria (script, ≤ 10 KB budget, path convention, MCP post replacement, 2-3 stretch diagrams)
- `.planning/REQUIREMENTS.md` §Excalidraw Pipeline — DIAG-01..05 full spec (note: DIAG-01 names wrong package per D-01b; DIAG-05 names `manifests` per D-04b — both get corrected post-phase per D-06)

### Reference context
- `.planning/notes/rich-media-integration.md` §2 Excalidraw integration — original scoping doc, recommends static SVG export (Recommendation line ~91)
- `.planning/research/ARCHITECTURE.md` §Excalidraw Integration (Wave 3) — export workflow + `exportToSvg` utility usage
- `.planning/research/STACK.md` §Wave 3 — `@excalidraw/excalidraw ^0.17.0 (NEW dev dep)` entry
- `.planning/research/PITFALLS.md` §Pitfall 6 (prod bundle), §Pitfall 9 (viewBox optimization) — both actively mitigated in phase

### Reference artifact (brand / tokens)
- `src/styles/design-tokens.css` — Deep Signal palette. Diagrams render with original Excalidraw palette in v1 (D-03b), but `<img>` alt + any `.prose img` overrides respect token budget.

### Code references (what to read / mirror)
- `src/content/blog/en/2026-03-02-mcp-servers-plainly-explained.md` — ASCII diagram lives around the "shape of it" section (`[ Client: Claude Code ] ←→ [ MCP Server ] ←→ [ External resource: docs / DB / API ]`). DIAG-04 target.
- `src/content/blog/ru/2026-03-02-mcp-servers-plainly-explained.md` — RU locale mirror of same post; DIAG-04 lands in both.
- `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` — DIAG-05 primary stress-test target (NodePool topology diagram candidate).
- `public/blog-assets/2026-03-20-karpenter-right-sizing/` — existing assets directory; `public/blog-assets/<slug>/` convention from D-02b mirrors this shape.
- `scripts/generate-icons.mjs` — existing Node script in project. Pattern for `scripts/excalidraw-to-svg.mjs`: mjs, stdlib-first, clear error messages, idempotent.
- `package.json` — existing `devDependencies` block; new entries (`@excalidraw/excalidraw`, JSDOM shim, `svgo`) land here.
- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — Priority 1 `excalidraw` row currently describes intent without a delivery path. Phase 4 completes that path; post-phase update documents the `.excalidraw → scripts/excalidraw-to-svg.mjs → public/blog-assets/<slug>/diagrams/*.svg → <img>` flow with a concrete example. Vault-mirror per three-way-sync rule.

### Prior phase context
- `.planning/phases/01-rich-media-primitives/01-CONTEXT.md` §Deferred Ideas → To Phase 4 — Phase 1 explicitly deferred `scripts/slidev-slide-to-svg.mjs` to Phase 4. Decision D-04 here defers further (different pipeline, no current consumer).
- `.planning/phases/02-code-block-upgrades/02-CONTEXT.md` — Phase 2's exact-pin pattern (`astro@5.18.0`) informs D-01d package-pinning discipline.
- `.planning/phases/03-ui-polish/03-CONTEXT.md` §D-01e, D-04e — REQUIREMENTS.md doc-drift post-phase commit pattern (informs D-06) + atomic `fix(NN): ...` commit pattern for each shipped diagram.

### Skills / tooling
- `~/.claude/skills/excalidraw/SKILL.md` — delegation rules (main agent never reads `.excalidraw.json`; subagents do the JSON work). Phase 4's `excalidraw-to-svg.mjs` runs WITHOUT Claude in the loop — pure Node script — but the authoring flow (user draws diagram, Claude explains it, etc.) still goes through the excalidraw skill per the delegation rules.
- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` — Priority 0 (reuse vault PNG) / Priority 1 (route to skill) routing. Phase 4 gives the `excalidraw` skill a concrete delivery path (static SVG via this pipeline) to add to the doc.

### Libraries
- `@excalidraw/excalidraw` (new devDep, pin exact version per D-01d). `exportToSvg()` entry point. Docs: https://docs.excalidraw.com (authoritative; verify API during planning via Context7 MCP).
- `svgo` (likely new devDep unless already transitively installed). Default preset + preserve `<title>`/`<desc>`.
- JSDOM shim (jsdom / happy-dom / linkedom) — planner picks per D-01c.

### Project constraints
- `CLAUDE.md` §Architecture — zero-JS default (pipeline script is dev-time only; `<img>` emits zero JS on prod).
- `CLAUDE.md` §Deep Signal Design System — token-only constraint applies to any new `.prose` CSS rules, NOT to emitted SVG content (D-03b keeps Excalidraw palette).
- `CLAUDE.md` §Publishing Workflow — Phase 4 qualifies for branch flow (adds npm devDeps, new script, content edits in published posts, new path conventions).
- `.planning/PROJECT.md` §Validated decisions — zero-JS default, bilingual parity, self-hosted (pipeline output is self-hosted SVG, not CDN).
- `.planning/STATE.md` — current phase 4 position.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`scripts/generate-icons.mjs`** — existing idempotent Node ESM script for `public/` asset generation (used in Phase 11 of v0.4 for favicon pipeline). Pattern to mirror for `scripts/excalidraw-to-svg.mjs`: shebang-less mjs, top-level `await`, explicit error messages, single-purpose entry point.
- **`public/blog-assets/<slug>/` convention** — already in use for `2026-03-20-karpenter-right-sizing/`. Phase 4 extends with `diagrams/` subfolder, keeping the per-post asset locality.
- **MDX `<img>` rendering via Astro + `@tailwindcss/typography`** — already works in existing posts. Phase 4 adds no new rendering infrastructure for the canonical path.
- **Bilingual post mirror pattern (EN + RU in `src/content/blog/{en,ru}/`)** — existing MCP post uses the same slug in both locales, same asset references. DIAG-04 lands a single SVG referenced by both locales' MDX with localized `alt`.
- **SVGO likely in transitive deps via Astro/Vite** — planner verifies; if present, reuse; if not, explicit install.
- **Phase 1 `src/components/visuals/README.md` primer pattern** — can model `diagrams-source/README.md` runbook on it (if that's where the runbook lands per planner's discretion).

### Established Patterns
- **Exact-pin devDeps** (Phase 2's `astro@5.18.0` discipline) — `@excalidraw/excalidraw` gets the same treatment (D-01d).
- **Atomic `fix(04): ...` commits per diagram** (Phase 3 D-04e mirror) — each shipped diagram = one commit, message names the post + diagram name.
- **Post-phase REQUIREMENTS.md doc-drift commit** (Phase 3 D-01e / D-06 here) — one batched commit, fixes DIAG-01 + DIAG-05 language, lands after phase verification.
- **Bilingual edits mandatory** — any MDX/MD change in EN has mirror in RU. MCP post gets paired edits; alt text localized, SVG path identical.
- **Zero hex in components** — not applicable to emitted SVG content (D-03b), but applicable to any new CSS rules (none planned).

### Integration Points
- `scripts/excalidraw-to-svg.mjs` — new file, positional-args CLI, exit codes, runs via `node scripts/excalidraw-to-svg.mjs <src> <dst>`.
- `package.json` — new devDeps (`@excalidraw/excalidraw` pinned, JSDOM shim, `svgo`), no new scripts unless planner adds `diagrams:build` convenience.
- `diagrams-source/` — new top-level directory, committed. Contains `<slug>/<name>.excalidraw.json` + `<name>.meta.json` pairs + `README.md` runbook (location at planner's discretion).
- `public/blog-assets/<slug>/diagrams/*.svg` — new file(s) per diagram, committed as SVG source-of-truth-for-deploy.
- `src/content/blog/{en,ru}/2026-03-02-mcp-servers-plainly-explained.md` — ASCII diagram swap in both locales.
- `src/content/blog/en/2026-03-20-karpenter-right-sizing.mdx` + RU mirror (if planner chooses karpenter as DIAG-05 target #1) — add 1 diagram per locale.
- `.claude/skills/vv-blog-from-vault/references/visuals-routing.md` + vault mirror — post-phase update to Priority 1 `excalidraw` row with concrete delivery path + example.
- `.planning/REQUIREMENTS.md` — post-phase doc-drift commit per D-06.

### Creative options (planner discretion)
- **Metadata file format alternatives** — JSON5 for comments, YAML for readability, or plain JSON. Lock JSON in v1 (matches `package.json`/config.json ecosystem discipline).
- **SVGO custom plugins** — can strip `<metadata>`, `editor-data`, excess whitespace; preserve `viewBox`, `<title>`, `<desc>`, inline fill/stroke attributes. Planner tunes, documents in runbook.
- **`.prose img` margin tightening** — if diagrams feel cramped against next paragraph, add `.prose img { margin-block: 1.5rem; }` scoped to blog. Verify on real MCP render first.
- **`loading="lazy"` on above-the-fold diagram** — if a diagram is in the intro section and above the fold, `loading="eager"` is correct to prevent LCP miss. Planner checks position on the MCP post before final value.

</code_context>

<specifics>
## Specific Ideas

- User chose "Recommended" on all 4 gray areas (mirrors Phase 1/2/3 pattern). Preferences align with reference-first + zero-JS discipline: official upstream library, source-in-repo, standard `<img>` tag, tight scope.
- User explicitly vetoed Slidev fold-in (D-04) — not a "scope creep rejection" but a pragmatic "different pipeline, no consumer, defer further" call. The Phase 1 handoff note gets closed as "defer to future milestone" rather than "absorbed into Phase 4".
- User accepted that `manifests` post is text-only — REQUIREMENTS.md DIAG-05 language was aspirational; Phase 4 adjusts reality (D-04b, D-06).
- Original Excalidraw palette stays (D-03b) — user did not raise token-matching concern, so keeping the hand-sketched aesthetic as author intent.
- Source-of-truth split (JSON in `diagrams-source/`, SVG in `public/blog-assets/`) respects zero-JS budget by keeping `.excalidraw.json` out of `dist/` while preserving reproducibility.
- Metadata-beside-source pattern (`<name>.meta.json`) avoids AI-guessed a11y text — author writes title/desc once, script injects deterministically.
- Official `@excalidraw/excalidraw` + JSDOM shim adds ~10-20 MB to devDeps but zero bytes to runtime bundle. Acceptable trade per PITFALLS.md Pitfall 6 boundary (the risk is *importing* in a shipped component; devDep + script is fine).

</specifics>

<deferred>
## Deferred Ideas

### To a future milestone or backlog item
- **`scripts/slidev-slide-to-svg.mjs`** (Phase 1 handoff, D-04 here defers further): static export of one Slidev slide → SVG for non-animated inline embed. Different pipeline from Excalidraw (Vue + scoped `<style>` vs clean JSON), no current consumer in v1.0 since PodLifecycleAnimation already ported to primitives. Better solved via `slidev export --format svg` inside `vedmichv/slidev` repo's CI (aligns naturally with Phase 5 Slidev integration) than a standalone script in vedmich.dev. Capture as backlog; decide in Phase 5 discuss whether to absorb there or defer to v1.1.
- **Theme-aware diagrams (auto-recolor on light/dark toggle)** — deferred with the broader light-mode UI toggle story. Site is dark-only for users today; light tokens only ship to OG/LinkedIn templates. If light mode ever ships, re-export diagrams via script flag (e.g., `--palette deep-signal-tokens`) — no runtime swap.
- **CI job auto-rebuilding SVGs on `diagrams-source/` change** — would allow `.excalidraw.json` to be the only committed artifact with SVG regenerated in CI before `astro build`. Adds CI complexity; GH Actions env needs the same devDeps. Current approach (commit both) is simpler and reproducibly matches local behavior.
- **Inline `<svg>` import with `currentColor`** (D-03 rejected alternative) — revisit if Deep Signal strongly diverges from Excalidraw palette or if light-mode launch makes per-theme recoloring necessary.
- **Batch mode with glob discovery** — script could auto-discover `diagrams-source/**/*.excalidraw.json` and rebuild all. Kept out of v1 for predictability; revisit if diagram count exceeds ~10.
- **Hybrid two-SVG output** (original + tokenized) — rejected in scope discussion. Revisit only if a specific post needs both aesthetics.

### To Phase 5 (Slidev Integration)
- **Slidev-slide-to-SVG evaluation** — re-ask in Phase 5 discuss whether `slidev export` pipeline belongs in the Slidev repo's CI or elsewhere. Deferred from Phase 1 + Phase 4 without loss.

### To Phase 6 (Companion Posts)
- **Companion-post diagrams via this pipeline** — DKT + AWS RU companion posts will naturally exercise the pipeline on real content. No action needed in Phase 4; Phase 6 planner uses the pipeline as reference.

### Not in v1.0
- **Interactive `<Excalidraw>` component in MDX** — rejected per REQUIREMENTS.md + PITFALLS.md Pitfall 6 (blows zero-JS budget).
- **Slidev-exact fidelity diagrams** — out-of-scope per PROJECT.md §Not in scope for v1.0.
- **Auto-generated diagram titles/descs from content** — explicit author-written metadata only; AI-guessed a11y text is a regression vector.

### Reviewed Todos (none matched)
*`gsd-sdk todo.match-phase 4` returned 0 matches. Nothing folded, nothing deferred from todo backlog.*

</deferred>

---

*Phase: 4-excalidraw-pipeline*
*Context gathered: 2026-05-03*
