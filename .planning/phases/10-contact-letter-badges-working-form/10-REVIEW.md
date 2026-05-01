---
phase: 10-contact-letter-badges-working-form
reviewed: 2026-05-01T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/components/Contact.astro
  - src/i18n/en.json
  - src/i18n/ru.json
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: resolved
resolved_at: 2026-05-01T16:41:00Z
resolved_in_commit: a25379d
skipped:
  - WR-04 (ESC scope widening — conflicts with locked D-34 per phase plan)
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-01
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 10 rewrote `src/components/Contact.astro` wholesale (38 → 206 lines) and added 11 new `contact.*` keys per locale. The threat-model deliverables are sound — `encodeURIComponent` wraps every interpolated user value (T-10-01 mitigated), there's no `.innerHTML` sink (T-10-02 mitigated), the recipient is hardcoded (T-10-03), and i18n parity between `en.json` / `ru.json` is exact (same 5 top-level keys, same 8 `form` keys, same 3 `success` keys, em-dash consistent).

The review nonetheless surfaces two BLOCKER defects and six meaningful WARNINGs:

1. **BLOCKER — the `<noscript>` mailto fallback is invisible with JS disabled** because it is wrapped in `.animate-on-scroll`, which applies `opacity: 0` until an IntersectionObserver (JS-only) toggles `is-visible`. This directly breaks D-35, the explicit user-facing contract that JS-off visitors get a working mailto anchor. This is a regression created by the Phase 10 rewrite (the previous contact section did not mount the CTA inside `animate-on-scroll`). The Hero CTA `href="#contact"` also lands on a blank section when JS is off.
2. **BLOCKER — "opens in new tab" in the letter-badge `aria-label` is English-only and leaks onto `/ru/`** — screen-reader users in Russian hear `"LinkedIn (opens in new tab)"` instead of a localized phrase. This is an i18n accessibility defect against the plan's bilingual contract.

The WARNINGs mostly concern focus management (Cancel / Close / ESC drop focus to `<body>` — no `lastFocused` restore pattern as in `SearchPalette.astro`), missing `aria-live` announcement for the success state (a screen reader user has no signal that submit succeeded), and a false-positive UX — if the user's machine has no `mailto:` handler registered, submitting still swaps to the "Check your email client" panel even though no client opened. The `name.startsWith('X')` letter-derivation rule is also fragile (matches "Xbox", "XDA", etc.) but is documented intent.

## Critical Issues

### CR-01: `<noscript>` fallback is hidden by `animate-on-scroll` when JS is disabled

**File:** `src/components/Contact.astro:39-55`
**Issue:** The CTA wrapper that contains BOTH the button (JS path) AND the `<noscript>` mailto anchor (JS-off path) has the `animate-on-scroll` class:

```astro
<div class="mt-8 animate-on-scroll" data-contact-cta-wrapper>
  <button ...>{i.contact.write_me_cta}</button>
  <noscript>
    <a href="mailto:viktor@vedmich.dev" ...>{i.contact.write_me_cta}</a>
  </noscript>
</div>
```

`src/styles/global.css:109-111` defines the rule:

```css
.animate-on-scroll {
  opacity: 0;
}
```

Opacity is toggled to 1 by `IntersectionObserver` in `src/layouts/BaseLayout.astro:71-87`. With JS disabled, the observer never runs, the class is never added, and every `.animate-on-scroll` element — including the noscript `<a>` — stays at `opacity: 0`. The `prefers-reduced-motion` override at `global.css:143-145` only triggers via an existing `@media` rule that already forces `opacity: 1` for motion-sensitive users, but that does not apply to JS-off users with motion enabled.

Also affected (same wrapper pattern, same invisibility):
- `<h2>` contact title (line 15)
- `<p>` subtitle (line 16)
- The 5 letter-badge `<a>` anchors (lines 19-36, all inside a wrapper div with `animate-on-scroll`)

This directly violates D-35 ("island follows SearchPalette vanilla-TS pattern … `<noscript>` exposes a plain mailto anchor so the CTA still does something useful") and invalidates must-have truth "With JavaScript disabled, `<noscript>` exposes a plain `mailto:viktor@vedmich.dev` anchor" from the phase plan.

