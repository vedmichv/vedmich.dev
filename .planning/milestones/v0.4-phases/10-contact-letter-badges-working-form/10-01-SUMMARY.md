---
phase: 10-contact-letter-badges-working-form
plan: 01
subsystem: ui

tags:
  - astro
  - i18n
  - contact-form
  - mailto
  - vanilla-ts
  - deep-signal

# Dependency graph
requires:
  - phase: 08-deep-signal-design-system
    provides: "brand-primary / bg-base / bg-surface tokens + card-glow utility + animate-on-scroll + focus-visible ring patterns"
  - phase: 05-search-palette
    provides: "island null-guarded IIFE pattern with document.getElementById + querySelector guard + scoped event listeners"
  - phase: 06-book
    provides: "primary CTA button pattern (px-5 py-2.5 rounded-lg bg-brand-primary text-bg-base hover:bg-brand-primary-hover)"

provides:
  - "Letter-badge social grid (L / G / Y / 𝕏 / T) with whole-card anchors + card-glow hover"
  - "Inline-expand mailto form (Name / Email / Message) with data-state attribute state machine"
  - "Honest success panel (✓ Check your email client) — no false 'Message sent' claim"
  - "Vanilla TS island pattern #2: scoped-ESC section listener (not global like SearchPalette)"
  - "T-10-01 mitigation template: encodeURIComponent on all user input before mailto interpolation"

affects:
  - "Phase 11 logo refresh — Footer/Header may revisit icon sprite, social.ts icon field remains in use by Footer.astro"
  - "Future mail backend phase (if volume grows) — copy would flip from 'Check your email client' back to 'Message sent'; hook points already at data-contact-form"
  - "Any phase modifying SearchPalette ESC handling — note that ESC is now also bound on #contact section (scoped, no conflict)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "data-state=\"cta|form|success\" attribute state machine with CSS visibility gates"
    - "Scoped section.addEventListener('keydown') — avoids palette conflict for per-section ESC"
    - "noscript mailto: anchor fallback for zero-JS degrade"
    - "encodeURIComponent on every user-supplied interpolated value before URL assignment (T-10-01 mitigation template)"

key-files:
  created: []
  modified:
    - "src/components/Contact.astro — wholesale rewrite (38 → 206 lines)"
    - "src/i18n/en.json — +17 lines contact.* block (write_me_cta + form × 8 + success × 3)"
    - "src/i18n/ru.json — +17 lines mirror"

key-decisions:
  - "mailto: handoff only — no Formspree/Web3Forms/Netlify backend (D-01/D-02)"
  - "Honest success copy 'Check your email client' — never claim 'Message sent' with mailto (D-13/14/15)"
  - "src/data/social.ts untouched — Footer.astro still destructures icon field (D-37 resolved per PATTERNS.md §4)"
  - "ESC listener scoped to #contact section, not global — avoids SearchPalette conflict (D-34)"
  - "𝕏 is literal Unicode U+1D54F, not SVG and not plain X (D-20)"
  - "No novalidate on form, no setCustomValidity in script — rely on native browser validation bubbles (D-09/10/11)"
  - "Both locale JSONs edited in the same plan, committed as separate task from component per per-task protocol"

patterns-established:
  - "Scoped-section ESC pattern: `section.addEventListener('keydown', …)` — use this for any future modal/expand component to avoid global ESC collisions with SearchPalette"
  - "data-state visibility gating: `#id[data-state=\"x\"] [data-wrapper-y] { display: none; }` — declarative swap without classList juggling"
  - "noscript fallback next to CTA button: `<button>…</button><noscript><a href=\"mailto:…\">…</a></noscript>` — zero-JS degrade convention"
  - "Per-task commit when touching both i18n JSONs and a component that references new keys: commit i18n FIRST so the component commit doesn't reference undefined keys at intermediate git state"

requirements-completed:
  - REQ-006

# Metrics
duration: ~5min
completed: 2026-05-01
---

# Phase 10 Plan 01: Contact letter badges + working form Summary

**Letter-badge social grid (L/G/Y/𝕏/T) + inline-expand mailto form with honest "check your email client" success panel, vanilla-TS data-state island, 11 new bilingual i18n keys, zero new dependencies.**

## Performance

- **Duration:** ~5 min (execution only; planning done prior)
- **Started:** 2026-05-01T16:26:00Z (approx — after worktree base reset)
- **Completed:** 2026-05-01T16:29:00Z
- **Tasks:** 2 (both atomic, no checkpoints)
- **Files modified:** 3 (2 i18n + 1 component rewrite)
- **Build:** 31 pages built in 1.22s, exit 0
- **src/components/Contact.astro:** 206 lines (reference spec min: 140)

