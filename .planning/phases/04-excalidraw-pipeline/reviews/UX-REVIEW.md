# Phase 4 — Excalidraw Pipeline Visual / UX Review

**Scope:** two shipped Excalidraw SVGs embedded in bilingual blog posts
**Mode:** visual/UX/accessibility review *beyond* the automated Phase 4 verification (which passed)
**Reviewer lens:** careful designer reviewing a production shipment on the Deep Signal dark theme

**Shipment surface:**
- `public/blog-assets/2026-03-02-mcp-servers-plainly-explained/diagrams/client-server.svg` (9,673 B, 820×100, Virgil embedded)
- `public/blog-assets/2026-03-20-karpenter-right-sizing/diagrams/split-ownership.svg` (7,338 B, 1020×520, Helvetica — no embed)
- `src/content/blog/{en,ru}/2026-03-02-mcp-servers-plainly-explained.md`
- `src/content/blog/{en,ru}/2026-03-20-karpenter-right-sizing.mdx`
- `diagrams-source/README.md`

**Site rendering context:**
- Blog article layout: `<article class="max-w-3xl mx-auto px-4 sm:px-6">` → max content width **768 − 32 = 736 px** on desktop.
- Mobile viewport 375 px → **343 px** content width after the 16 px horizontal padding.
- Prose surface: Deep Signal dark (`--bg-base: #0F172A`, `--text-primary: #E2E8F0`) — no light-mode toggle.
- Both SVGs render via `<img src="...">` with `style="max-width:100%; height:auto"`.

---

## Severity legend

- **BLOCKER** — ship-stopper for a production post; visual/a11y regression users will notice immediately.
- **WARNING** — noticeable but not deal-breaking; fix within a follow-up cycle.
- **ENHANCEMENT** — polish / nice-to-have; defer without guilt.

Phase 4 has already shipped, so BLOCKER here means "needs a follow-up patch before the posts are promoted on LinkedIn / Twitter"; WARNING means "fix in the next Phase 4 touch-up sweep."

---

## UX-01 (BLOCKER): Hard-coded white `#fff` background on SVGs creates a jarring light slab inside Deep Signal dark prose

**Severity:** BLOCKER — this is the single biggest visual contrast issue in the shipment.

**Evidence:** both SVGs start with a full-size white rectangle before any other geometry. From `client-server.svg`:

```xml
<path fill="#fff" d="M0 0h820v100H0z"/>
```

From `split-ownership.svg`:

```xml
<path fill="#fff" d="M0 0h1020v520H0z"/>
```

**Visual result on the dark theme:**
- `--bg-base = #0F172A` (dark slate) meets `#fff` — max contrast delta (21:1).
- The MCP post has the diagram above-the-fold (`loading="eager"`) right after an explanatory paragraph. The eye lands on the bright rectangle first, *then* reads the labels — the prose rhythm breaks.
- The Karpenter diagram is taller (520 px natural, ~367 px displayed on desktop). That's a 367 × 720 px bright slab inside dark prose — a screen-size light flash at night, and visually incoherent with the rest of the page.

**Recommendation** (pick one):

1. **Re-export without explicit white background.** Excalidraw's "export with dark background" option keeps the sketch but uses a transparent canvas; then the SVG inherits the page background. One-line fix in the authoring step. *(Preferred — keeps the hand-sketched feel while letting the diagram sit on the Deep Signal canvas.)*

2. **Post-process with SVGO** to strip the opening `<path fill="#fff" .../>` rectangle. Safe because it's always the first path (just after `<defs>`), always a full-canvas rect.

3. **Wrap `<img>` in a light-themed `<figure>`** with a near-white background and 12–16 px padding — intentionally treating the diagram as a framed illustration, like a whiteboard photograph. Pre-empts the contrast jolt by signaling "this is a different surface."
   ```html
   <figure class="bg-slate-50 rounded-lg p-4 my-6">
     <img .../>
   </figure>
   ```

4. **CSS-only dark-mode hack** — `filter: invert(1) hue-rotate(180deg)` inverts colors but preserves hues. Cheap, but the hand-sketched aesthetic looks wrong inverted (teal arrows become pink, black strokes become white-on-white if the bg is also inverted). Do not use.

**My pick:** option (1) at authoring time + option (3) in the embed, belt-and-suspenders. Add runbook guidance: "export with transparent background, always."

