# Phase 10: Contact — letter badges + working form — Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite `src/components/Contact.astro` to match reference `app.jsx:577-632`. Two visual components:

1. **Letter-badge grid** — 5-column responsive grid of square cards, one per social platform (LinkedIn → `L`, GitHub → `G`, YouTube → `Y`, X/Twitter → `𝕏`, Telegram → `T`). Each card shows the display-22 teal letter centered above the platform name. Whole-card anchor to the existing social URL in `src/data/social.ts`.
2. **"Write me a message" inline form** — primary teal CTA that expands in place into a Card with Name / Email / Message fields. Submit builds a `mailto:viktor@vedmich.dev` URL and opens the user's mail client. After submit, the form is replaced in place by a success panel (`✓ Check your email client`) with a Close button that returns the section to the CTA state.

**Out of scope (explicitly):**
- Real server-side form submission (Formspree, Web3Forms, Netlify Forms) — defer if email volume/UX feedback later demands it.
- Spam protection (honeypot, hCaptcha, Turnstile) — not needed for a `mailto:` handoff.
- Custom client-side error messages — relying on native HTML5 validation UI.
- Redirect to a thank-you page — breaks the one-pager feel.
- Any change to social URLs (`src/data/social.ts socialLinks`) — data is locked, only the render shape changes.

Scope is locked by REQ-006 plus the decisions below. No new routes, no new i18n keys beyond copy for the form/success state, no new tokens.
</domain>

<decisions>
## Implementation Decisions

### Backend — `mailto:` only, no third-party endpoint
- **D-01:** Form submit builds a `mailto:viktor@vedmich.dev?subject=…&body=…` URL and calls `window.location.href = mailtoUrl` (or `<a>` click on a hidden element) to hand off to the user's mail client. Zero server, zero endpoint, zero third-party dependency. Works on static GitHub Pages without any extra infrastructure.
- **D-02:** Explicitly **rejected** during discussion: Formspree (free-tier limits + lock-in), Web3Forms (extra dependency, access_key in HTML), Formspree+mailto fallback (two rendering modes = extra complexity). User picked `mailto:` only — simpler and honest about what happens after submit.
- **D-03:** Mail address: `viktor@vedmich.dev`. **Assumes MX for `vedmich.dev` is configured** (or will be before this phase ships). Planner should flag a Wave-0 check: verify that sending to this address actually reaches Viktor. If MX is not set up, this phase cannot close on live until it is.
- **D-04:** Subject line: pre-filled with a recognisable tag so Viktor can filter inbound — `subject = "vedmich.dev — {name}"` (falls back to `"vedmich.dev — Contact"` if name is empty). Body: `"From: {name} <{email}>\n\n{message}"`. Encode all three with `encodeURIComponent`.