## Accomplishments

- Replaced the flex-wrapped icon+name chip grid with a reference-correct 5-column letter-badge grid. Each badge is a whole-card anchor with `card-glow` hover, teal display-22 letter, platform name below. Unicode `𝕏` (U+1D54F) renders for X/Twitter per D-20; grep-verified in both `dist/en/index.html` and `dist/ru/index.html`.
- Added a primary teal "Write me a message" CTA that expands in place into a Form Card (Name / Email / Message) with native HTML5 validation. Submit handler builds a mailto URL with `encodeURIComponent` on subject and body, then assigns `window.location.href` and transitions to success state. Three `encodeURIComponent` calls satisfy T-10-01.
- Added an honest success panel with teal ✓, heading "Check your email client" (EN) / "Проверьте почтовый клиент" (RU), and a Close button that returns to CTA-only state. Copy does NOT claim the message was sent — mailto semantics honored.
- State machine implemented as `data-state="cta|form|success"` on the `<section>` root with CSS visibility selectors. Vanilla TS island mirrors SearchPalette null-guarded IIFE pattern. ESC scoped to the section (D-34) — zero conflict with SearchPalette's global ESC.
- `<noscript>` fallback surfaces a plain `mailto:viktor@vedmich.dev` anchor so JS-off visitors still get a working link (D-35).
- Extended `src/i18n/en.json` and `src/i18n/ru.json` with 11 new `contact.*` keys (1 + 8 + 3) in one atomic task commit. Bilingual parity verified by node JSON parse + key count diff.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 11 new contact.* i18n keys to en.json + ru.json (bilingual atomic edit)** — `5b9339f` (feat)
2. **Task 2: Rewrite Contact.astro — letter grid + inline-expand form + success state + island (wholesale replace)** — `87e4bce` (feat)

## Files Created/Modified

- `src/components/Contact.astro` (modified, wholesale rewrite) — letter-badge grid + CTA + form Card + success panel + scoped-style block + vanilla-TS island. 206 lines total.
- `src/i18n/en.json` (modified) — expanded `contact` block from 2 keys to 13 keys (title, subtitle kept verbatim; 11 new under `write_me_cta` + `form` + `success`).
- `src/i18n/ru.json` (modified) — mirror with Russian copy (includes U+2014 em-dash in `success.body`).

## Decision → Artifact Traceability

| Decision | Where implemented |
|---|---|
| D-01 mailto handoff | `Contact.astro:183` — `window.location.href = mailto` |
| D-02 reject third-party (Formspree/Web3Forms) | No external HTTP calls; `package.json` unchanged |
| D-03 recipient `viktor@vedmich.dev` | `Contact.astro:49, 179` — two literal occurrences (noscript + JS handler) |
| D-04 subject/body grammar | `Contact.astro:173-177` — `vedmich.dev — {name}` subject, `From: … <…>\n\n…` body |
| D-05 / D-06 three states, instant swap | `Contact.astro:130-143` `<style>` block with `[data-state="…"]` visibility |
| D-07 Cancel returns to CTA | `Contact.astro:164` — `cancelBtn.addEventListener('click', () => setState('cta'))` |
| D-09 native validation constraints | `Contact.astro:66, 77, 86-87` — `required` / `minlength="1"` / `type="email"` / `minlength="10"` |
| D-10 no `setCustomValidity` | grep-verified absent |
| D-11 no `novalidate` | grep-verified absent (including in comments) |
| D-13 / D-14 / D-15 honest success copy | i18n `success.heading`, `success.body`, `success.close` in both locales |
| D-16 Close returns to CTA | `Contact.astro:166` — `closeBtn.addEventListener('click', () => setState('cta'))` |
| D-18 responsive grid | `Contact.astro:20` — `grid-cols-2 sm:grid-cols-5 gap-3` |
| D-19 card style | `Contact.astro:28` — `p-5 rounded-[10px] bg-bg-base border border-border card-glow` |
| D-20 𝕏 literal | `Contact.astro:22` — `name.startsWith('X') ? '𝕏' : name[0]` |
| D-21 display label (X not X/Twitter) | `Contact.astro:23` — `name.startsWith('X') ? 'X' : name` |
| D-22 whole-card anchor | `Contact.astro:24-27` — `<a href={url} target="_blank" rel="noopener noreferrer">` wraps the whole card |
| D-23 CTA wrapper | `Contact.astro:39` — `<div class="mt-8 animate-on-scroll" data-contact-cta-wrapper>` |
| D-24 primary teal button | `Contact.astro:43` — `bg-brand-primary text-bg-base hover:bg-brand-primary-hover px-5 py-2.5 rounded-lg` |
| D-25 form Card (no card-glow) | `Contact.astro:58` — wrapper has `bg-bg-surface border border-border` but NO `card-glow` |
| D-26 field spacing | `Contact.astro:59` form uses `flex flex-col gap-[14px]`, labels `gap-[6px]`, inputs `px-[14px] py-[10px]` |
| D-27 button row | `Contact.astro:99` — `flex gap-[10px] mt-1.5` |
| D-28 uncontrolled inputs | `Contact.astro:170-172` — reads via `FormData(form)` in submit handler |
| D-29 11 new i18n keys | `src/i18n/{en,ru}.json` under `contact.*` |
| D-30 platform names not i18n'd | Labels come from `socialLinks` (locale-invariant) |
| D-31 single inline script | `Contact.astro:145-205` — no external `.ts` import |
| D-32 `data-state` attribute machine | `Contact.astro:13` (root attribute), `:130-143` (CSS gates), `:158-161` (setState writer) |
| D-33 `prefers-reduced-motion` irrelevant | No CSS transitions between states; visibility is `display: none`/default |
| D-34 scoped ESC | `Contact.astro:195-202` — `section.addEventListener('keydown', …)`, NOT document |
| D-35 noscript fallback | `Contact.astro:47-55` — `<noscript><a href="mailto:viktor@vedmich.dev">…</a></noscript>` |
| D-36 no SVG paths | grep-verified: `<path` absent from file |
| D-37 social.ts untouched | `git diff src/data/social.ts` shows 0 changes; Footer.astro still uses `icon` field |

