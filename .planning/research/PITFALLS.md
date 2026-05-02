# Domain Pitfalls — v1.0 Content Platform

**Domain:** Astro static site enhancement with rich media primitives + Slidev integration
**Researched:** 2026-05-02

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: CSS `offset-path` for Packet Animations in Responsive Containers
**What goes wrong:** Using CSS `offset-path: path('M x1 y1 L x2 y2')` to animate packets along wires. When the container uses `aspect-ratio` + percentage widths for responsive sizing, the CSS coordinate space scales unpredictably. Result: packets drift off the wire path on certain screen sizes (e.g., mobile vs desktop).

**Why it happens:** CSS `offset-path` coordinates are in the CSS coordinate space, which is determined by the container's computed width/height at runtime. SVG viewBox coordinates are user-space, independent of container size. Mixing the two causes coordinate mismatch.

**Consequences:** Animations look broken on mobile or non-1440px viewports. Debugging is painful because it works on *some* screen sizes. Users on mobile see packets floating in the wrong place.

**Prevention:** ALWAYS use SMIL `<animateMotion>` inside an SVG with a stable viewBox (e.g., `viewBox="0 0 1800 820"`). All nodes, wires, and packets share the same SVG user-space coordinates. Container can scale responsively without breaking animation paths.

**Detection:** Test animation on 3 viewport widths (mobile 375px, tablet 768px, desktop 1440px). If packet positions differ, you hit the CSS offset-path bug.

**Evidence:** Empirically validated during Phase 9 hotfix for vedmich.dev. Switching from CSS `offset-path` to SMIL `<animateMotion>` fixed the drift. Documented in `PodLifecycleAnimation.astro` header comment.

---

### Pitfall 2: Global Shiki Config Change Without Regression Testing All Posts
**What goes wrong:** Modifying `astro.config.mjs` `markdown.shikiConfig` (theme, transformers, langAlias) affects ALL code blocks site-wide, including existing posts. If a transformer breaks existing syntax or the theme changes token colors drastically, all posts regress simultaneously.

**Why it happens:** Shiki is build-time and markdown-scoped. No per-post override. One config change = global impact.

**Consequences:** Code blocks render with wrong colors, highlight syntax breaks, or build fails with cryptic Shiki errors. Fixing requires auditing every post.

**Prevention:**
1. **Test on existing posts first.** After Shiki config change, build site and visually inspect 3-5 existing posts' code blocks.
2. **Pin Astro version** during Shiki work. Astro minor upgrades can change Shiki transformer API.
3. **Screenshot comparison.** Use Playwright to capture before/after screenshots of one post's code block.
4. **Gradual rollout.** Add transformer, test, then add theme override, test again. Don't change 3 things at once.

**Detection:** Build succeeds but code blocks look wrong (missing colors, wrong language badge, highlight syntax ignored). Or build fails with Shiki parsing error.

---

### Pitfall 3: Rebuilding Slidev Decks on Every Main Site Deploy
**What goes wrong:** Running `slidev build` for every deck inside `vedmich.dev` CI on every push to main. Each deck takes 10-30s to build. For 10 decks, that's 100-300s (1.5-5 min) added to CI.

**Why it happens:** Misunderstanding Slidev workflow. Thinking decks must be built from source every time like Astro pages.

**Consequences:**
- CI time balloons from 2 min to 5+ min.
- Slidev errors (missing deps, theme issues) block main site deploys.
- Main site `package.json` grows with Slidev dependencies (Vue, Vite, theme packages).

**Prevention:** Pre-build Slidev decks in a separate repo (`vedmichv/slidev`), commit built SPA artifacts, reference via git submodule. Main site CI only copies static files (`cp -r slidev/* dist/slides/`). No Slidev build step required.

