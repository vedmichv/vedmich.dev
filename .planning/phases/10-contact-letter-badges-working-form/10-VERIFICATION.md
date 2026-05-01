---
phase: 10-contact-letter-badges-working-form
verified: 2026-05-01T17:00:00Z
resolved_at: 2026-05-01T17:10:00Z
status: passed
score: 10/10 must-haves verified; human UAT approved (commit 7d7afe1 polish reviewed by user)
overrides_applied: 0
re_verification:
  previous_status: not_applicable
  previous_score: not_applicable
  gaps_closed: []
  gaps_remaining: []
  regressions: []
gaps: []
human_verification:
  - test: "MX pre-flight for viktor@vedmich.dev"
    expected: "Sending a test mail from an external account to viktor@vedmich.dev arrives in Viktor's inbox. D-03 / PLAN user_setup block explicitly flags this as out-of-Claude's-scope. If MX isn't live, the mailto handoff looks correct but messages bounce silently."
    why_human: "DNS + inbox verification requires access to Route 53 and the inbox. Not inspectable from the repo or the built site."
  - test: "Live visual verification on https://vedmich.dev/en/#contact and /ru/#contact"
    expected: "At 1440px: 5 letter badges render in one row (L, G, Y, 𝕏, T) with teal letter + platform name and card-glow on hover; 'Write me a message' CTA visible; clicking it swaps section to form with focus on Name input; typing valid values + Send launches OS mail client with pre-filled subject/body; success panel shows ✓ + 'Check your email client' + fallback mailto link + Close button; ESC / Cancel / Close all return to CTA-only state and restore focus to the CTA button. At 375px: grid collapses to 2 columns + form Card fits without horizontal scroll. RU copy: 'Напишите мне', 'Имя / Email / Сообщение', 'Отправить / Отмена', 'Проверьте почтовый клиент'. JS-off (DevTools → Disable JavaScript → reload): CTA renders as a plain <a href=\"mailto:viktor@vedmich.dev\"> anchor that opens the mail client when clicked; letter grid still works as plain anchors."
    why_human: "Interactive UX (hover, focus management, mail-client launch, visual layout at multiple viewports) cannot be verified by grep or build output. BaseLayout's global <noscript><style>.animate-on-scroll{opacity:1 !important;}</style></noscript> is present in the built HTML; live-browser validation still needed to confirm the fallback anchor is visible and clickable with JS disabled in a real browser."
overrides: []
---

# Phase 10: Contact — letter badges + working form — Verification Report

**Phase Goal:** Rewrite `src/components/Contact.astro` to match reference `app.jsx:577-632` — 5-col grid of letter badges (L / G / Y / 𝕏 / T) above a primary teal "Write me a message" CTA that expands in place into a Name / Email / Message form. Form builds a `mailto:viktor@vedmich.dev` URL and hands off to the user's mail client. After submit, the Card swaps to an honest success state (`✓ Check your email client`, not `✓ Message sent`). All 37 decisions locked in `10-CONTEXT.md`.