---

## UX-02 (BLOCKER): MCP diagram labels drop below 7 px on mobile — below the threshold of legibility

**Severity:** BLOCKER for mobile readers.

**Evidence — parse the MCP SVG text elements:**

```xml
<text x="80" ... font-family="Virgil, Segoe UI Emoji" font-size="16" ... transform="translate(30 38)">Claude Code</text>
<text x="60" ... font-size="16" ... transform="translate(330 38)">MCP Server</text>
<text x="100" ... font-size="16" ... transform="translate(590 38)">docs / API</text>
```

Natural `font-size` is 16 px inside a 820 × 100 viewBox.

**Scaling math on 375 px mobile viewport:**

| Dimension | Natural | Displayed on 343 px column | Ratio |
|---|---|---|---|
| Width | 820 | 343 | 0.418 |
| Height | 100 | **41.8** | 0.418 |
| Label `font-size` | 16 | **6.69** | 0.418 |
| `stroke-width` | 2 | 0.84 (sub-pixel) | 0.418 |

**Legibility assessment:**
- 6.7 px is below any accessibility guideline — 9 px is the casual floor for short labels; 11 px is the preferred minimum.
- 42 px total height is *marginal but acceptable* for a 3-box horizontal diagram, **if the labels were readable** — which they aren't at 6.7 px.
- The bidirectional double-arrows also scale down sub-pixel (0.84 px stroke) and will shimmer / antialias to a blur on high-DPR mobile displays.

**Phase 4 UAT said "labels are legible on both 1440×900 desktop and 375px mobile" and marked pass.** The UAT verified the DOM layout (343×42 aspect preserved, CLS-free) — not the actual readability at that size. This is a typography-scale gap, not an automated-test gap.

**Recommendation:**

1. **Redesign the MCP diagram to a 2:1 or 3:1 aspect ratio** (e.g. 820 × 340 or 800 × 300). At 343 × 143 mobile, the 16 px label becomes ~6.7 px… same problem. Because `font-size` inside an SVG scales with the containing viewport, increasing the viewBox height alone doesn't fix it.

2. **Actual fix — bump the label `font-size` inside the SVG.** The authoring-time move is to make labels font-size 28–32 in Excalidraw (with the same ~40 px canvas height) so they stay readable at 0.418 scale (28 × 0.418 = 11.7 px, 32 × 0.418 = 13.4 px — both readable). The diagram then works responsive.

3. **Alternative — stop shrinking at small viewports.** Set a `min-width` on the `<img>` so it never scales below ~600 px, adding horizontal scroll inside `<figure>`:
   ```html
   <figure style="overflow-x: auto">
     <img ... style="min-width: 600px; max-width: 100%; height: auto;" />
   </figure>
   ```
   Not ideal (horizontal scroll on mobile is friction), but preserves legibility for readers who need it.

**My pick:** option (2). Also add guidance to the runbook: "Diagrams that will be viewed on mobile should use font-size 28–32 in Excalidraw to survive scale-down."

---

## UX-03 (WARNING): MCP diagram 8.2:1 aspect ratio is extreme — creates visual weight imbalance with surrounding prose

**Severity:** WARNING.

**Evidence:**
- MCP: 820 × 100 = **8.2:1** (extremely wide, like a banner ad).
- Karpenter: 1020 × 520 = 1.96:1 (close to a 2:1 illustration).
- Reference for "normal" illustration ratios: Medium articles typically use 3:2 (1.5:1) or 16:9 (1.77:1); very wide 4:1 is seen in process flows; 8:1 is unusual.

**What this looks like in a blog post:**
- On desktop (736 px prose column, scale 0.898), the MCP diagram renders as 736 × 90 — a thin horizontal band.
- Surrounded by ~24–28 px `leading-relaxed` body text, the 90 px strip becomes visually equivalent to **3 lines of text** worth of height. Readers skim past it because it reads like a decorative rule, not like "this is the architecture diagram."
- Karpenter's 367 px displayed height reads correctly as an illustration.

**Why it matters:** the MCP post's single diagram is the primary visual asset of the article. A reader on desktop who skims the post at 200% scroll speed will see it as a separator bar, not a diagram.

**Recommendation:**

