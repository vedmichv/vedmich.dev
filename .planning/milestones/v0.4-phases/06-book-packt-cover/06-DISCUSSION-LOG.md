# Phase 6: Book — PACKT cover + V. Vedmich emboss — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 06-book-packt-cover
**Areas discussed:** Cover rendering, Layout & mobile (full-bleed band), Card styling & click, Description copy, Rating (new), Stars fill, Rating storage

---

## Gray area selection

**Presented options (multiSelect):** Cover rendering · Layout & mobile · Card styling & click · Description copy.
**User added via free text notes:** "Было бы круто чтобы полоса была полная и также не забывай ты говоришь со мной на русском а пишешь себе все на англйиском и еще была идея может добавить типа аля рейтинг с амазона там сейчас 4.8"
→ Expanded scope: full-bleed band layout + Amazon rating row (both new beyond REQ-005).

---

## Cover rendering

| Option | Description | Selected |
|--------|-------------|----------|
| CSS faux cover (ref-faithful) | Implement 140×200 CSS div per app.jsx:493-505. Drop JPG. | |
| Hybrid: real JPG + overlaid labels | Keep `/images/book-cover-3d.jpg`, no duplicate PACKT labels (already on scan). | ✓ |
| CSS faux cover + REQ-005 update | Option 1 + amend REQ-005 to drop "3D perspective". | |

**User's choice:** Hybrid — real JPG, no overlaid PACKT/V.Vedmich duplicates.
**Notes:** Same logic as Phase 5 DKT logo over text badge: real brand asset over mockup reproduction.

---

## Full-width band (section layout)

| Option | Description | Selected |
|--------|-------------|----------|
| Full-bleed amber band | Section bg = amber gradient, edge-to-edge width, border y. | ✓ |
| Single full-width card | bg-surface/30 (current) but card stretches to max-w-[1120px] (drop max-w-3xl). | |
| Matches ref exactly | Section transparent, Card at container width (default ref pattern). | |

**User's choice:** Full-bleed amber band. Refined in next question to amber-soft (not amber-teal gradient).
**Notes:** User explicit "полная полоса" — first full-bleed coloured band in vedmich.dev.

---

## Mobile layout

| Option | Description | Selected |
|--------|-------------|----------|
| Stack vertically | Desktop 3-col grid; mobile flex-col (cover → text → button). Current behaviour extended. | ✓ |
| Cover + text, button below | Desktop 3-col; mobile 2-row with cover+text flex-row, button full-width below. | |
| Cover smaller inline | Mobile: 100×143 cover, text + button right side. | |

**User's choice:** Stack vertically.
**Notes:** Cleanest, matches existing pattern.

---

## Card styling & click

| Option | Description | Selected |
|--------|-------------|----------|
| Whole-card `<a>` → Amazon | Current implementation. Card is clickable, CTA is visual affordance. | ✓ |
| Text as content, button as `<a>` | Ref-style: card is div, only Button is active link. | |
| Both work independently | Non-clickable card, but cover + button both link to Amazon. | |

**User's choice:** Whole-card `<a>` — consistent with Podcasts/BlogPreview, Fitts's law.

---

## Amazon rating placement

| Option | Description | Selected |
|--------|-------------|----------|
| Stars row under title | ★★★★★ 4.8 · Amazon, under h3, before description. | ✓ |
| Mono stat line (like Podcasts) | Before button: `4.8/5 · Packt bestseller` muted mono. | |
| Skip — don't add | No rating — out of REQ-005 scope. | |

**User's choice:** Stars row under title — visual social proof, matches Podcasts stats position.

---

## Description copy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current | i18n.book.desc unchanged, matches ref semantically. | ✓ |
| Shorten to 2 lines | 32 → 15 words, more compact for band. | |
| Add publisher info | + "17 chapters, 50+ diagrams. Packt Publishing, 2024." | |

**User's choice:** Keep current.

---

## Stars fill rendering

| Option | Description | Selected |
|--------|-------------|----------|
| 4.8 → 5 filled (round up) | All 5 stars solid amber, 4.8 shown as number next to them. | ✓ |
| 4.8 → 4 filled + 1 half | Half-star CSS/gradient for accurate 4.8 visual. | |
| 4.8 → 4 amber + 1 muted | 4 full amber, 5th muted. | |

**User's choice:** 5 filled (round up) — simpler, single Unicode string.

---

## Band background

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle teal-amber gradient | `linear-gradient(160deg, brand-primary-soft, brand-accent-soft)` | |
| Amber soft band | `bg-brand-accent-soft` + `border-y border-brand-accent/30` | ✓ |
| Deep teal band | `bg-brand-primary-soft` (#134E4A) | |

**User's choice:** Amber soft band — focused accent, coherent with CTA button.

---

## Rating data source

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in Book.astro | `const rating = 4.8;` in frontmatter. | ✓ |
| In src/data/social.ts | Move to data layer alongside speaking/presentations. | |
| In i18n as string | `book.rating: "★★★★★ 4.8 · Amazon"` | |

**User's choice:** Hardcoded in Book.astro — simplest update path, single consumer.

---

## Claude's Discretion

- Exact Tailwind classes for rating number font size (text-sm vs text-base)
- Star size (text-base vs text-lg) — balance with numeric
- Amazon button variant: solid amber (`bg-brand-accent`) vs ghost outline — fallback path if solid reads washed out on amber-soft band
- `gap-6` vs `gap-7` for grid gap — ref says 28, current uses 32
- Card padding (`p-6` vs `p-8`)
- Whether any subtle inner texture on amber band (default: none)

---

## Deferred Ideas

- Review count under rating (`~1200 reviews`) — deferred to data layer refactor
- Stars primitive Astro component — deferred until 2nd consumer
- Dynamic rating source (Amazon API, Packt ranks) — out of static-site scope
- "Bestseller" badge above title — no signal from user
- Half-star CSS rendering — rejected for simplicity
- Noise overlay on amber band — rejected for visual cleanness
- Review link click-through — invalid HTML (nested anchors)
- Publisher info in description — rejected, copy stays unchanged
</content>
</invoke>