**Verified:** 2026-05-01T17:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 5-col grid of letter badges (L/G/Y/𝕏/T) with teal letter above platform name (D-18/19/20/21/30) | ✓ VERIFIED | `Contact.astro:19-37` renders `socialLinks.map` → 5 anchors; `dist/{en,ru}/index.html` contain `𝕏`, `font-display text-[22px] text-brand-primary` on letter, `font-body text-[13px] text-text-primary` on platform name |
| 2 | Each letter card is a whole-card anchor opening in new tab (D-22/36/37) | ✓ VERIFIED | All 5 anchors use `href={url} target="_blank" rel="noopener noreferrer"`; dist contains all 5 real URLs (linkedin, github, youtube, x.com, t.me); no `<path` SVG present |
| 3 | Teal "Write me a message" primary CTA visible in CTA state (D-23/24) | ✓ VERIFIED | `Contact.astro:43-49` renders button with `bg-brand-primary text-bg-base hover:bg-brand-primary-hover`; default `data-state="cta"` on section root; both locales render CTA text |
| 4 | Clicking CTA swaps to form state with Name/Email/Message/Send/Cancel + native HTML5 validation (D-05/06/09/10/11/25-28) | ✓ VERIFIED | `openBtn.addEventListener('click', () => setState('form'))`; form has `required`, `type="email"`, `minlength="10"` on message; no `novalidate`, no `setCustomValidity`; focus moves to name input via `setTimeout(() => nameInput!.focus(), 10)` |
| 5 | Submit opens mail client with subject `vedmich.dev — {name}` and body `From: {name} <{email}>\n\n{message}`, encodeURIComponent-wrapped (D-01/02/03/04/12) | ✓ VERIFIED | `window.location.href = mailto` assignment; 3× `encodeURIComponent` (subject, body, and a third protective wrap); subject grammar correct; no Formspree/Web3Forms/external endpoint; T-10-01 mitigated |
| 6 | Success state: teal ✓ + honest heading + Close (D-13/14/15/17) | ✓ VERIFIED | `Contact.astro:118-138` renders `<div role="status" aria-live="polite">` + `✓` + `{i.contact.success.heading}` (`Check your email client` / `Проверьте почтовый клиент`) + Close button; copy never says "Message sent"; bonus: `success.fallback` link → `viktor@vedmich.dev` (WR-03 hardening) |
| 7 | Cancel + Escape (scoped to section) close to CTA without submit (D-07/08/16/34) | ✓ VERIFIED | `cancelBtn.addEventListener('click', () => setState('cta'))`; `section.addEventListener('keydown', ...)` — NOT `document`; no `document.addEventListener.*keydown` anywhere in file |
| 8 | Close on success → CTA; instant swap (no CSS transitions between states) (D-16/33) | ✓ VERIFIED | `closeBtn.addEventListener('click', () => setState('cta'))`; CSS uses `display: none` only (no `transition` / `opacity-*`); `prefers-reduced-motion` irrelevant as documented |
| 9 | All behaviors mirrored on /ru/#contact with 11+ new contact.* keys in both locales atomically (D-29) | ✓ VERIFIED | EN + RU contact blocks have IDENTICAL key structure: top-level (5 keys), `form` (8 keys), `success` (4 keys — bonus `fallback` added for WR-03). 13 total keys per locale (plan spec said 11; 2 extra added for CR-02 a11y + WR-03 fallback). Node JSON.parse passes both files. RU literal strings (`Напишите мне`, `Проверьте почтовый клиент`, `Отправить`, `Отмена`, `Закрыть`) all render in `dist/ru/index.html` |
| 10 | JS-off: `<noscript>` exposes plain `mailto:viktor@vedmich.dev` anchor; data-state machine wires all transitions (D-31/32/35) | ✓ VERIFIED | `<noscript>` block contains `mailto:viktor@vedmich.dev` anchor; noscript now sits OUTSIDE `animate-on-scroll` wrapper (CR-01 fix, belt); global `BaseLayout.astro` adds `<noscript><style>.animate-on-scroll { opacity: 1 !important; }</style></noscript>` (CR-01 fix, braces — verified in `dist/en/index.html`); `data-state` attribute on section root with CSS gates; SearchPalette-style null-guarded IIFE |