1. **Add vertical breathing room inside the diagram.** Extend the viewBox to 820 × 300 with the current 3 boxes centered, so the aspect ratio moves to 2.7:1 and the diagram reads as "intentional illustration." This costs zero bytes (just larger viewBox). Side benefit: labels can grow to 24–28 px font-size without crowding, fixing UX-02.

2. **Use a framed `<figure>` wrapper with visible padding** so even a thin diagram reads as "diagram, not separator":
   ```html
   <figure class="my-8 p-6 border border-border rounded-lg bg-surface/30">
     <img src=".../client-server.svg" ... />
   </figure>
   ```
   Doesn't fix the underlying ratio but visually tells the reader "stop, this is different content."

3. **If the thin-banner form is intentional** (sometimes a horizontal MCP flow reads better wide), add a caption *beneath* the image in a `<figcaption>` to anchor it as labeled content:
   ```html
   <figure>
     <img ... />
     <figcaption class="text-sm text-text-muted mt-2 text-center">
       MCP client-server flow — Claude Code → MCP Server → external resources
     </figcaption>
   </figure>
   ```

**My pick:** option (1) for authoring, option (3) for the embed. Both posts should get `<figure>`/`<figcaption>` treatment for consistency with the Karpenter diagram too.

---

## UX-04 (BLOCKER for Windows/Linux readers, WARNING for macOS): Karpenter diagram ships without an embedded font

**Severity:** BLOCKER for Windows/Linux visitors, WARNING overall.

**Evidence:** grep all 6 `<text>` elements in `split-ownership.svg`:

```xml
font-family="Helvetica, Segoe UI Emoji"
```

No `@font-face` `<defs>` block in the SVG. Contrast with the MCP SVG, which opens with a full Virgil `@font-face { src: url(data:font/ttf;base64,AAEA…) format("truetype") }` embed.

**This is already documented in `04-REVIEW.md` as WR-04.** The fix noted there is "re-export the Karpenter diagram with Virgil font." I'm re-flagging it here from the visual/UX angle:

**What a Windows reader sees:**
- Helvetica is not installed on Windows → browser falls back to Arial.
- Arial has different metrics than Helvetica. Labels like "Cluster Autoscaler (system)" (28 chars at 20 px) will render *wider* in Arial than in Helvetica.
- Because the SVG's `<text>` coordinates are authored against Helvetica's width, Arial text may overflow the rounded rectangle border — "(system)" gets clipped or bleeds over the right edge.

**What a Linux (Ubuntu default) reader sees:**
- DejaVu Sans, Liberation Sans, or whatever the Fontconfig priority resolves to.
- Even more metric drift. Mixed-script fallback for `Segoe UI Emoji` is platform-dependent.

**What a reduced-motion / e-reader / Kindle-like viewer sees:**
- Whatever the device's generic sans is. Low-end Android may render with Roboto; metrics differ from both Helvetica and Arial.

**Beyond WR-04 (which I agree with):** the runbook gotcha at `diagrams-source/README.md:98` ("Virgil-only text keeps the budget") frames font choice as a **byte-budget concern only**. Visual consistency across OSes is an equally important concern that isn't called out. I'd rewrite the gotcha as:

> **System fonts cause OS-dependent rendering.** The wrapper only embeds Excalidraw-native fonts (Virgil, Cascadia, Comic Shanns, Lilita One — the family IDs 1, 3, 4, 5 in `fontFamily`). If you pick `Helvetica`, `Arial`, or any other system font (family IDs 2, 6+), the exported SVG references the font by name only — rendering then depends on the viewer's OS. Windows falls back to Arial (different metrics → labels may overflow); Linux falls back to DejaVu Sans. **Always stick to Excalidraw-native fonts for visual consistency across readers.**

**Recommendation:** re-export the Karpenter diagram with all 6 text elements switched to Virgil. The current byte count (7,338 B) leaves 2,662 B of room under the 10 KB budget — a Virgil subset for "Cluster Autoscaler system Karpenter workloads EKS nodegroup nodepool A B" (≈28 unique glyphs) should fit in ~1.5–2 KB after SVGO compression.

---

## UX-05 (WARNING): `<title>` and `<desc>` inside the SVG are NOT consumed by screen readers when the SVG loads via `<img>`

**Severity:** WARNING — a11y contract is *technically* satisfied via `alt`, but the runbook markets a guarantee it doesn't deliver.

**Evidence:** `diagrams-source/README.md:3`:

