# Phase 10 — Contact: letter badges + working form — Discussion Log

**Discussed:** 2026-05-01
**Mode:** default (single-question turns)
**Language:** Russian questions / English artifacts (per CLAUDE.md GSD convention)

---

## Area selection

**Question:** Which gray areas to discuss for Phase 10?

**Options presented (multiSelect):**
1. Backend формы — mailto vs Formspree/Web3Forms vs hybrid
2. UX раскрытия формы — inline expand vs static mailto-link vs modal vs dedicated page
3. Валидация + анти-спам — HTML5 vs JS-custom vs none
4. Success/failure states — copy, visual, timing, error handling

**User selected:** ALL 4 — user chose to address every ambiguity before planning.

---

## Area 1 — Backend

**Question:** С чего отправляем форму?

**Options:**
- Formspree endpoint (Recommended) — real POST, free tier 50/month, email to viktor@vedmich.dev
- Web3Forms (alt) — 250/month free, access_key in HTML
- **mailto: только** ← chosen
- Formspree + mailto fallback

**User selected:** mailto: только

**Rationale captured:** User opted for the simplest option — zero third-party dependencies, zero endpoint config, works out of the box on static GitHub Pages. Trade-off: can't guarantee a message was actually sent (mail client handoff only), so downstream decisions (validation, success copy) must reflect that.

---

## Area 2 — UX of form opening

**Question:** Где живёт форма и как она открывается?

**Options:**
- **Inline expand как в ref (Recommended)** ← chosen
- Статический mailto-link (no form at all)
- Modal (overlay) instead of inline
- Separate `/{locale}/contact/` page

**User selected:** Inline expand как в ref (Recommended)

**Rationale captured:** Preserves byte-match fidelity to reference `app.jsx:577-632`. Form Card replaces CTA in place; Cancel/Escape returns to CTA; after submit, Card replaces form with success panel. No modal, no route change, no loss of one-pager feel.

---

## Area 3 — Validation

**Question:** HTML5-only vs custom JS validation vs no validation?

Context reframed: since backend = mailto (D-01), spam protection is unnecessary (no POST endpoint to attack). Question narrowed to "how do we check fields before building the mailto URL".

**Options:**
- **HTML5-only валидация (Recommended)** ← chosen — `required` + `type="email"` + `minlength`
- HTML5 + custom JS-сообщения — `setCustomValidity()` for bilingual errors
- Без валидации — mail client decides

**User selected:** HTML5-only

**Rationale captured:** Matches reference (ref uses `required type="email"`). Keeps island code minimal. Trade-off: native error bubbles render in browser's UI language, not site locale — acceptable for v1. If RU users complain, revisit with `setCustomValidity()` later.

---

## Area 4 — Success UX

**Question:** What do we show after submit?

Context: With mailto, we don't actually know whether Outlook opened or whether user sent. Ref's `✓ Message sent` is a lie in this context. Honest copy required.

**Options:**
- **✓ «Check your email client» (Recommended)** ← chosen
- ✓ «Message sent» как в ref — byte-match but misleading
- Без success-state — form stays open
- Redirect на /thanks/ page

**User selected:** ✓ «Check your email client» (Recommended)

**Rationale captured:** Honest about `mailto:` semantics. Final copy locked in D-14 (EN) and D-15 (RU). Close button returns to CTA state. Optional `setTimeout` auto-close left to planner discretion (D-16).

---

## Follow-up 1 — Email address

**Question:** Какой email используем в mailto: URL?

**Options:**
- **viktor@vedmich.dev** ← chosen
- Personal email (user would specify)
- No email, link to LinkedIn instead

**User selected:** viktor@vedmich.dev

**Rationale captured:** Matches REQ-006 example. **Open risk:** MX for `vedmich.dev` must be configured for mail to actually arrive — flagged in D-03 as a pre-flight check for the planner.

---

## Follow-up 2 — Toggle animation + CTA character

**Question:** Instant swap vs fade? Primary teal vs ghost?

**Options:**
- **Instant swap + primary teal CTA (Recommended)** ← chosen
- Fade transition + primary teal
- Ghost CTA

**User selected:** Instant swap + primary teal CTA (Recommended)

**Rationale captured:** Byte-match to ref. Zero CSS transitions. Explicit focus state on first field after expand. Primary teal matches REQ-006 and ref `Button variant="primary"`. Simpler a11y, no `prefers-reduced-motion` branching needed.

---

## Deferred (captured in CONTEXT.md deferred section)

- Real form backend (Formspree/Web3Forms) — if email volume or UX complaints justify later.
- PGP key / encrypted contact — niche.
- LinkedIn DM / Telegram DM links in success panel — nice-to-have polish.
- Separate `/{locale}/contact/` page with CV download + Calendly — future milestone.
- Spam protection for address harvesting — defer until evidence of scraping.

---

## Claude's Discretion (noted for planner)

- Exact Tailwind class grouping order on inputs.
- Inline `<script>` vs extracted `src/scripts/contact.ts` — inline is site convention (see SearchPalette).
- Optional `setTimeout` auto-close on success (D-16) — planner may skip.
- Responsive collapse of the 5-col grid at 375px (grid-cols-5 small cells vs grid-cols-2 stacked).
- Whether to extract a `<LetterBadgeCard>` Astro component or inline the card in the `{socialLinks.map()}` loop.

---

*Phase: 10-contact-letter-badges-working-form*
*Discussion completed: 2026-05-01*