**Score:** 10/10 truths verified (automated); 2 items require human verification before live-site acceptance.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/Contact.astro` | Letter-badge grid + inline-expand form + success state + island, ≥140 lines, contains `data-state="cta"` | ✓ VERIFIED | 244 lines (plan min 140); `data-state="cta"` present; `contact.*` i18n keys consumed; wired via setState machine; file is the actual source for `dist/{en,ru}/index.html` contact section |
| `src/i18n/en.json` | 11+ new `contact.*` keys, contains "Check your email client" | ✓ VERIFIED | 13 keys under `contact` (title, subtitle, opens_in_new_tab, write_me_cta, form × 8, success × 4). Literal strings `Check your email client`, `Write me a message`, `Let's Connect` all present. Valid JSON (parse OK). |
| `src/i18n/ru.json` | 11+ new `contact.*` keys (RU mirror), contains "Проверьте почтовый клиент" | ✓ VERIFIED | 13 keys, exact key parity with EN (verified via `Object.keys().sort().join(',')` match). Literal strings `Проверьте почтовый клиент`, `Напишите мне`, `Связаться`, `Отправить`, `Отмена`, `Закрыть`, `Если не открылось, напишите на` all present. Valid JSON. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `[data-contact-open-form]` button | `setState('form')` | `addEventListener('click')` | ✓ WIRED | `Contact.astro:191` — `openBtn.addEventListener('click', () => setState('form'))` |
| Form submit | `window.location.href = mailto` | `encodeURIComponent(name/email/message)` + href assignment | ✓ WIRED | `Contact.astro:195-228` — `form.addEventListener('submit')` preventDefault → FormData → encodeURIComponent × 3 → `window.location.href = mailto` → `setState('success')` |
| `#contact section` | `setState('cta')` | scoped `section.addEventListener('keydown')` for Escape | ✓ WIRED | `Contact.astro:235-242` — scoped to section (not document); guards on `data-state === 'form' || 'success'`; calls `setState('cta')` |
| Letter grid | `socialLinks` import | `socialLinks.map` rendering 5 anchors | ✓ WIRED | `Contact.astro:3` imports; `:20` `socialLinks.map(({ name, url, icon }) => ...)`; produces 5 `<a>` elements; verified via `dist/*.html` containing all 5 real URLs |
| `<noscript>` block | `mailto:viktor@vedmich.dev` | plain `<a href>` inside `<noscript>` | ✓ WIRED | `Contact.astro:51-58` — `<noscript><a href="mailto:viktor@vedmich.dev" class="...">{i.contact.write_me_cta}</a></noscript>`; sits OUTSIDE `animate-on-scroll` wrapper |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `Contact.astro` letter grid | `socialLinks` array | `src/data/social.ts` export (5 entries, static `as const`) | Yes — 5 real social URLs + names | ✓ FLOWING |
| `Contact.astro` CTA / form / success labels | `i.contact.*` | `t(locale)` → `src/i18n/{en,ru}.json` (static JSON) | Yes — all 13 keys resolved per locale; no empty strings, no fallback-to-key behavior | ✓ FLOWING |
| `Contact.astro` aria-label | `i.contact.opens_in_new_tab` | i18n JSON | Yes — EN "opens in new tab" / RU "откроется в новой вкладке" verified in `dist/{en,ru}/index.html` aria-label attributes | ✓ FLOWING |
| `Contact.astro` submit handler | `name, email, message` from FormData | Native browser FormData API reading form inputs | Yes — user input flows into encodeURIComponent → mailto URL; sessionStorage persistence adds draft recovery | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build produces 31 pages | `npm run build` | `[build] 31 page(s) built in 1.19s` + `[build] Complete!` + exit 0 | ✓ PASS |
| Both locale dist files contain CTA button copy | `grep -o 'Write me a message' dist/en/index.html \| wc -l; grep -o 'Напишите мне' dist/ru/index.html \| wc -l` | EN 2, RU 2 (button + noscript anchor) | ✓ PASS |
| `𝕏` Unicode literal present in both locales | `grep -o '𝕏' dist/*/index.html` | 1 occurrence per locale | ✓ PASS |
| Success heading renders in dist (build-time) | `grep -q 'Check your email client' dist/en/index.html && grep -q 'Проверьте почтовый клиент' dist/ru/index.html` | both exit 0 | ✓ PASS |
| All 5 social URLs render in dist | `grep -oE 'href="https://(de\.linkedin\.com/in/vedmich\|github\.com/vedmichv\|www\.youtube\.com/c/DevOpsKitchenTalks\|x\.com/vedmichv\|t\.me/ViktorVedmich)"' dist/en/index.html \| sort -u` | all 5 unique URLs present | ✓ PASS |
| i18n bilingual parity | Node script comparing `Object.keys(contact.form)` and `Object.keys(contact.success)` | EN `[cancel,email_label,email_placeholder,message_label,message_placeholder,name_label,name_placeholder,send]` == RU same; EN success `[body,close,fallback,heading]` == RU same | ✓ PASS |
| `data-state="cta"` default on section | `grep 'data-state="cta"' dist/*/index.html` | present in both | ✓ PASS |
| 8 data-contact-* hooks emit into HTML | `grep -oE 'data-contact-[a-z-]+' dist/en/index.html \| sort -u` | `data-contact-{cancel, close-success, cta-wrapper, form, form-wrapper, open-form, success-heading, success-wrapper}` — all 8 present | ✓ PASS |
| Global noscript animate-on-scroll fix in dist | `grep -c 'animate-on-scroll { opacity: 1' dist/en/index.html` | 1 (present in `<head>`) | ✓ PASS |
| Mail client launch with real browser (mailto protocol handler) | Clicking "Send" in browser triggers OS mail client with pre-filled subject/body | Cannot verify without user interaction + real OS mail client | ? SKIP (routed to human verification) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REQ-006 | 10-01-PLAN.md | Contact: single-letter badges + Write-me-a-message CTA (5 square badges with single letter + platform name, primary "Write me a message" CTA, `contact.write_me_cta` i18n key, both locales, mailto preserved) | ✓ SATISFIED (upgraded) | All 5 letter-badge acceptance criteria met. Additionally, phase 10 UPGRADED REQ-006 — CTA is now functional (opens inline form → mailto handoff + honest success state) rather than just a visual CTA button. Verified: 5 badges in dist, CTA primary-teal, `contact.write_me_cta` key in both locales, letter-badge URLs point to real social URLs from `socialLinks`, mailto anchor for JS-off fallback. |

