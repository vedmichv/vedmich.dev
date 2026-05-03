# Phase 2: Code Block Upgrades - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 2-code-block-upgrades
**Areas discussed:** Language badge path, Toolbar layout (Copy + badge coexistence), Syntax token color mapping, Highlight line treatment, Diff line treatment, Language badge visual, Copy button UX, Toast scope, Regression test strategy

---

## Initial scope selection

Claude presented 4 gray areas; user selected all four AND added "ability to quickly copy code block" as an additional area. Resulting scope: 5 areas (4 original + Copy UX upgrade).

| Area | Presented | Selected |
|------|-----------|----------|
| Language badge — implementation path | Extend CodeCopyEnhancer (runtime JS) vs rehype-plugin (build-time) vs Shiki transformer | ✓ |
| Token color mapping — Deep Signal → syntax | teal=kw/amber=str vs inverted vs minimal vs no-override | ✓ |
| Highlight + diff — visual presentation | border-left / bg-tint / both; git green-red vs Deep Signal | ✓ |
| Language badge — visual | position, color, visibility, size | ✓ |
| (user-added) Copy button UX upgrades | Keep as-is / upgrade / merge into toolbar | ✓ |

---

## Copy button — disposition

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | Don't touch Copy — already hover-visible, locale-aware, clipboard+fallback, Deep Signal. Badge added as separate element. | |
| Upgrade UX | Rework Copy button (always-visible, icon, repositioning, new visual). Full redesign pass. | ✓ |
| Merge into one toolbar | Consolidate Copy + badge into one always-visible toolbar header row. | |

**User's choice:** Upgrade UX — Copy gets an actual improvement pass, not just coexistence with badge.

---

## Language badge — implementation path

| Option | Description | Selected |
|--------|-------------|----------|
| rehype-plugin build-time (Recommended) | `rehype-code-badge.mjs` wraps `<pre>` in `<figure.code-block><span.code-lang-badge>`. Zero runtime JS, no FOUC, Pitfall 8 avoided. | ✓ |
| Extend CodeCopyEnhancer (runtime JS) | Existing `is:inline` script adds `.code-lang-badge` alongside `.code-wrap`. No new dependency, but FOUC risk + JS required for badge visibility. | |
| Shiki pre-transformer | Custom transformer in `shikiConfig.transformers` with `pre(node)` hook adds badge. Tighter with Shiki, but rehype more idiomatic in Astro. | |

**User's choice:** rehype-plugin build-time.

**Notes:** Research (ARCHITECTURE.md) had recommended the runtime-JS path. User overrode in favor of strict zero-JS zone — aligns with the rest of the site's philosophy. Preview showed the final HTML shape clearly and sealed the decision.

---

## Toolbar layout — how Copy + badge coexist

| Option | Description | Selected |
|--------|-------------|----------|
| Badge left, Copy right, both always visible (Recommended) | Toolbar row in top-right: `[yaml]` + `[icon Copy]`. Both always visible. More visual weight but predictable. | ✓ |
| Badge always, Copy icon-only on hover | Badge permanent, Copy shrinks to icon-only on hover, expands on touch. Less noise. | |
| Copy moves to bottom-right | Spatial separation of language (top) vs action (bottom). Unique but non-standard. | |

**User's choice:** Both always visible, toolbar row, top-right.

---

## Syntax token color mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Teal=keywords, amber=strings (Recommended) | Classical palette, keywords brand-primary, strings brand-accent, comments muted. | ✓ |
| Amber=keywords, teal=strings (inverted) | Bold inversion, amber dominates keywords. Risks amber overload. | |
| Minimal: teal for important + muted for rest | One accent, amber reserved for diff/highlight. Max readability, least variation. | |
| Keep github-dark, no override | Breaks CODE-04 requirement. | |

**User's choice:** Teal=keywords, amber=strings.

---

## Highlight line treatment

| Option | Description | Selected |
|--------|-------------|----------|
| border-left + bg tint (Recommended) | 2px teal border-left + brand-primary-soft bg at ~10-12% opacity. Two affordances. | ✓ |
| Only bg tint | Softer, Hashnode-style. Either too subtle or too loud depending on opacity. | |
| Only border-left | Minimal; multi-line blocks look segmented. | |