Note: this is a pre-existing site-wide issue (every `animate-on-scroll` section has the same flaw), but Phase 10 *explicitly shipped* a noscript contract and placed the fallback inside the failure-mode container, so the regression is newly material here.

**Fix:** Add a `<noscript>` CSS override in `BaseLayout.astro`'s head (or in `global.css`) so JS-off visitors see the content. Inline `<noscript>` cannot contain `<style>` per HTML spec in the `<head>`, but a `<noscript>` block in `<head>` CAN wrap a `<style>` tag:

```astro
<!-- In BaseLayout.astro <head> -->
<noscript>
  <style>
    .animate-on-scroll { opacity: 1 !important; }
  </style>
</noscript>
```

Or, specifically for the Contact CTA wrapper, move the `<noscript>` anchor outside the `animate-on-scroll` div so it never inherits the hidden state. Minimal-diff version:

```astro
<div class="mt-8" data-contact-cta-wrapper>
  <div class="animate-on-scroll">
    <button type="button" data-contact-open-form ...>
      {i.contact.write_me_cta}
    </button>
  </div>
  <noscript>
    <a href="mailto:viktor@vedmich.dev" class="inline-flex ...">
      {i.contact.write_me_cta}
    </a>
  </noscript>
</div>
```

Recommend the global `<noscript><style>` fix in `BaseLayout.astro` — it restores intent across every section, not just Contact.

---

### CR-02: Letter-badge `aria-label` is hardcoded English, leaks onto `/ru/`

**File:** `src/components/Contact.astro:29`
**Issue:** The 5 letter-badge anchors get their accessible name from:

```astro
aria-label={`${displayName} (opens in new tab)`}
```

`(opens in new tab)` is a hardcoded English string. It renders identically on `/ru/` — Russian screen-reader users hear `"LinkedIn (opens in new tab)"` instead of `"LinkedIn (откроется в новой вкладке)"`. Since:

- `t(locale)` IS already in scope (`const i = t(locale);` at line 10),
- the i18n files have no corresponding key (confirmed: `grep -q "opens in new tab\|откроется" src/i18n/*.json` returns empty),
- and WCAG 2.1 SC 3.1.2 requires that the human language of each passage be programmatically determinable (the `<html lang="ru">` on `/ru/` promises Russian content — mixing English aria-labels into a Russian page violates the promise to assistive tech),

this is a real a11y defect, not a style preference. The Phase 10 plan's must-have truth #9 ("All behaviors work identically on /ru/#contact with Russian copy") is violated.

Same defect, lower-impact: the Hero in `src/components/Hero.astro` may also have hardcoded English — out of scope for this review.

**Fix:** Add the missing key to both locale files, then interpolate:

```json
// src/i18n/en.json
"contact": {
  ...
  "opens_in_new_tab": "opens in new tab",
  ...
}

// src/i18n/ru.json
"contact": {
  ...
  "opens_in_new_tab": "откроется в новой вкладке",
  ...
}
```

```astro
<!-- Contact.astro line 29 -->
aria-label={`${displayName} (${i.contact.opens_in_new_tab})`}
```

---

## Warnings

### WR-01: Focus is dropped to `<body>` when Cancel / Close / ESC collapses a panel

**File:** `src/components/Contact.astro:155-204`
**Issue:** The island never tracks the element that had focus before `setState('form')` was called. When the user:

1. Tabs to the "Write me a message" button,
2. Presses Enter → `setState('form')` → form wrapper becomes visible and `nameInput.focus()` fires via setTimeout,
3. Decides to bail — presses ESC, or clicks Cancel, or clicks Close (after submit),

the code calls `setState('cta')`. This sets the ancestor wrapper to `display: none` on the form (or success) panel. The element that currently has focus — the Cancel button or Close button, or whatever field was last focused via Tab — sits inside the wrapper that just became `display: none`. The browser drops focus all the way to `<body>`.