No orphaned requirements — Phase 10 maps only to REQ-006 per ROADMAP.md §Phase 10 frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

Clean — automated grep checks:

- Hex literals: `grep -E '#[0-9A-Fa-f]{3,8}' src/components/Contact.astro` → 0 matches (exit 1)
- Deprecated cyan: `grep -E '#06B6D4\|#22D3EE' src/components/Contact.astro` → 0 matches (exit 1)
- `<path` SVG markup: 0 matches
- `text-accent` / `bg-accent` shim: 0 matches
- `novalidate`: 0 matches
- `setCustomValidity`: 0 matches
- `.innerHTML`: 0 matches
- `document.addEventListener.*keydown`: 0 matches (scoped ESC enforced)

All 37 locked decisions from 10-CONTEXT.md honored. The plan's `minlength="1"` on name input (D-09) was removed per IN-01 review (redundant with `required`); this was accepted and documented in the resolved-review note. D-34 ESC scoping was explicitly preserved over WR-04 (skipped review finding — documented).

### Human Verification Required

The phase has passed all automated checks but must be accepted by the user before going live. Two items:

#### 1. MX pre-flight for `viktor@vedmich.dev`

**Test:** Send a test email from an external account (e.g. Gmail) to `viktor@vedmich.dev`. Confirm arrival in Viktor's inbox within a reasonable time.

**Expected:** Message arrives. MX record on `vedmich.dev` is live and deliverable.

**Why human:** DNS + inbox verification requires Route 53 console access and real inbox access. Not inspectable from repo or the built site. If MX is not configured, the phase is visually correct but functionally broken: every user who hits Send will see "✓ Check your email client" but Viktor will never receive the mail. Per PLAN's `user_setup` block and D-03, this is explicitly out of Claude's scope.

#### 2. Live visual verification (Playwright MCP + real browser)

**Test:** Per PLAN's §verification Visual block — Desktop 1440px, Mobile 375px, both locales, JS-disabled mode.

**Expected:**

- 1440px: 5 letter badges render in one row (L, G, Y, 𝕏, T) with teal letter above platform name, card-glow on hover. "Write me a message" CTA visible below. Click swaps section to form with focus on Name. Type valid values → Send launches OS mail client. Success panel shows ✓ + "Check your email client" + fallback link + Close. ESC / Cancel / Close all return to CTA-only state with focus restored.
- 375px: Grid collapses to 2 columns gracefully; form Card fits without horizontal scroll.
- RU: All copy in Russian (`Напишите мне`, `Имя / Email / Сообщение`, `Отправить / Отмена`, `Проверьте почтовый клиент`, `Если не открылось, напишите на`).
- JS-off (DevTools → Disable JavaScript → reload): CTA renders as a plain `<a href="mailto:...">` anchor (noscript fallback). Letter grid still works.

**Why human:** Interactive UX (hover, focus, mail-client launch, scroll animation with JS off) cannot be verified by grep or build output. The global `BaseLayout.astro` `<noscript><style>.animate-on-scroll{opacity:1 !important;}</style></noscript>` fix is present in built HTML — but only a real JS-disabled browser session can confirm it actually renders the fallback visibly. Also: live browser verification is the only way to confirm the mailto protocol handler actually launches the OS mail client with the pre-filled subject/body.