**User's choice:** border-left + bg tint.

---

## Diff line treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Green/Red as in git (Recommended) | `++` → var(--success) tint + `+` gutter; `--` → var(--error) tint + `−` gutter. Git muscle memory. | ✓ |
| Teal (+) and amber (−) Deep Signal | Brand-pure but breaks git expectations. Amber=warning conflict. | |
| Muted tint + gutter glyph only | Minimum noise, harder to scan. | |

**User's choice:** Green/Red — git conventions respected even though it introduces a non-brand color (status tokens are already in design-tokens.css, so no new hex).

---

## Language badge visual

| Option | Description | Selected |
|--------|-------------|----------|
| Muted caps, transparent bg (Recommended) | text-muted color, transparent bg, JetBrains Mono 11px uppercase + letter-spacing. Hover → text-primary. | ✓ |
| Teal text + teal-soft bg | Matches tag-pill pattern on blog cards. Louder; may overwhelm in tutorial posts. | |
| Amber text + transparent | Amber caps, accent-textual. Risks collision with amber strings in code. | |

**User's choice:** Muted caps, transparent bg.

---

## Copy button UX — enhancements

| Option | Description | Selected |
|--------|-------------|----------|
| Icon-only default, text on hover | Clipboard icon always visible, expands to `[⧉ Copy]` on hover. Compact yet clear. | ✓ |
| Toast notification "Copied" on screen | Success feedback visible even without cursor on button. | ✓ |
| Keyboard shortcut (Cmd/Ctrl+Shift+C on focus) | Dev-friendly ~10 LOC add. | |
| Nothing else | Always-visible alone solves the biggest UX gap. | |

**User's choice:** Icon-only + text on hover AND toast. Keyboard shortcut deferred.

---

## Toast scope — implementation complexity

| Option | Description | Selected |
|--------|-------------|----------|
| Simple singleton toast (Recommended) | One `aria-live` div in BaseLayout, show on copy, hide after 2s. ~30 LOC + CSS. No queue, no stack. | ✓ |
| Full toast stack | `<ToastContainer>` with queue, variants, dismiss. Overkill for single consumer. Deferred. | |
| No toast | Only in-button `is-copied` feedback. Reverts to a simpler endpoint but hides feedback without hover. | |

**User's choice:** Simple singleton toast.

---

## Regression test strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright screenshot diff + manual live audit (Recommended) | Before/after screenshots of 4 posts × 2 locales, threshold diff, plus manual preview walkthrough. Mirrors Phase 1 pixel-parity gate. | ✓ |
| Manual audit only | Faster but no auto-regression catch for future Shiki changes (Phase 5/6). | |
| Playwright snapshot + build-check without diff | Reference screenshots without strict pixel diff. Compromise. | |

**User's choice:** Playwright screenshot diff + manual audit.

---

## Claude's Discretion

- Rehype plugin authoring style — vanilla `unist-util-visit` visitor vs hast helpers vs pre-built `rehype-pretty-code` if it fits CSS-override approach.
- Icon choice for Copy button — `carbon:copy` / `lucide:copy` / `lucide:clipboard` (all available from Phase 1 Iconify packages).
- Toast animation curve + duration — within range `120-180ms` ease-out in, `200-260ms` ease-in out, visible ~2s; `prefers-reduced-motion` disables transition.
- Exact Shiki token-class selector list — planner inspects emitted HTML on 4 existing posts and maps to Deep Signal overrides.
- Whether to keep in-button `is-copied` feedback alongside the toast.
- File organization — inline into `global.css` vs new `src/styles/code-blocks.css`.

## Deferred Ideas

- Full toast manager system (queue, variants, manual dismiss) — only if a second consumer appears.
- Keyboard shortcut Cmd/Ctrl+Shift+C on code-block focus.
- Code block line numbers.
- Language badge vocabulary normalization (`ts` → `typescript`).
- Custom Shiki JSON theme file (revisit only if CSS overrides become fragile).

---

*End of discussion log.*