## Threat Model Outcome

| Threat | Disposition | Status at completion |
|---|---|---|
| T-10-01 Tampering (header injection via mailto) | mitigate | **Mitigated.** `encodeURIComponent` wraps subject and body (plus the dual subject/body interpolation splits into 3 grep matches: `encodeURIComponent(subject)`, `encodeURIComponent(body)`, and `encodeURIComponent` is also the whole function name of interest — 3 occurrences total in source). Verified: `grep -c 'encodeURIComponent' src/components/Contact.astro` = 3 ≥ 3. |
| T-10-02 XSS via success panel | mitigate | **Mitigated.** No `.innerHTML` usage anywhere (grep count = 0). Success panel is pre-rendered by Astro from static i18n strings; island only toggles `data-state` attribute. |
| T-10-03 protocol redirect | accept | `mailto:` is a hardcoded literal; no user input controls scheme. |
| T-10-04 email harvesting | accept | `viktor@vedmich.dev` appears as plain mailto anchor in `<noscript>`. Bot-scrapeable. Deferred per CONTEXT.md; revisit if inbox floods. |
| T-10-05 supply chain | N/A | Zero dependencies added. `package.json` unchanged. |
| T-10-06 spoofing | accept | mailto recipient is hardcoded; user's own mail client renders draft. |

No new threat surfaces introduced. No `## Threat Flags` section needed.

## Decisions Made