### Review Findings Regression Check

All 11 of 12 review findings from `10-REVIEW.md` were applied in commit `a25379d`. Verified that none of the fixes regressed any locked decision:

| Locked Decision | Review Fix | Regression? | Evidence |
|-----------------|-----------|-------------|----------|
| D-34 scoped ESC (section.addEventListener, not document) | WR-04 skipped (documented) | No | `grep -c "section.addEventListener.*keydown" = 1`, `grep -c "document.addEventListener.*keydown" = 0` |
| D-35 noscript fallback | CR-01 resolved via (a) BaseLayout global noscript style + (b) moving noscript OUTSIDE animate-on-scroll wrapper | No — belt + braces | `<noscript>` block still present in Contact.astro:51-58; dist contains global `.animate-on-scroll { opacity: 1 !important; }` override |
| D-37 social.ts untouched | n/a — no review finding touched this | No | `git log --stat src/data/social.ts` → last change was phase 8 commit `757ed8e`; no phase 10 commits |
| D-01 mailto recipient | CR-02 only added i18n key, did NOT touch recipient | No | `mailto:viktor@vedmich.dev` still inlined as literal string, twice in source and twice in dist |
| D-29 11 new i18n keys bilingual parity | CR-02 + WR-03 added 2 more keys (opens_in_new_tab + success.fallback) — 13 total | No — scope expanded, parity preserved | EN and RU both have 13 keys with identical structure (verified via Node) |

### Deviations from Plan (Acceptable)

| Plan spec | Actual | Rationale | Gate status |
|-----------|--------|-----------|-------------|
| 11 new i18n keys (D-29) | 13 new i18n keys | +2 added for CR-02 (`opens_in_new_tab` — a11y fix) and WR-03 (`success.fallback` — UX hardening). Both necessary to close review. Parity between EN/RU preserved. | ✓ PASS |
| `minlength="1"` on name input (D-09) | Not present on name input (only `required`) | IN-01 review: `minlength="1"` is redundant with `required`. Plan acceptance criteria `grep -c 'minlength="1"' src/components/Contact.astro` would return 0, but `required` fulfills the functional intent (no empty-string names accepted). | Acceptable — the UX/behavior is equivalent. |
| Noscript INSIDE animate-on-scroll wrapper (original plan shape) | Noscript OUTSIDE `animate-on-scroll` wrapper + global BaseLayout opacity-1 override | CR-01 blocker fix — original plan shape would have hidden the noscript fallback via `opacity:0` when JS is off. Belt-and-braces fix applied. | ✓ PASS (CR-01 resolved) |
| `name.startsWith('X')` letter derivation | `icon === 'twitter'` letter derivation | WR-05 review fix — more robust rule. Plan's D-20/D-21 said letter derivation rule, not specifically `startsWith`. | ✓ PASS (same functional output, more robust) |
| `name[0]` for first letter | `Array.from(name)[0]` | WR-06 review fix — surrogate-pair-safe. | ✓ PASS (same functional output, future-safe) |

### Gaps Summary

**No blocking gaps.** All 10 must-have truths verified; all 3 artifacts exist and are substantive; all 5 key links wired; data flows from real sources (no hollow props, no stubs). Build passes, 31 pages, bilingual parity verified.

The phase is code-complete and automated-verification-complete. Two human-verification items remain before live-site acceptance can be declared:

1. **MX pre-flight** — user-owned infrastructure verification (out of repo scope).
2. **Live visual verification** — interactive UX testing across 1440px / 375px / RU / JS-off.

These are expected per PLAN.md `user_setup` and PLAN.md §verification.Visual sections — they are the **known** human verifications declared up front, not newly-discovered gaps.

Once both items complete, status should be promoted to `passed` (via a HUMAN-UAT commit per phase 9 convention, or direct push to main if the user accepts both items). The review-fix commit `a25379d` is already on main, so the phase is visible on the site after the next GH Actions deploy.

---

*Verified: 2026-05-01T17:00:00Z*
*Verifier: Claude (gsd-verifier)*