### UX — inline expand in place, per reference
- **D-05:** Layout states match `app.jsx:596-629`: (a) CTA-only (single primary teal button centered below the letter grid), (b) form-open (Card replaces the CTA in place, holds Name / Email / Message / Send / Cancel), (c) success (same Card, replaces form content with `✓` + copy + Close button). Only one state is visible at a time. Not a modal, not a separate route.
- **D-06:** Toggle is **instant swap** — no fade, no CSS transition between states. Matches reference. Simpler for screen readers and for `prefers-reduced-motion`. After the Card enters form-open state, focus moves to the Name input (explicit `input.focus()` call inside the island).
- **D-07:** Cancel button reverts Card → CTA-only state without submitting. Escape key while the form is open also reverts to CTA (same handler as Cancel).
- **D-08:** Rejected during discussion: static `mailto:` link instead of a form (loses visual fidelity vs ref), modal/overlay (extra JS, doesn't match ref inline-expand), dedicated `/contact/` page (breaks one-pager, two extra routes for nothing).

### Validation — HTML5-only
- **D-09:** Fields use native constraints only:
  - Name: `required`, `minlength="1"`, plain text.
  - Email: `required`, `type="email"` (browser validates RFC-shape).
  - Message: `required`, `minlength="10"` (prevents accidental empty submit).
- **D-10:** No `setCustomValidity()` call. Browser's native error bubbles are acceptable even though they render in the browser's UI language (not the site locale) — this trade-off is worth it to keep the island minimal. If a user later complains, revisit.
- **D-11:** `novalidate` is **NOT** set — we want the browser to block submit on invalid input.
- **D-12:** The submit handler reads field values, builds the mailto URL, assigns `window.location.href`, then transitions Card to success state. Validation is enforced by the browser before the handler runs.

### Success state — honest copy for `mailto:` semantics
- **D-13:** Copy **must not claim the message was sent**. We don't know whether the user's mail client opened, and we don't know whether they'll actually send from it. Honest wording required.
- **D-14:** EN copy:
  - Icon row: `✓` (teal, display-32px, mono) — matches ref visual weight.
  - Heading: `"Check your email client"` (display-20, text-primary).
  - Body: `"Your default mail app should have opened with a draft. Send when ready — I usually reply within a day or two."`
  - Close button: `"Close"` (ghost variant).
- **D-15:** RU copy:
  - Heading: `"Проверьте почтовый клиент"`.
  - Body: `"Почтовое приложение должно было открыться с черновиком. Отправьте, когда будете готовы — обычно отвечаю за день-два."`
  - Close button: `"Закрыть"`.
- **D-16:** Close button returns Card to CTA-only state (same as Cancel). Optional nicety (planner discretion): auto-close after 10s via `setTimeout` if user hasn't clicked — but **do not redirect**, just reset.
- **D-17:** Rejected during discussion: `✓ Message sent` (lie for mailto), no success state at all (breaks ref fidelity), redirect to `/thanks/` page (overkill, breaks one-pager).

### Letter-badge grid — visuals
- **D-18:** Grid: `grid grid-cols-5 gap-3` at ≥640px, `grid-cols-2` on mobile (LinkedIn/GitHub/YouTube/X take 2+2+1, last row is Telegram centered) — or `grid-cols-5` if the letters still fit at 375px. Planner decides responsive collapse; ref renders 5-col at desktop only.
- **D-19:** Card style mirrors `app.jsx:581-594` with site tokens:
  - Padding: `p-5` (20px, ref padding 20).
  - Background: `bg-bg-base` (ref `VV.bg`).
  - Border: `border border-border rounded-[10px]` (ref borderRadius 10).
  - Hover: `card-glow` utility — border switches to `brand-primary`, teal glow shadow (matches existing site-wide hover pattern).
  - Layout: `flex flex-col items-center gap-2` (ref gap 8).
- **D-20:** Letter: `font-display text-[22px] font-bold text-brand-primary` (ref fontSize 22, weight 700, color `VV.teal`). Use the literal character `𝕏` for X (Unicode MATHEMATICAL DOUBLE-STRUCK CAPITAL X, U+1D54F) — ref does this verbatim.
- **D-21:** Platform label: `font-body text-[13px] text-text-primary` (ref fontSize 13, `VV.text`). Labels stay English in both locales (proper brand names — LinkedIn, GitHub, YouTube, X, Telegram — not localized).
- **D-22:** `whole-card anchor` — `<a href={url} target="_blank" rel="noopener noreferrer">` wraps the whole card, same pattern as Podcasts (Phase 5) and Presentations (Phase 8). Drop the existing `.group` hover dance on inner SVG — replaced by `card-glow`.

### Form Card — visuals
- **D-23:** CTA wrapper: `text-center mt-8` below the letter grid. Single primary button.
- **D-24:** CTA button: reuse the pattern from Book's Amazon CTA (Phase 6, D-13) — `bg-brand-primary text-bg-base hover:bg-brand-primary-hover px-5 py-2.5 rounded-lg font-body text-[15px] font-medium transition-colors`. Matches ref `Button variant="primary"`. Focus-visible ring on `focus-visible:ring-2 ring-brand-primary ring-offset-2 ring-offset-bg-base`.
- **D-25:** Form Card: `max-w-[480px] mx-auto mt-8 p-6 rounded-xl bg-surface border border-border` (non-hoverable — `card-glow` NOT applied, matches ref `<Card hoverable={false}>`).
- **D-26:** Field spacing: `flex flex-col gap-[14px]` (ref gap 14). Each label: `flex flex-col gap-[6px]` with span above input (ref gap 6). Input style: `bg-bg-base text-text-primary border border-border rounded-lg px-[14px] py-[10px] font-body text-[15px] outline-none focus-visible:border-brand-primary focus-visible:ring-1 ring-brand-primary/40`. Matches ref `inputStyle` (app.jsx:634-637) with site tokens.
- **D-27:** Button row: `flex gap-[10px] mt-1.5` (ref marginTop 6). Send = primary teal; Cancel = ghost (`bg-transparent text-text-primary border border-border hover:border-brand-primary`).
- **D-28:** Inputs are uncontrolled — plain DOM `querySelector('input[name="name"]').value` reads inside the submit handler. No state library, no framework.

### i18n — new keys required
- **D-29:** Add to `src/i18n/en.json` and `ru.json`:
  ```
  contact.title                    (already exists — "Let's Connect" / "Связаться")
  contact.subtitle                 (already exists — "Find me on these platforms" / "Найдите меня на этих платформах")
  contact.write_me_cta             NEW  "Write me a message" / "Напишите мне"
  contact.form.name_label          NEW  "Name" / "Имя"
  contact.form.name_placeholder    NEW  "Your name" / "Ваше имя"
  contact.form.email_label         NEW  "Email" / "Email"
  contact.form.email_placeholder   NEW  "you@domain.com" / "you@domain.com"
  contact.form.message_label       NEW  "Message" / "Сообщение"
  contact.form.message_placeholder NEW  "What should we build?" / "О чём поговорим?"
  contact.form.send                NEW  "Send" / "Отправить"
  contact.form.cancel              NEW  "Cancel" / "Отмена"
  contact.success.heading          NEW  "Check your email client" / "Проверьте почтовый клиент"
  contact.success.body             NEW  (see D-14 / D-15)
  contact.success.close            NEW  "Close" / "Закрыть"
  ```
- **D-30:** Platform names (LinkedIn, GitHub, YouTube, X, Telegram) stay un-i18n'd — proper nouns, ref also renders them Latin in both locales.

### Island — minimal JS, follows SearchPalette pattern
- **D-31:** Single `<script>` block at the bottom of `Contact.astro`, no framework. Mirrors the SearchPalette island pattern (`src/components/SearchPalette.astro:135-336`) — vanilla TS, DOM queries, event listeners.
- **D-32:** State machine is 3 states: `cta` → `form` → `success`, plus `form → cta` (cancel/escape) and `success → cta` (close). Track via `data-state` attribute on the section root: `<section data-state="cta" | "form" | "success">`. CSS handles visibility via `[data-state="cta"] .contact-cta { display: block; }` etc. — no `.classList.add/remove('hidden')` bookkeeping.
- **D-33:** `prefers-reduced-motion` irrelevant here — instant swap means no motion anyway. Auto-close timer (D-16, if planner opts in) MUST be disabled under `prefers-reduced-motion`.
- **D-34:** ESC key closes form (back to CTA). ESC on success state also closes (back to CTA). Scoped to the contact section only (not a global handler — avoids conflict with SearchPalette's global ESC).

### Zero-JS degrade
- **D-35:** With JS off: only the letter grid renders functionally — 5 anchors to social platforms. The CTA button becomes a plain link to `mailto:viktor@vedmich.dev` (no pre-filled body, but at least it does something). Achieved by rendering the CTA as `<a href="mailto:viktor@vedmich.dev">` by default, and upgrading to `<button>` in JS if `window` is available — OR simpler: render a `<button>` with `data-mailto="viktor@vedmich.dev"` and a `<noscript><a>…</a></noscript>` fallback. Planner picks one.

### Removed from current Contact.astro
- **D-36:** Remove the inline SVG icon sprite (LinkedIn / GitHub / YouTube / Twitter / Telegram paths in the current component) — replaced by letter badges, icons no longer needed. Whole `{icon === '…' && <path … />}` block goes.
- **D-37:** Remove the `icon` field from `socialLinks` in `src/data/social.ts` **only if** planner confirms it's not referenced elsewhere. Quick grep before deletion: `grep -rn "socialLinks" src/` — if only Contact.astro uses `icon`, delete the field from the data. If other callers rely on it, leave it. (Reference: Phase 8 removed `presentations` export after verifying no callers — same stance.)

### Claude's Discretion
- Exact Tailwind class grouping order on the form inputs.
- Whether to use a single `<script>` or a separate `src/scripts/contact.ts` import — pick whatever matches site convention. `SearchPalette.astro` inlines its script, so inline is the default.
- `setTimeout` auto-close on success state (D-16) — planner may skip this for simplicity.
- Responsive collapse of the 5-col grid at 375px — either keep `grid-cols-5` with smaller cells, or collapse to `grid-cols-2` + last row centered. Verify visually during implementation.
- Whether to extract a `<LetterBadgeCard>` Astro component or inline the card 5× in a `{socialLinks.map(...)}` loop — probably inline since the card is small and the map pattern already reads cleanly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference UI kit (ground truth for visual contract)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L577-632 — Contact section component (letter grid + inline expand form + success state)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L634-637 — `inputStyle` constant (mailto form input tokens)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L131-155 — `Button` primitive (primary / ghost variants used by Send / Cancel)
- `/Users/viktor/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx` §L157-168 — `Card` primitive (matches form Card + success Card)
- `reference-1440-full.png` — full homepage screenshot for visual comparison (Contact section at bottom)

### Site patterns to mirror
- `src/components/SearchPalette.astro` — island pattern for a similarly-interactive component: vanilla TS, `data-*` attributes, event listeners, ESC handling, focus management. Phase 10 island follows this shape.
- `src/components/Podcasts.astro` — whole-card anchor pattern for letter-badge cards (`<a class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll">`).
- `src/components/Book.astro` — primary-teal CTA button pattern from Phase 6 D-13 (`bg-brand-primary text-bg-base hover:bg-brand-primary-hover px-5 py-2.5 rounded-lg`) — reuse for "Write me a message" CTA and Send button.
- `src/styles/design-tokens.css` §L108 — `--success: #10B981` token reserved for form success UI. **Decision: do NOT use `--success` for the `✓` glyph** — reference renders `✓` in brand teal (`VV.teal`), not emerald. Keep `--success` for validation error/success chips if ever added.

### Data files
- `src/data/social.ts` — `socialLinks` array (5 entries). Letter derivation: `name[0]` for all except `X / Twitter` → `𝕏` literal. If D-37 removes the `icon` field, this file shrinks.
- `src/i18n/en.json` §L74-77 — current `contact.title` / `contact.subtitle` (keep). Add keys per D-29.
- `src/i18n/ru.json` §L74-77 — mirror.

### Project-level
- `CLAUDE.md` — Deep Signal tokens, anti-patterns (no hardcoded hex), zero-JS default, bilingual edits to both i18n files in same commit, small-change push-to-main workflow (this phase is a component rewrite — big enough for PR + visual review).
- `.planning/PROJECT.md` — v0.4 milestone scope, zero-JS default, bilingual constraint.
- `.planning/REQUIREMENTS.md` §REQ-006 — locked acceptance criteria (5 badges, single letter + platform name, "Write me a message" CTA, i18n key `contact.write_me_cta`, preserve existing social URLs, mailto fallback).
- `src/styles/design-tokens.css` — canonical tokens (`--brand-primary`, `--bg-base`, `--bg-surface`, `--border`, `--text-primary`, `--text-muted`).
- `src/styles/global.css` — `@theme` bridge; verify `bg-brand-primary/…` alpha compiles.

### Current state (what's being rewritten)
- `src/components/Contact.astro` — current implementation, 38 lines. Replaced wholesale.

### Deferred
- `.planning/ROADMAP.md` Phase 11 (logo refresh), Phase 12 (footer match) — next phases, unaffected by this.
- Potential MX / email hosting for `viktor@vedmich.dev` — see D-03. If not set up before ship, mail delivery silently fails. Planner should add a pre-flight check to the plan.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (from codebase scout)
- **`src/components/SearchPalette.astro`** — the closest architectural analog. Interactive island with DOM state, keyboard handling, focus management, bilingual labels via `data-i18n-*` attributes. Phase 10 island copies this structure.
- **`src/components/Podcasts.astro`** — whole-card anchor + hover pattern. Letter-badge cards follow this.
- **`src/components/Book.astro`** — solid amber CTA pattern from Phase 6. "Write me a message" CTA uses the teal equivalent.
- **`.animate-on-scroll`** — section heading and letter grid entrance animation. Reuse; form Card gets `animate-on-scroll` too when revealed.
- **`.card-glow`** — hover glow utility used across Podcasts, Book, Blog, Presentations. Apply to each letter-badge card.
- **`--success: #10B981`** token in `design-tokens.css:108` — not used here (ref ✓ is teal, not emerald).

### Established Patterns
- **Whole-card anchor** preferred over nested buttons (Podcasts, Presentations, Blog). Letter-badge cards = anchor.
- **Bilingual edits** — every i18n change lands in both `en.json` and `ru.json` in the same commit.
- **Self-hosted everything** — no external icon CDN, no third-party form service.
- **Zero-JS default + minimal islands** — JS allowed only for scroll observer, mobile menu, SearchPalette, and (now) Contact form toggle.
- **Tokens only** — zero hardcoded hex in components. All color through `bg-brand-primary`, `text-text-muted`, etc.
- **`max-w-6xl mx-auto px-4 sm:px-6`** section wrapper shared across About/Podcasts/Contact. Keep. (Note: Phase 8+ migrated Presentations to `max-w-[1120px]`; Contact ref uses `max-w-[1120px]` too — planner should align to 1120 during rewrite for consistency.)
- **`py-20 sm:py-28`** section padding. Ref uses `padding: '80px 24px'` → `py-20` on desktop matches. Keep.

### Integration Points
- **i18n JSON** — both locales in same commit per CLAUDE.md.
- **Island scripts** — inline `<script>` at component end, TS type annotations, IIFE-style with null guards (see SearchPalette).
- **GH Actions deploy** — auto on push to main. Typical build ~800ms. Adding a small island adds ~10-20ms.
- **Header + Footer** — untouched by this phase. Contact section sits above Footer.

### Creative options the existing architecture enables
- **Data-state attribute machine** — `<section data-state="cta|form|success">` + CSS `[data-state="form"] .contact-form { display: block; }` gives us state-driven visibility without JS class juggling. More declarative than `.classList.toggle('hidden')`.
- **`encodeURIComponent` for mailto body** — preserves newlines (`%0A`), emoji if user types them, non-ASCII RU text. One line of code.
- **Close via ESC + scoped listener** — attach `keydown` to the section element, not `document`, to avoid conflicting with SearchPalette's global ESC handler.

### Constraints from existing architecture
- **Tailwind 4 `@theme` alpha on literal hex tokens works** (verified Phase 8 `brand-primary/40`). Use `ring-brand-primary/40` on focus state freely.
- **`noscript` fallbacks** are cheap — one `<noscript><a href="mailto:…">…</a></noscript>` ensures form still "works" with JS off.
- **No new dependencies** — no form library (Formik, react-hook-form), no email SDK, no Formspree import. Vanilla everything.
- **No new routes** — stays on `/{locale}/#contact`. No `/contact/` page.

</code_context>

<specifics>
## Specific Ideas

- **Follow reference `app.jsx:577-632` verbatim for visual structure** — this is the byte-match goal for Phase 10. Grid of 5 letter cards → CTA → inline Card with form → Card with success. Three states, one Card slot.
- **Honest success copy is non-negotiable.** `✓ Message sent` would be a lie with `mailto:`. User selected `✓ Check your email client` specifically. Copy block is locked by D-14/D-15.
- **`𝕏` (U+1D54F) for X** — literal Unicode character, not SVG, not `X`. Ref uses this.
- **Email = `viktor@vedmich.dev`**. If MX isn't configured yet, planner should treat that as a pre-flight / acceptance blocker for going live.
- **Primary teal CTA**, instant swap between states. No animations.
- **Island pattern from SearchPalette** — not React, not Alpine, not a framework. Vanilla TS, ~60-100 lines.
- **Remove `icon` from socialLinks only if safe** — grep first.

</specifics>

<deferred>
## Deferred Ideas

### Real form backend (future, if email volume grows or user feedback demands it)
- Formspree / Web3Forms / Netlify Forms endpoint with POST submission, server-side success confirmation, spam protection (honeypot + Turnstile).
- Would change copy from `✓ Check your email client` back to `✓ Message sent` (true at that point).
- Triggers: (a) mobile-heavy audience where `mailto:` handoff fails often, (b) user wants analytics on contact volume, (c) spam becomes a problem after address is public.
- Est. effort when revisited: 45-60 min (endpoint signup + fetch submit + error state).

### PGP key / encrypted contact option (later, if AWS-adjacent security research requests come in)
- Link to a PGP public key next to the email CTA. Niche; unlikely until the audience justifies it.

### LinkedIn DM / Telegram DM as alternate submit paths
- "Prefer DM? Message me on LinkedIn" link inside the success state. Nice-to-have polish.

### Contact page with CV download + calendar booking
- Separate `/{locale}/contact/` route with expanded CTAs (Download CV, Book a call via Calendly, PGP key). Future milestone, unrelated to v0.4 visual audit scope.

### Spam protection for `mailto:` address harvesting
- Currently `viktor@vedmich.dev` appears in the DOM as a plain mailto URL (bot-scrapeable). If inbox gets flooded, swap to JS-assembled address (`viktor` + `@` + `vedmich.dev` at runtime) or image-based address. Defer until there's evidence of harvesting.

</deferred>

---

*Phase: 10-contact-letter-badges-working-form*
*Context gathered: 2026-05-01*