> Build-time export of `.excalidraw.json` hand-sketched diagrams to optimized SVG, embedded via `<img>` in MDX **with `<title>`/`<desc>` a11y**.

And `diagrams-source/README.md:23`:

> Every `.excalidraw.json` source needs a sibling `.meta.json` file with authored a11y strings. **The script refuses to run without it** — **no silent a11y regression**.

The SVG does ship with:

```xml
<title>MCP client-server architecture</title>
<desc>Claude Code (client) connects via JSON-RPC to an MCP server, which fans out to external resources: docs, databases, APIs.</desc>
```

**The accessibility problem:**
- When an SVG is referenced via `<img src="diagram.svg">`, browsers render it as an **opaque raster substitute**. The SVG's internal DOM — including `<title>` and `<desc>` — is NOT exposed to the accessibility tree.
- The SVG's `<title>` becomes a browser tooltip on hover (nice for sighted mouse users), but screen readers announce only the `<img alt="...">`, not the SVG's own `<title>` or `<desc>`.
- Source: WAI-ARIA 1.2 §5.4 Embedded Content and WCAG 2.1 §1.1.1 Non-text Content. Matched by empirical testing — NVDA, JAWS, VoiceOver, TalkBack all announce the `<img alt>` attribute and ignore the referenced SVG's internal `<title>`/`<desc>`.

**What actually carries a11y:**
- The `<img alt="..."/>` attribute in the MDX. That's what screen readers read out. The MCP EN post alt:
  > `"MCP client-server architecture: Claude Code connects to an MCP Server, which fans out to external resources (docs, databases, APIs)"`
- The `alt` text *happens* to roughly mirror the SVG's `<title>` + `<desc>`, so the content is approximately right — but this parity is maintained by convention in the runbook, not enforced by the script.

**What `<title>` + `<desc>` *do* give you:**
- Tooltip on hover (mouse users).
- Accessibility if the author later switches from `<img src="...">` to inline SVG (`<svg>...</svg>`) — then they become announced.
- Machine-readable metadata for search engines and archival.
- Graceful fallback if the SVG is ever opened directly in a browser tab (no longer embedded in HTML).

**Recommendation:**

1. **Rewrite the runbook's a11y framing.** The current wording conflates two mechanisms. Honest version:
   > Every `.excalidraw.json` source needs a sibling `.meta.json` file. The `title` and `descEn` values are injected as SVG `<title>` and `<desc>` — these provide hover tooltips, search-engine metadata, and fallback for direct-SVG viewing. **Screen-reader accessibility when embedded via `<img>` is carried by the `alt` attribute in the MDX, not by the SVG's internal `<title>`/`<desc>`.** You are still responsible for writing a good `alt` in every locale's MDX.

2. **Keep the meta sidecar required** (good discipline, helps the author write `alt` in both locales), but reframe it as "authored a11y strings that power both the SVG title/desc and act as the reference text for the author to copy into the MDX `alt` attribute" — not as screen-reader coverage.

3. **Future enhancement (optional):** switch the embed to inline SVG via an `<Image>` component. Then `<title>` + `<desc>` + `aria-labelledby`/`aria-describedby` *do* work as advertised. Costs: no lazy loading, SVG parsing in the HTML stream, larger DOM. Benefit: proper a11y semantics. Likely not worth it for 2 diagrams.