**Detection:** CI takes >3 min after Slidev integration. `package.json` has `@slidev/cli` or `vue` as dependencies (shouldn't be there).

---

### Pitfall 4: Hardcoding Animation Coordinates in Component Logic
**What goes wrong:** Putting node positions or wire paths inside component TypeScript logic (e.g., computed from props, stored in arrays, mapped in loops). Slide authors can't see the layout without reading code.

**Why it happens:** Trying to be DRY or "clever" by abstracting coordinates.

**Consequences:**
- Opaque components. Hard to port a Slidev slide because you can't see the layout at the call site.
- Debugging animation issues requires tracing through component logic instead of reading declarative props.

**Prevention:** Accept explicit x/y/path props. Coordinates should be visible in the MDX call site:
```astro
<VvNode x="20%" y="40%" label="API" />
<VvWire x1="280" y1="410" x2="360" y2="410" />
```
Don't abstract into `<VvNode id="api" />` with coordinates looked up in a config object.

**Detection:** You can't tell where a node is positioned by reading the MDX. You have to open the component file.

---

## Moderate Pitfalls

### Pitfall 5: Not Pinning Astro Version During Shiki Work
**What goes wrong:** Astro minor version upgrades can change Shiki transformer API or token class names. If you upgrade Astro mid-milestone, Shiki config may break.

**Prevention:** Pin Astro to exact version in `package.json` during v1.0 development. After v1.0 ships, relax to `^5.17.1`.

---

### Pitfall 6: Using `@excalidraw/excalidraw` in Production Bundle
**What goes wrong:** Importing `@excalidraw/excalidraw` in a component that ships to the browser. Adds ~1MB to bundle, breaks zero-JS budget.

**Prevention:** Only use `@excalidraw/excalidraw` in Node.js scripts (`scripts/excalidraw-export.mjs`). Mark as dev dependency. Export to static SVG, embed SVG in posts.

**Detection:** Bundle size check shows 1+ MB increase. Lighthouse reports slow JS parse time.

---

### Pitfall 7: Forgetting to Update Git Submodule After Adding a New Deck
**What goes wrong:** Author builds a new Slidev deck, commits to `vedmichv/slidev` repo, but forgets to run `git submodule update --remote slidev` in `vedmich.dev`. Main site still references old submodule commit. New deck doesn't appear on site.

**Prevention:** Document "add a new deck" workflow clearly in CLAUDE.md or `.planning/notes/`. Add a checklist step: "Update submodule pointer in main site."

**Detection:** Deck exists in `vedmichv/slidev` repo but `/slides/<slug>/` returns 404 on live site.

---

### Pitfall 8: Language Badge Implementation as Runtime JS
**What goes wrong:** Injecting language badge via client-side JavaScript (e.g., `CodeCopyEnhancer` DOM scan). Adds JS to every page, increases LCP if script blocks rendering.

**Prevention:** Implement language badge as a remark plugin (build-time AST modification). If remark is too complex, extend `CodeCopyEnhancer` but ensure it's SSR via `is:inline` script, not client-side hydration.

**Detection:** Lighthouse reports "Avoid large JavaScript" warning. Language badges flicker on page load (FOUC).

---

## Minor Pitfalls

### Pitfall 9: Excalidraw SVG Export Without Viewbox Optimization
**What goes wrong:** Excalidraw default SVG export may have large viewBox (e.g., `viewBox="0 0 5000 3000"`) if canvas is zoomed out. SVG file size balloons.

**Prevention:** Zoom to fit diagram in Excalidraw before exporting. Or post-process SVG with SVGO to optimize viewBox.

**Detection:** SVG file is >500 KB for a simple diagram.

---

### Pitfall 10: Not Testing Slidev Client-Side Routing
**What goes wrong:** Slidev SPA uses Vue Router for slide navigation (`/slides/<slug>/1`, `/slides/<slug>/2`). If GitHub Pages doesn't serve `index.html` for 404s, client-side routing breaks.

**Prevention:** Verify GitHub Pages serves SPA correctly. Add a test: navigate to `/slides/<slug>/5` directly (not via homepage link). Should work.

**Detection:** Direct navigation to a slide number returns 404. Only the deck root (`/slides/<slug>/`) works.

---

### Pitfall 11: Shiki Theme CSS Overrides Not Scoped to `.prose`
**What goes wrong:** Adding Shiki token overrides in global CSS without `.prose` scoping. May affect non-blog code blocks (e.g., homepage snippets if any).

**Prevention:** Scope Shiki overrides to `.prose .shiki` or similar. Only blog posts use `.prose`.

**Detection:** Code blocks outside blog posts (if any exist) have wrong colors.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Wave 1 (Primitives) | Pitfall 4 (hardcoding coordinates) | Explicit API design review before coding; validate on one slide first |
| Wave 2 (Shiki) | Pitfall 2 (global config regression) | Regression test all 4 existing posts; pin Astro version |
| Wave 2 (Shiki) | Pitfall 8 (language badge as runtime JS) | Research spike: remark plugin first, fall back to SSR CodeCopyEnhancer |
| Wave 3 (Excalidraw) | Pitfall 6 (excalidraw in production bundle) | Keep `@excalidraw/excalidraw` as dev dependency, only use in scripts |
| Wave 4 (Codegen) | Unknown parsing complexity | Timebox codegen to 10-15h; if it exceeds 20h, abort and stay manual |
| Wave 5 (Slidev) | Pitfall 3 (rebuilding decks in CI) | Pre-build decks in separate repo, copy static artifacts only |
| Wave 5 (Slidev) | Pitfall 7 (forgetting submodule update) | Document workflow; add CI check that fails if submodule is behind remote |
| Wave 5 (Slidev) | Pitfall 10 (client-side routing broken) | Test direct navigation to `/slides/<slug>/3` after deploy |
| Wave 6 (Companion posts) | Pitfall 1 (CSS offset-path if primitives not used) | Use primitives (SMIL-based) for all animations; ban CSS offset-path |

## Anti-Pattern Summary

| Anti-Pattern | Correct Pattern |
|--------------|-----------------|
| CSS `offset-path` for packet animation | SMIL `<animateMotion>` inside SVG viewBox |
| Shiki config change without testing | Test on 3-5 existing posts, pin Astro version |
| Rebuilding Slidev in main CI | Pre-build in separate repo, copy static files |
| Coordinates in component logic | Explicit x/y props in MDX call site |
| `@excalidraw/excalidraw` in prod bundle | Dev dependency only, export to static SVG |
| Language badge as client-side JS | Remark plugin (build-time) or SSR script |
| Global Shiki CSS not scoped | Scope to `.prose .shiki` |
| Forgetting submodule update | Document workflow, add CI check |

## Sources

- **Pitfall 1 (CSS offset-path)** — Phase 9 hotfix experience, documented in `PodLifecycleAnimation.astro` (HIGH confidence, empirical)
- **Pitfall 2 (Shiki global config)** — Astro docs + Context7 (HIGH confidence)
- **Pitfall 3 (Slidev rebuild)** — Research on git submodule vs build-time patterns (HIGH confidence)
- **Pitfall 4 (hardcoded coordinates)** — API design experience from Slidev Vue primitives analysis (MEDIUM confidence)
- **Pitfall 6 (excalidraw in bundle)** — npm package size + zero-JS budget constraint (HIGH confidence)
- **Pitfall 7 (submodule update)** — Git submodule workflow knowledge (HIGH confidence)
- **Pitfall 8 (language badge runtime JS)** — Astro performance best practices (MEDIUM confidence)