Consequences:
- Next `Tab` restarts from the top of the page (skip-to-main would help, but there's no skip link present).
- Screen reader users lose their position in the page and get no announcement of where they are.
- Compare `SearchPalette.astro:178, 251, 266-268` — it explicitly snapshots `lastFocused = document.activeElement as HTMLElement` in `open()` and restores `lastFocused.focus()` in `close()`. Contact.astro should mirror that pattern.

**Fix:** Mirror the SearchPalette pattern:

```typescript
let lastFocused: HTMLElement | null = null;

function setState(next: ContactState): void {
  if (next === 'form') {
    lastFocused = (document.activeElement as HTMLElement) || null;
  }
  section!.setAttribute('data-state', next);
  if (next === 'form') {
    setTimeout(() => nameInput!.focus(), 10);
  } else if (next === 'cta' && lastFocused && typeof lastFocused.focus === 'function') {
    // Returning to CTA from form/success — restore prior focus (usually openBtn).
    lastFocused.focus();
  }
}
```

---

### WR-02: No `aria-live` announcement when the success panel appears

**File:** `src/components/Contact.astro:111-124`
**Issue:** After submit, the section's `data-state` flips to `success`. The form wrapper becomes `display: none` and the success panel becomes visible. A screen reader user — especially one returning from the OS mail client modal — has no indication the panel changed. The success `<h3>` has no `role`, no `tabindex`, no `aria-live` region, no programmatic focus move. The submit `<button>` it replaced was inside the now-hidden form, so focus currently sits on `<body>` (also per WR-01).

**Fix:** Wrap the success content in an `aria-live` region OR move focus to the success heading:

```astro
<div ... data-contact-success-wrapper role="status" aria-live="polite">
  <div class="text-center py-5">
    ...
    <h3 tabindex="-1" data-contact-success-heading class="font-display ...">
      {i.contact.success.heading}
    </h3>
    ...
  </div>
</div>
```

```typescript
// In setState:
if (next === 'success') {
  const heading = section!.querySelector<HTMLElement>('[data-contact-success-heading]');
  setTimeout(() => heading?.focus(), 10);
}
```

`role="status"` + `aria-live="polite"` gives SR users a polite announcement of the heading + body copy when the panel appears without disrupting their current reading point.

---

### WR-03: Success state fires unconditionally — misleads users with no mailto handler

**File:** `src/components/Contact.astro:186-192`
**Issue:** The submit handler:

```typescript
const mailto = `mailto:viktor@vedmich.dev?subject=...&body=...`;
window.location.href = mailto;
setState('success');
```

`setState('success')` runs synchronously immediately after the href assignment. If:

- the user has no `mailto:` handler installed (common for Chromebook / Linux users / managed Windows devices / guest sessions),
- or `mailto:` is blocked by browser policy,
- or the user dismisses the OS "which app do you want to use?" dialog,

then **nothing opens**, but the user still sees the "✓ Check your email client — Your default mail app should have opened with a draft" panel. The copy is strictly false in this scenario, and there's no way for the user to recover the typed message — the form data is gone (`display: none` wipe, no draft preservation).

The browser cannot reliably report whether the mailto was actually handled, so full detection is impossible, but the failure mode is silent and data-destructive.

**Fix (minimal):** Before flipping state, save the form fields to `sessionStorage` so the user can recover if needed:

```typescript
sessionStorage.setItem('vv-contact-draft', JSON.stringify({ name, email, message }));
window.location.href = mailto;
setState('success');
```

Then on load, if a draft exists, repopulate the form fields. Alternatively, soften the success copy to say "If your mail app didn't open, you can also email viktor@vedmich.dev directly" + surface a fallback mailto anchor in the success panel.

**Fix (fuller):** Use `setTimeout` + `visibilitychange` to detect whether the page actually lost focus (indicating the mailto handoff succeeded); only then flip to success.

---

### WR-04: ESC listener attached to `section` misses keydown events when focus is outside the section

**File:** `src/components/Contact.astro:197-204`
**Issue:** The ESC handler is bound to `#contact` directly:

```typescript
section.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  ...
});
```

`keydown` events bubble from the focused element to the `document`. If the user:

1. Clicks "Write me a message" (focus → nameInput, still inside `#contact` — ESC works),
2. Tabs through the form fields (focus → each input, all inside `#contact` — ESC works),
3. BUT: tabs past the last button of the form and onto something OUTSIDE the section (e.g., the Footer, or the search palette trigger in the header, or clicks a non-contact area of the page to move focus elsewhere),
4. Then presses ESC — the keydown fires on an element OUTSIDE `#contact`, bubbles up to `document`, and never reaches `section` because `section` is not an ancestor of the event target.

This is documented intent (D-34, avoids SearchPalette conflict), but the scoping is tighter than needed: the escape contract specifies "ESC collapses the form back to CTA". A user who glances away for a moment and comes back should not need to re-click into the section first.

**Fix:** Bind to `document`, but gate on `data-state`:

```typescript
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Only handle if SearchPalette is not open AND Contact is in form/success state.
  const isSearchOpen = document.body.hasAttribute('data-search-open');
  if (isSearchOpen) return;
  const state = section!.getAttribute('data-state');
  if (state === 'form' || state === 'success') {
    e.preventDefault();
    setState('cta');
  }
});
```

This uses the existing `data-search-open` body attribute set by SearchPalette (`SearchPalette.astro:253, 264`) to avoid the conflict D-34 was designed to prevent, while widening the handler to catch ESC regardless of focus position. If keeping the section-scoped listener is required by D-34, document this limitation in `10-DISCUSSION-LOG.md`.

---

### WR-05: `name.startsWith('X')` is a fragile letter-derivation rule

**File:** `src/components/Contact.astro:21-22`
**Issue:**

```astro
const letter = name.startsWith('X') ? '𝕏' : name[0];
const displayName = name.startsWith('X') ? 'X' : name;
```

This matches `X / Twitter` today but will also match:

- `"Xbox"` → letter `𝕏`, displayName `"X"` (wrong)
- `"XDA Developers"` → letter `𝕏`, displayName `"X"` (wrong)
- `"X.com"` (Elon's future rebrand attempt #N) → letter `𝕏`, displayName `"X"` (probably intended, but the rule is coincidental)

The current `socialLinks` array in `src/data/social.ts:17-21` is safe, and the plan (D-21, D-30) documents this as intent. But a future contributor adding a social link starting with "X" has no signpost that this rule is wired to platform-X-specifically. A more robust rule encodes the intent explicitly.

**Fix:** Make the X-platform detection explicit. Either tag the social link:

```typescript
// src/data/social.ts
{ name: 'X / Twitter', url: '...', icon: 'twitter', isX: true },
```

```astro
const letter = isX ? '𝕏' : name[0];
const displayName = isX ? 'X' : name;
```

Or key off the `icon` field which is already a stable identifier:

```astro
const letter = icon === 'twitter' ? '𝕏' : name[0];
const displayName = icon === 'twitter' ? 'X' : name;
```

The `icon === 'twitter'` variant is lower-touch (no `social.ts` change).

---

### WR-06: `name[0]` is not surrogate-pair-safe

**File:** `src/components/Contact.astro:21`
**Issue:** `name[0]` indexes by UTF-16 code unit, not by grapheme. If a future social platform name begins with an astral-plane character (e.g., `"🎬Film"`, `"🐘Mastodon"`), `name[0]` returns the leading surrogate of a surrogate pair — a broken/unrenderable character, not the intended first glyph.

The current data set is pure ASCII, so there's no present bug. But the code carries an implicit "ASCII first character" contract that isn't documented and isn't enforced by `as const`.

**Fix:** Use `Array.from(name)[0]` or a proper grapheme-cluster iterator:

```astro
const letter = icon === 'twitter' ? '𝕏' : Array.from(name)[0];
```

`Array.from(string)` iterates code points (astral-safe) rather than code units.

---

### WR-07: No `autocomplete` attributes on form fields — browsers cannot autofill

**File:** `src/components/Contact.astro:62-80`
**Issue:** The Name, Email, and Message inputs have no `autocomplete` attribute. Browsers that would otherwise autofill name/email from the user's profile or saved form data cannot, because the field purpose is not declared. This hurts conversion (extra typing) and accessibility (WCAG 2.1 SC 1.3.5 "Identify Input Purpose").

**Fix:**

```astro
<input required type="text" name="name" autocomplete="name" ... />
<input required type="email" name="email" autocomplete="email" ... />
<textarea required name="message" autocomplete="off" ... />
```

`autocomplete="off"` on the message field is intentional — a freeform message is not a reusable value and Chrome/Firefox will ignore `off` on non-sensitive form fields anyway, but it documents intent.

---

## Info

### IN-01: `minlength="1"` on the name input is redundant with `required`

**File:** `src/components/Contact.astro:66`
**Issue:** `required` already rejects empty strings; `minlength="1"` on top of it is a no-op. Not a bug — just dead attribute clutter.

**Fix:** Remove `minlength="1"` from line 66. Keep `minlength="10"` on the textarea where it adds real behavior.

---

### IN-02: Non-null assertion in setTimeout closure is a soft foot-gun

**File:** `src/components/Contact.astro:160`
**Issue:**

```typescript
setTimeout(() => nameInput!.focus(), 10);
```

The null-guard `if (section && openBtn && form && cancelBtn && closeBtn && nameInput)` at line 155 confirms `nameInput` is non-null at the time of the guard. But the setTimeout closure captures `nameInput` and runs 10ms later. In the normal lifecycle there's no path that removes the input from the DOM, so `nameInput` remains a valid reference — the assertion is safe. It's documented as intentional in the phase context.

However, under a future refactor — e.g., if someone adds a "reset form on close" that calls `form.innerHTML = ''` — `nameInput` would still exist as a JS reference but would no longer be attached to the DOM. `.focus()` on a detached element is a silent no-op. The non-null assertion masks the possibility.

**Fix (future-hardening, not blocking):** Re-query inside the closure so stale references surface explicitly:

```typescript
setTimeout(() => {
  const input = section!.querySelector<HTMLInputElement>('input[name="name"]');
  input?.focus();
}, 10);
```

---

### IN-03: "within a day or two" is a hardcoded reply-time promise

**File:** `src/i18n/en.json:90` and `src/i18n/ru.json:90`
**Issue:** The success body includes `"— I usually reply within a day or two."` (EN) and `"обычно отвечаю за день-два."` (RU). This is a reliability promise embedded in user-visible copy. If the site author is unavailable for a week (vacation, conference travel), this copy becomes a broken promise to senders.

Not a code bug — a content risk. Either soften the copy ("I'll reply as soon as I can") or wire it to a vacation flag in `src/data/social.ts`.

**Fix:** Option A — soften to "I'll reply as soon as I can" in both locales. Option B — leave it and note the reply-time liability as content-owned.

---

### IN-04: `aria-hidden="true"` on the success ✓ glyph is correct, but `role="img" aria-label="Success"` would also work

**File:** `src/components/Contact.astro:113`
**Issue:** The ✓ glyph is correctly marked `aria-hidden="true"` — screen readers skip it, the adjacent `<h3>` `{i.contact.success.heading}` carries the semantic meaning. This is the right default.

No fix required — just noting that this matches WCAG guidance and is NOT an issue. Listed as Info so future maintainers don't second-guess it.

---

## Not Flagged (intentional per phase plan)

The following are documented-intent per `10-01-PLAN.md` and NOT findings:

- `mailto:viktor@vedmich.dev` appears as literal string (not a constant) — plan D-01/D-03 + grep-gate dependency.
- `novalidate` attribute intentionally absent from the form — D-11.
- ESC listener on `section`, not `document` — D-34 (but see WR-04 above for a narrow re-examination).
- No `setCustomValidity` — D-10, native bubbles are acceptable.
- Unicode `𝕏` (U+1D54F) — intentional, documented.
- Non-null assertions inside the guarded IIFE — standard TS pattern.
- Email harvesting via the noscript `mailto:` anchor — ACCEPTED risk per T-10-04.
- `encodeURIComponent` on every interpolated user value in the mailto URL — correctly mitigates T-10-01.
- `.innerHTML` is not used anywhere — correctly mitigates T-10-02.
- i18n key parity between EN and RU is exact (5 / 8 / 3 — verified via `Object.keys` script).

---

_Reviewed: 2026-05-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