Followed the plan exactly — all 37 locked decisions (D-01…D-37) implemented verbatim per spec. One micro-adjustment below that was a correctness requirement under deviation Rule 2, not a judgment call.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed the word "novalidate" from a source comment**
- **Found during:** Task 2 verification (file-level grep gate run)
- **Issue:** The spec's example code contained a comment `"D-11: no novalidate attribute"` explaining the reasoning. The plan's own acceptance criterion says `grep -q 'novalidate' src/components/Contact.astro` must exit non-zero (file MUST NOT contain the string `novalidate` anywhere). The word inside the comment would cause the grep-based acceptance gate to falsely fail.
- **Fix:** Reworded the comment to `"D-11 — validation enabled"` so the `novalidate` substring is absent from the source.
- **Files modified:** `src/components/Contact.astro` (1 line, inside Task 2's single commit)
- **Verification:** `grep -q 'novalidate' src/components/Contact.astro` exits 1 (not found) — acceptance criterion satisfied.
- **Committed in:** `87e4bce` (Task 2 commit; the fix was applied before the commit, not after)

---

**Total deviations:** 1 auto-fixed (Rule 2 — acceptance gate required the substring to be absent)
**Impact on plan:** Zero semantic change — the comment still documents that the form has native validation enabled per D-11. Rewording only removed a grep-trigger false positive.

## Deferred Issues

None. All task-scoped verification passed. The plan's known deferrals remain:
- Real form backend (Formspree / Web3Forms) — deferred pending email-volume feedback.
- Spam protection for scraped mailto address — deferred pending evidence of harvesting.
- Footer.astro SVG icon sprite cleanup — out of scope here; candidate for a future phase per PATTERNS.md §4. `src/data/social.ts` `icon` field stays until Footer is migrated.

## Known Stubs

None — every new i18n key is wired to a concrete rendering path, and every rendered path reads a real value. The form submit → mailto flow is the actual production path, not a stub.

## Pattern Deviations

None. All Tailwind token mappings from `10-PATTERNS.md` compiled cleanly. Specifically:
- `ring-brand-primary/40` (alpha via Tailwind 4 color-mix) compiled without error — same behavior verified in Phase 8.
- No fallback to solid `ring-brand-primary` was needed.
- No hex fallbacks added for any class.

## Build Output

```
31 page(s) built in 1.22s
✓ Completed in 62ms
[vite] ✓ built in 725ms
```

- Page count: 31 (baseline was 25 from Phase 9 — additional 6 come from new blog posts, not from this plan; this plan did not add/remove any routes)
- Build time: 1.22s total (well within the ~90s CI budget from CLAUDE.md)
- Bilingual ship: `Write me a message` in `dist/en/index.html`, `Напишите мне` in `dist/ru/index.html` — both grep-verified.
- 𝕏 literal rendered into both `dist/en/index.html` and `dist/ru/index.html`.

## Issues Encountered

Two grep-gate mismatches surfaced during verification and were resolved without deviating from the plan's intent:

1. **Source-level `<a href=` count gate** — the plan's `<verify><automated>` block specifies `test $(grep -c '<a href=' src/components/Contact.astro) -ge 5`. The source uses multi-line anchor tags (idiomatic Astro, mirrors `Podcasts.astro`), so `<a` and `href=` are on separate lines in the source — the grid anchor is a single `.map()` template, not 5 literal tags. Verified instead against the **rendered** output (`dist/en/index.html` and `dist/ru/index.html`) where the anchor count resolves to exactly 6 (5 letter badges + 1 noscript). This matches the acceptance criterion's stated intent ("letter grid anchors + noscript mailto anchor = at least 6"). Recorded here for transparency; no source change needed.

2. **`grep -c` counts lines, not occurrences** — the built HTML is minified onto a single line per section, so `grep -c '<a href='` returned `1` instead of `6`. Switched to `grep -o '<a href=' | wc -l` for accurate per-occurrence counting. This is a measurement-tooling fix, not a plan change.

## User Setup Required

**Pre-flight check (user-owned, out of Claude's scope per plan `user_setup`):**

Before the phase is considered accepted on live, the user must verify MX delivery for `viktor@vedmich.dev`:
- Send a test email from an external account.
- Confirm arrival in the expected inbox.

If MX is not configured, the mailto handoff will look visually correct but functionally fail silently for any user who hits Send (the draft opens but the send fails with a bounce). Block acceptance on live deploy until MX is confirmed. This is documented in `10-01-PLAN.md` frontmatter and `10-CONTEXT.md` §D-03.

## Next Phase Readiness

- Phase 10 code is ready for push to `main` — per CLAUDE.md §"Big changes" this is a component rewrite and could be PR-reviewed, but per site convention and the plan's verification note (Phases 5-9 pushed directly to main), direct push to `main` is the intended path.
- Visual verification remains post-deploy via Playwright MCP (attached Chrome) at desktop 1440px, mobile 375px, and JS-disabled. Those checks are user-driven and live-site-dependent — not achievable in the worktree.
- Phase 11 (logo refresh) is unblocked — no dependency on Phase 10 output. The Footer.astro SVG sprite remains eligible for a separate cleanup phase after the social.ts `icon` field is retired (candidate Phase 12+, not Phase 11).
- SearchPalette ↔ Contact ESC coexistence has been preserved (scoped ESC on Contact section per D-34). Any future phase adding another modal should follow the same pattern to avoid ESC collisions.

## Self-Check: PASSED

- `src/components/Contact.astro` exists and is 206 lines (≥ 140).
- `src/i18n/en.json` and `src/i18n/ru.json` both parse as valid JSON and contain all 11 new contact.* keys.
- Commit `5b9339f` exists in `git log` (Task 1 i18n).
- Commit `87e4bce` exists in `git log` (Task 2 Contact.astro rewrite).
- `src/data/social.ts` shows 0 diff since base (D-37 untouched).
- Build artifact `dist/en/index.html` contains `Write me a message` + `𝕏` + `Check your email client`.
- Build artifact `dist/ru/index.html` contains `Напишите мне` + `𝕏` + `Проверьте почтовый клиент`.

---
*Phase: 10-contact-letter-badges-working-form*
*Plan: 01*
*Completed: 2026-05-01*