4. **Add `role="img"` and `aria-label` to the `<img>` element** as a belt-and-suspenders hint. Not strictly needed if `alt` is present (they're equivalent), but makes the a11y intent explicit for future maintainers. Skip if `alt` is always guaranteed.

---

## UX-06 (ENHANCEMENT): Bilingual parity holds for alt text, but `<desc>` is English-only for Russian readers

**Severity:** ENHANCEMENT.

**Evidence:** both `.meta.json` files authorize a `descRu` field, both populate it:

```json
{
  "descEn": "Cluster Autoscaler owns system node groups ...",
  "descRu": "Cluster Autoscaler владеет system node groups ..."
}
```

But the script only injects `descEn` into the SVG. From `04-REVIEW.md:404`:

> The script only uses `descEn` (line 128). The runbook explicitly calls this out at line 36: "The script currently injects only descEn into the SVG <desc>; descRu is reserved for a future enhancement."

**Alt-text parity verified by reading both locale posts:**

| Post | EN alt chars | RU alt chars | Par |
|---|---|---|---|
| MCP | 131 | 124 | close |
| Karpenter | 231 | 233 | close |

**Russian Cyrillic rendering:** verified that `alt` attribute containing Cyrillic renders correctly in MDX/MD frontmatter (UTF-8 throughout). No encoding gotchas. The MDX `alt="Архитектура MCP..."` is safe.

**What Russian readers actually get on SVG hover** (tooltip):
- Hovering the image on RU post shows the English `<title>` ("MCP client-server architecture"). Minor friction for a RU reader — they see mixed-language surface.

**Recommendation (defer unless it's easy):**

1. **Minor script enhancement:** inject both `descEn` and `descRu` as `<desc xml:lang="en">` and `<desc xml:lang="ru">` siblings. Modern browsers will pick the matching `:lang()` pseudo-class. SVG2 spec supports this pattern; older browsers silently ignore the extra `<desc>`. Byte cost: ~100–200 B per diagram.

2. **Alternative:** ship two SVGs — `client-server-en.svg` and `client-server-ru.svg` — with localized `<title>`/`<desc>` per locale. Heavy for little gain.

3. **Defer** — the accessibility win is marginal because (per UX-05) `<desc>` isn't consumed by screen readers on `<img>` embeds anyway. Do this only if/when switching to inline SVG.

**My pick:** defer. Track it as a follow-up when Phase 4 gets a post-ship sweep.

---

## UX-07 (WARNING): No `<figure>` / `<figcaption>` pattern — diagrams float in prose without visual anchoring

**Severity:** WARNING.

**Evidence:** both MDX posts embed the diagram as a bare `<img>`:

```html
<img
  src="/blog-assets/.../diagrams/client-server.svg"
  alt="MCP client-server architecture: ..."
  loading="eager"
  width="820" height="100"
  style="max-width: 100%; height: auto;"
/>
```

No wrapping element, no caption, no visible frame. The diagram bleeds directly into the surrounding `<p>`.

**Visual consequence:**
- Between the `<p>` before the diagram and the `<p>` after, prose rhythm expects a visual "pause." A bare `<img>` without padding or caption gives one — but it's silent (just vertical whitespace). The reader has to infer "this illustrates the paragraph I just read."
- On the bright white SVG background (see UX-01), the transition is jarring *and* context-free.
- Professional-grade technical blog posts (AWS Architecture blog, Martin Fowler's bliki, Basecamp's Signal v. Noise) uniformly wrap diagrams in `<figure>` + `<figcaption>` with a short title. Sets expectations and makes the page scannable.

**Recommendation:**

1. **Add a `<figure>` wrapper with a `<figcaption>`** to both posts:
   ```mdx
   <figure class="my-8">
     <img
       src="/blog-assets/.../client-server.svg"
       alt="..."
       loading="eager"
       width="820" height="100"
       style="max-width: 100%; height: auto;"
     />
     <figcaption class="text-sm text-text-muted mt-2 text-center font-mono">
       Figure 1: MCP client → server → external resources
     </figcaption>
   </figure>
   ```

2. **Update the runbook's "Embedding" section** (line 73 of `diagrams-source/README.md`) to show the `<figure>`/`<figcaption>` pattern as the default, with the bare `<img>` as an opt-out for rare cases. Include localized figure labels (`Figure 1` / `Рисунок 1`).

3. **If `<figcaption>` feels too formal** for Viktor's casual blog voice, skip the caption but keep the `<figure>` wrapper for semantic HTML + future CSS hook:
   ```html
   <figure class="my-8">
     <img ... />
   </figure>
   ```

**My pick:** option (1) with a short, punchy figcaption. The mono-font small caption fits Deep Signal's type stack nicely.

---

## UX-08 (ENHANCEMENT): Runbook's authoring guidance lacks visual/scale considerations

**Severity:** ENHANCEMENT (runbook quality).

**Evidence:** `diagrams-source/README.md` covers:
- Font family ("Prefer Virgil" — only for byte budget reasons, see UX-04)
- Byte budget (10 KB post-SVGO)
- Metadata sidecar structure
- CLI invocation
- Embed tag format

**What's missing:**
- No guidance on **aspect ratio** (UX-03: a 8:1 ratio renders badly).
- No guidance on **font-size inside the Excalidraw drawing** (UX-02: 16 px default becomes 6.7 px on mobile).
- No guidance on **stroke-width** (2 px default goes sub-pixel at 0.42× scale).
- No guidance on **background handling** (UX-01: white rect on dark prose is jarring).
- No guidance on when to use Excalidraw vs. `mermaid-pro` vs. a proper component — though the "Further reading" hints at `.claude/skills/vv-blog-from-vault/references/visuals-routing.md`.

**Recommendation — add a "Visual design checklist" section to `diagrams-source/README.md`:**

```markdown
## Visual design checklist

Before re-exporting, verify:

1. **Aspect ratio ≤ 3:1.** Very wide (> 4:1) diagrams read as separator bars
   in prose, not as illustrations. Vertically-dominant (< 1:2) diagrams
   create awkward scroll on mobile. Target 2:1 or 3:2 for most flows.

2. **Label `font-size` ≥ 28 in Excalidraw.** Diagrams scale down with the
   prose column. At max-w-3xl (736 px) on desktop or 343 px on mobile, a
   16 px label becomes 11 px or 6.7 px — below legibility. Set labels to
   28–32 px in Excalidraw so they survive scale-down.

3. **`stroke-width` ≥ 3.** 2 px strokes go sub-pixel on mobile scale-down
   and shimmer/antialias to blur. Use 3 or 4 in Excalidraw.

4. **Transparent background.** Excalidraw's default white canvas renders
   as a bright slab on Deep Signal dark prose. Toggle "Export with
   background" OFF before download, OR post-process the exported SVG to
   remove the opening `<path fill="#fff" .../>` full-canvas rectangle.

5. **Virgil or Excalidraw-native fonts only** (see Gotcha #1 below).

6. **Labels in English only.** The SVG is shared across EN and RU posts
   via different `alt` attributes. Don't localize labels inside the SVG —
   localize via `alt` in the MDX.
```

---

## UX-09 (BLOCKER if any reader uses forced-colors / high-contrast mode): Hard-coded `stroke="#1e1e1e"` breaks Windows High Contrast and forced-colors

**Severity:** BLOCKER for users with `forced-colors: active` (Windows High Contrast mode, some a11y setups).

**Evidence:** every stroke in both SVGs:

```xml
stroke="#1e1e1e"
```

No `stroke="currentColor"`, no SVG CSS variable, no media query for `forced-colors`.

**What happens in forced-colors mode:**
- Windows High Contrast mode forces the browser to override `color` and `background-color` with system colors (black/white/yellow/blue).
- For `<img>`, the raster substitute renders *as-is* — the user's forced-color palette does NOT apply to the SVG's internal strokes.
- So a reader using "White on Black" high-contrast sees: page text in their chosen white-on-black palette, then a stark **white-on-light-gray** diagram (white `#fff` bg, dark gray `#1e1e1e` strokes, black page) — the diagram doesn't adapt.
- WCAG 1.4.11 "Non-text Contrast" requires 3:1 between the diagram's graphical elements and its background. `#1e1e1e` on `#fff` has 17.4:1 (fine in the SVG's own coord frame). But in forced-colors, the *page* around the SVG changes — context breaks.

**What a low-vision reader with custom color overrides sees:**
- Firefox "Always use my chosen colors" with black bg / white text → bright white diagram slab, plus the UX-01 contrast issue magnified.

**Recommendation:**

1. **Switch SVG to use `currentColor` for strokes** so the diagram adapts to the containing text color. Fix at authoring time if Excalidraw supports it (it doesn't, by default — strokes are baked in on export). Alternative: post-process the exported SVG with an SVGO plugin or a `sed` pass to replace `stroke="#1e1e1e"` → `stroke="currentColor"` and `fill="#fff"` → `fill="transparent"` (only on the background rectangle, not on filled shapes if any). This makes the diagram adapt to the `<img>` parent's `color` CSS property (or more robustly, to `color-scheme: dark light`).

2. **For inline SVG future (see UX-05 option 3):** add a `<style>` block:
   ```xml
   <style>
     :root { color: #E2E8F0; }
     @media (prefers-color-scheme: light) { :root { color: #1e1e1e; } }
     @media (forced-colors: active) { :root { color: CanvasText; background: Canvas; } }
   </style>
   ```
   Then all `stroke="currentColor"` elements adapt.

3. **Simplest near-term fix:** combine UX-01 option 3 (frame the diagram in a light-surface `<figure>`) — this explicitly signals "this is a light-surface illustration" to the reader and bypasses the color-adaptation problem by committing to one theme.

**My pick:** option (3) short-term; option (1) as the authoring-pipeline improvement (post-process strokes to `currentColor`).

---

## UX-10 (WARNING): Karpenter arrows lack label text — the diagram hides the key taxonomy word

**Severity:** WARNING — content issue, not rendering.

**Evidence:** the Karpenter SVG has 4 arrow groups (`<g fill="none" stroke="#1e1e1e">`) connecting the EKS cluster box to the two mid-row boxes (CA, Karpenter) and each mid-row box to its node pool. The arrows are drawn with ~4 double-stroke wavy paths each (hand-sketched double-line effect).

None of the arrows has a text label. The key technical insight the diagram is supposed to convey — that the **split** between CA and Karpenter is enforced by *taints and tolerations* — lives only in the `<desc>` / `alt` text and in the paragraph *below* the diagram:

> Technically, you do this with taints and labels. Your system node group gets `node-role.kubernetes.io/system=true:NoSchedule`...

**Why it matters:** the diagram's title is "Split ownership between Cluster Autoscaler and Karpenter." A reader glancing at the image sees a tree (1 root → 2 branches → 3 leaves) but no visual cue telling them *why* the split holds together. Readers who skim will miss the taint/toleration mechanism.

**Recommendation:**

1. **Add edge labels to the two mid-tier arrows:**
   - CA → system nodegroup edge: `"taint: role=system"`
   - Karpenter → nodepool A/B edge: `"no taint / tolerations"` (or similar shorthand)

2. **Or add annotation text on the diagram canvas** near the arrows with a bracket or callout: `"taints + tolerations enforce boundary"`.

3. **Alternative (less work):** keep the diagram as-is, but add a `<figcaption>` (see UX-07) that names the mechanism:
   ```html
   <figcaption>
     Split ownership — taints on system nodes keep Karpenter off them;
     matching tolerations on kube-system pods route them to CA-managed nodes.
   </figcaption>
   ```

**My pick:** option (3) now; option (1) if/when the diagram gets re-exported.

---

## Summary table

| ID | Severity | Domain | Fix location | One-line fix |
|---|---|---|---|---|
| UX-01 | BLOCKER | Theme integration | authoring + embed | Re-export with transparent bg OR wrap `<img>` in light-surface `<figure>` |
| UX-02 | BLOCKER | Mobile legibility | authoring (Excalidraw) | Bump label font-size to 28–32 px in Excalidraw |
| UX-03 | WARNING | Layout rhythm | authoring (MCP diagram) | Extend MCP viewBox to ~820×300 for 2.7:1 ratio |
| UX-04 | BLOCKER (Win/Linux) | Font rendering | authoring (Karpenter diagram) | Switch Karpenter text to Virgil; re-export |
| UX-05 | WARNING | A11y semantics | runbook | Correct the `<title>/<desc>` vs `alt` framing in README |
| UX-06 | ENHANCEMENT | Bilingual polish | pipeline script | Inject `<desc xml:lang>` pairs for descEn + descRu |
| UX-07 | WARNING | Prose rhythm | embed in both posts | Wrap `<img>` in `<figure>` + optional `<figcaption>` |
| UX-08 | ENHANCEMENT | Runbook quality | `diagrams-source/README.md` | Add "Visual design checklist" section |
| UX-09 | BLOCKER (HCM) | Forced-colors a11y | pipeline script | Post-process strokes to `currentColor`; frame in light-theme figure |
| UX-10 | WARNING | Content legibility | authoring (Karpenter) | Add edge labels OR a figcaption naming taints/tolerations |

## Priority recommendation for follow-up patch

**Must-fix before promoting posts on LinkedIn / Twitter:**
- UX-01 (white background on dark prose) — highest visual-impact bug.
- UX-02 (mobile label legibility) — breaks the UAT's claimed mobile quality.
- UX-04 (Karpenter font) — already tracked as WR-04 in the phase review; same fix.

**Fix in next Phase 4 sweep:**
- UX-03, UX-07, UX-09, UX-10.

**Defer unless re-touching the pipeline:**
- UX-05 (runbook wording), UX-06 (bilingual desc), UX-08 (runbook checklist).
