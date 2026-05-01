# Phase 10: Contact — letter badges + working form — Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 4 (1 component rewrite, 2 i18n JSONs, 1 optional data file)
**Analogs found:** 4 / 4 (100% coverage — every file has a strong in-repo analog)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/Contact.astro` (full rewrite) | component (Astro island) | event-driven + request-response (mailto handoff) | `src/components/SearchPalette.astro` (island) + `src/components/Podcasts.astro` (whole-card anchor grid) + `src/components/Book.astro` (primary CTA) | exact (3 complementary analogs) |
| `src/i18n/en.json` (+11 keys) | i18n config | static config | existing `contact.*` block in same file | exact |
| `src/i18n/ru.json` (+11 keys) | i18n config | static config | existing `contact.*` block in same file | exact |
| `src/data/social.ts` (maybe remove `icon`) | data module | static config | its own current shape | **N/A — do NOT remove `icon`** (see D-37 resolution below) |

### D-37 Resolution — KEEP the `icon` field

Per the grep Cclaude ran (`grep -rn "socialLinks" src/`), `src/components/Footer.astro:18` still destructures `{ name, url, icon }` from `socialLinks` and keys an inline-SVG sprite on `icon === 'linkedin' | 'github' | 'youtube' | 'twitter' | 'telegram'` (lines 28-32). **`src/data/social.ts` must stay untouched** — deleting `icon` would break the footer SVG render. The planner should either:
  a. leave `social.ts` alone (simplest, aligns with CONTEXT.md D-37 "if other callers rely on it, leave it"), or
  b. treat Footer's icon sprite as deferred cleanup for a future phase (out of scope for Phase 10).

**Recommendation: option (a).** Phase 10 touches 0 lines of `social.ts`.

---

## Pattern Assignments

### 1. `src/components/Contact.astro` (full rewrite, ~120-180 lines)

This is a composite — the file pulls from **three** analogs because no single existing component does "anchor-grid + stateful inline form + island". Each analog contributes one concern.

#### 1a. Component frontmatter + section wrapper

**Analog:** `src/components/Podcasts.astro:1-13`

```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---

<section id="podcasts" class="py-20 sm:py-28 bg-surface/30">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 class="font-display text-3xl font-bold mb-12 animate-on-scroll">{i.podcasts.title}</h2>
```

**Copy verbatim (swap names):**
- Frontmatter block (add `import { socialLinks } from '../data/social';` — same import already in current Contact.astro:3).
- Section wrapper: `<section id="contact" class="py-20 sm:py-28">` — **keep `max-w-6xl mx-auto px-4 sm:px-6`**, not `max-w-[1120px]`. CONTEXT.md §Code Context notes Presentations migrated to 1120 but does NOT require Contact to follow; staying at 6xl keeps visual parity with About/Podcasts which are the direct neighbours.
- Heading: `<h2 class="font-display text-3xl font-bold mb-3 animate-on-scroll">{i.contact.title}</h2>` (current Contact.astro:15 already has this — preserve).
- Subtitle: `<p class="text-text-muted mb-10 animate-on-scroll">{i.contact.subtitle}</p>` (preserve).

**New (not in Podcasts):** root `<section>` gets a `data-state="cta"` attribute so the island's state machine can toggle visibility via CSS attribute selectors (D-32).

---

#### 1b. Letter-badge whole-card anchor grid

**Analog:** `src/components/Podcasts.astro:18-50` (whole-card `<a>` with `card-glow`)

```astro
<a
  href="https://www.youtube.com/c/DevOpsKitchenTalks"
  target="_blank"
  rel="noopener noreferrer"
  class="group block p-6 rounded-xl bg-bg border border-border card-glow animate-on-scroll"
>
  ...inner content...
</a>
```

**Reference app.jsx:577-594 (visual contract):**
```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
  {socialLinks.map(s => (
    <a key={s.name} href={s.url}
      style={{ background: VV.bg, border: `1px solid ${VV.border}`, borderRadius: 10,
        padding: 20, ...display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = VV.teal;
        e.currentTarget.style.boxShadow = '0 0 20px rgba(20,184,166,.15)'; }}>
      <div style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 700, color: VV.teal }}>
        {s.name === 'X' ? '𝕏' : s.name[0]}
      </div>
      <div style={{ fontFamily: VV.fontBody, fontSize: 13, color: VV.text }}>{s.name}</div>
    </a>
  ))}
</div>
```

**What to copy from Podcasts.astro:**
- Whole-card `<a href={url} target="_blank" rel="noopener noreferrer">` wrapping pattern.
- `group` class + `card-glow animate-on-scroll` combo. `card-glow` (defined in `src/styles/global.css:118-124`) *already produces* the exact ref hover behaviour — border switches to `var(--brand-primary)` + `var(--shadow-glow)` = `0 0 20px rgba(20,184,166,0.15)`. **No inline styles, no JS hover handlers needed** — the React ref's `onMouseEnter/Leave` dance is a one-liner CSS utility in the Astro world.

**What's new (per D-18, D-19, D-20, D-21, D-22):**
```astro
<div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8 animate-on-scroll">
  {socialLinks.map(({ name, url }) => {
    const letter = name.startsWith('X') ? '𝕏' : name[0];
    const displayName = name === 'X / Twitter' ? 'X' : name;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-2 p-5 rounded-[10px] bg-bg-base border border-border card-glow"
      >
        <span class="font-display text-[22px] font-bold text-brand-primary">{letter}</span>
        <span class="font-body text-[13px] text-text-primary">{displayName}</span>
      </a>
    );
  })}
</div>
```

**Departures from Podcasts analog (intentional):**
- Padding: `p-5` (ref `padding: 20`) not `p-6`.
- Radius: `rounded-[10px]` (ref `borderRadius: 10`) not `rounded-xl` (which is 12).
- Background: `bg-bg-base` (ref `VV.bg`) not `bg-bg` shim alias. Both map to `--bg-base` via `@theme`, but canonical Deep Signal token is preferred for new code.
- Drop `group` class — no hover-child color dance needed (the ref has none; card-glow handles everything on the card itself).
- Drop the existing Contact.astro SVG sprite lines 26-32 entirely.
- `𝕏` literal Unicode character (U+1D54F), NOT `X`, per D-20 + reference.
- Platform label stays un-i18n'd (D-30) — LinkedIn/GitHub/YouTube/Telegram are proper nouns.

**Responsive grid (D-18, planner discretion):**
- Mobile: `grid-cols-2` — LinkedIn/GitHub on row 1, YouTube/X on row 2, Telegram spans row 3 (single cell is fine — it'll be half-width; if visually wonky, wrap the last card in a col-span-2 div for center).
- `sm:` (≥640px): `grid-cols-5` matches ref.
- Verify with Playwright at 375, 768, 1440 during implementation.

---

#### 1c. "Write me a message" CTA (primary teal button)

**Analog:** `src/components/Book.astro:84-89` (Book's Amazon CTA — amber variant, swap amber→primary for teal)

```astro
<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent text-bg-base font-medium hover:bg-brand-accent-hover transition-colors">
  {i.book.cta}
  <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" ...>
```

**Reference app.jsx:131-155 `Button variant="primary"`:**
```jsx
primary: { bg: VV.teal, fg: VV.bg, bd: VV.teal },
// padding: '10px 20px', borderRadius: 8, fontFamily: VV.fontBody, fontSize: 15, fontWeight: 500
```

**What to copy (swap color token, drop arrow SVG):**
```astro
<div class="text-center mt-8" data-contact-cta-wrapper>
  <button
    type="button"
    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-bg-base font-body text-[15px] font-medium hover:bg-brand-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
    data-contact-open-form
  >
    {i.contact.write_me_cta}
  </button>
  <noscript>
    <a
      href="mailto:viktor@vedmich.dev"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-bg-base font-body text-[15px] font-medium hover:bg-brand-primary-hover transition-colors"
    >
      {i.contact.write_me_cta}
    </a>
  </noscript>
</div>
```

**Departures:**
- Color: `bg-brand-primary` + `hover:bg-brand-primary-hover` + `text-bg-base` (D-24) — teal, not amber.
- Padding: `px-5 py-2.5` (matches both Book CTA and ref `10px 20px`). `py-2.5` = 10px.
- Rendered as `<button>` (not `<a>`) because it toggles state, not navigates. `type="button"` to block implicit form-submit if nested later.
- `<noscript>` fallback (D-35, chosen option) — plain mailto anchor so JS-off users get the OS mail client. The `<button>` sibling has no `href` and won't do anything without JS, so the noscript path is the only way it "works" without JS.
- `data-contact-open-form` attribute — island event-delegation hook (parallel to SearchPalette's `id="search-palette-input"`).

---

#### 1d. Form Card — inline expand in place

**Reference app.jsx:601-621 `<Card hoverable={false}>` with form:**
```jsx
<Card hoverable={false}>
  <form onSubmit={...} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: VV.fontBody, fontSize: 13, fontWeight: 500, color: VV.text }}>Name</span>
      <input required type="text" style={inputStyle} placeholder="Your name"/>
    </label>
    ...Email...
    ...Message (textarea rows="4")...
    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
      <Button variant="primary">Send</Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </div>
  </form>
</Card>
```

**inputStyle constant (app.jsx:634-637):**
```jsx
const inputStyle = {
  fontFamily: VV.fontBody, fontSize: 15, background: VV.bg, color: VV.text,
  border: `1px solid ${VV.border}`, borderRadius: 8, padding: '10px 14px', outline: 'none'
};
```

**Analog for Card container in site code:** `src/components/Podcasts.astro:22` (Card pattern) minus the `card-glow` — matches ref `hoverable={false}`.

**New (no direct analog — reference-driven):**
```astro
<div class="max-w-[480px] mx-auto mt-8 p-6 rounded-xl bg-bg-surface border border-border" data-contact-form-wrapper>
  <form data-contact-form class="flex flex-col gap-[14px]" novalidate-aware>
    <label class="flex flex-col gap-[6px]">
      <span class="font-body text-[13px] font-medium text-text-primary">{i.contact.form.name_label}</span>
      <input
        required
        type="text"
        name="name"
        minlength="1"
        placeholder={i.contact.form.name_placeholder}
        class="bg-bg-base text-text-primary border border-border rounded-lg px-[14px] py-[10px] font-body text-[15px] outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/40"
      />
    </label>
    <label class="flex flex-col gap-[6px]">
      <span class="font-body text-[13px] font-medium text-text-primary">{i.contact.form.email_label}</span>
      <input
        required
        type="email"
        name="email"
        placeholder={i.contact.form.email_placeholder}
        class="bg-bg-base text-text-primary border border-border rounded-lg px-[14px] py-[10px] font-body text-[15px] outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/40"
      />
    </label>
    <label class="flex flex-col gap-[6px]">
      <span class="font-body text-[13px] font-medium text-text-primary">{i.contact.form.message_label}</span>
      <textarea
        required
        name="message"
        rows="4"
        minlength="10"
        placeholder={i.contact.form.message_placeholder}
        class="bg-bg-base text-text-primary border border-border rounded-lg px-[14px] py-[10px] font-body text-[15px] outline-none focus-visible:border-brand-primary focus-visible:ring-1 focus-visible:ring-brand-primary/40 resize-y"
      ></textarea>
    </label>
    <div class="flex gap-[10px] mt-1.5">
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-bg-base font-body text-[15px] font-medium hover:bg-brand-primary-hover transition-colors"
      >
        {i.contact.form.send}
      </button>
      <button
        type="button"
        data-contact-cancel
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent text-text-primary border border-border hover:border-brand-primary font-body text-[15px] font-medium transition-colors"
      >
        {i.contact.form.cancel}
      </button>
    </div>
  </form>
</div>
```

**Key token mappings (Tailwind class ← ref inline style):**

| Reference (app.jsx:634-637) | Tailwind class | Token |
|---|---|---|
| `fontFamily: VV.fontBody` | `font-body` | `--font-body` (Inter) |
| `fontSize: 15` | `text-[15px]` | (literal) |
| `background: VV.bg` | `bg-bg-base` | `--bg-base` |
| `color: VV.text` | `text-text-primary` | `--text-primary` |
| `border: 1px solid VV.border` | `border border-border` | `--border` |
| `borderRadius: 8` | `rounded-lg` | `--radius-md` (exactly 8) |
| `padding: 10px 14px` | `px-[14px] py-[10px]` | (literal) |
| `outline: none` | `outline-none` | — |

Form Card token mappings:
| Reference | Tailwind | Token |
|---|---|---|
| `background: VV.surface` (Card default) | `bg-bg-surface` | `--bg-surface` |
| `borderRadius: 12` | `rounded-xl` | `--radius-lg` is 12 ✓ |
| `padding: 24` | `p-6` | 24px ✓ |

**Why NOT `card-glow` on form card:** D-25 locks `hoverable={false}`. `card-glow:hover` switches border to teal — not wanted on the form panel (keeps focus on inputs, not the frame).

**`novalidate` is intentionally absent** per D-11 — we want the browser to block submit on invalid fields. (The `novalidate-aware` placeholder in the snippet above is a mental note for the planner — just don't type `novalidate` into the `<form>`.)

---

#### 1e. Success state panel

**Reference app.jsx:622-628:**
```jsx
<div style={{ textAlign: 'center', padding: '20px 0' }}>
  <div style={{ fontFamily: VV.fontMono, fontSize: 32, color: VV.teal }}>✓</div>
  <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 20, color: VV.text, margin: '8px 0' }}>Message sent</h3>
  <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: 0 }}>I'll get back to you within a day or two.</p>
</div>
```

**New (reference shape + D-13/14/15/16 honest-copy override):**

Success state lives inside the **same** `max-w-[480px] p-6 bg-bg-surface border border-border rounded-xl` wrapper as the form — the wrapper is the "Card slot", and its inner content swaps form ↔ success based on `data-state` (D-05, D-32).

```astro
<div class="text-center py-5" data-contact-success-wrapper>
  <div class="font-mono text-[32px] text-brand-primary" aria-hidden="true">✓</div>
  <h3 class="font-display text-[20px] text-text-primary my-2">{i.contact.success.heading}</h3>
  <p class="font-body text-text-muted m-0">{i.contact.success.body}</p>
  <button
    type="button"
    data-contact-close-success
    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent text-text-primary border border-border hover:border-brand-primary font-body text-[15px] font-medium transition-colors mt-4"
  >
    {i.contact.success.close}
  </button>
</div>
```

**Departures from ref:**
- `✓` glyph uses `text-brand-primary` (teal), **not** `text-[var(--success)]` (emerald) — explicit in canonical_refs §`--success: #10B981` note.
- Added Close button (D-14, D-16) — ref has none, but ref uses `sent` state with no reset path. We need `success → cta` transition.
- Heading copy swapped: ref says "Message sent" (lie for mailto). We use D-14 `"Check your email client"` / D-15 `"Проверьте почтовый клиент"`.

---

#### 1f. Island script (vanilla TS)

**Analog:** `src/components/SearchPalette.astro:135-336`

**Key excerpts to mirror:**

**(i) Null-guard IIFE entry (SearchPalette:166-173):**
```typescript
const palette = document.getElementById('search-palette');
const card = document.getElementById('search-palette-card');
const input = document.getElementById('search-palette-input') as HTMLInputElement | null;
...
if (palette && card && input && resultsEl && countEl && indexEl) {
  // all state + listeners guarded inside this block
}
```
→ **Copy this null-guard pattern.** For Contact, query the section root + form + triggers:
```typescript
const section = document.getElementById('contact');
const openBtn = section?.querySelector<HTMLButtonElement>('[data-contact-open-form]');
const form = section?.querySelector<HTMLFormElement>('[data-contact-form]');
const cancelBtn = section?.querySelector<HTMLButtonElement>('[data-contact-cancel]');
const closeBtn = section?.querySelector<HTMLButtonElement>('[data-contact-close-success]');
const nameInput = form?.querySelector<HTMLInputElement>('input[name="name"]');

if (section && openBtn && form && cancelBtn && closeBtn && nameInput) {
  // state machine + handlers
}
```

**(ii) State machine via attribute (SearchPalette:249-269 open/close):**
```typescript
function open(): void {
  if (!palette!.classList.contains('hidden')) return;
  lastFocused = (document.activeElement as HTMLElement) || null;
  palette!.classList.remove('hidden');
  ...
  setTimeout(() => input!.focus(), 10);
}

function close(): void {
  palette!.classList.add('hidden');
  ...
  if (lastFocused && typeof lastFocused.focus === 'function') {
    lastFocused.focus();
  }
}
```

→ **Adapt to `data-state` attribute** (D-32 prefers data-state over classList toggling):
```typescript
type ContactState = 'cta' | 'form' | 'success';

function setState(next: ContactState): void {
  section!.setAttribute('data-state', next);
  if (next === 'form') {
    setTimeout(() => nameInput!.focus(), 10);  // same focus pattern as SearchPalette
  }
}
```

**CSS companion (inside `<style>` block in Contact.astro):**
```css
[data-state="cta"] [data-contact-form-wrapper],
[data-state="cta"] [data-contact-success-wrapper] { display: none; }
[data-state="form"] [data-contact-cta-wrapper],
[data-state="form"] [data-contact-success-wrapper] { display: none; }
[data-state="success"] [data-contact-cta-wrapper],
[data-state="success"] [data-contact-form-wrapper] { display: none; }
[data-state="form"] [data-contact-success-wrapper],
[data-state="success"] [data-contact-form-wrapper] { display: none; }
/* form-wrapper and success-wrapper share the same visual slot — so only one is visible per state */
```
(Planner may simplify with a cleaner selector; the above is explicit for clarity.)

**(iii) Event listeners + scoped ESC (SearchPalette:274-296, 308-334):**

SearchPalette attaches `keydown` globally to `document` — fine for a palette but would conflict with Contact's ESC (D-34 explicit: scope Contact's ESC to the section).

**Copy input/click wiring pattern, scope ESC to section:**
```typescript
openBtn.addEventListener('click', () => setState('form'));
cancelBtn.addEventListener('click', () => setState('cta'));
closeBtn.addEventListener('click', () => setState('cta'));

form.addEventListener('submit', (e) => {
  e.preventDefault();  // after native validation passes
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim();
  const email = String(fd.get('email') || '').trim();
  const message = String(fd.get('message') || '');
  const subject = name ? `vedmich.dev — ${name}` : 'vedmich.dev — Contact';
  const body = `From: ${name} <${email}>\n\n${message}`;
  const mailto = `mailto:viktor@vedmich.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  setState('success');
});

// D-34: ESC scoped to section, not document (avoid SearchPalette conflict)
section.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const state = section!.getAttribute('data-state');
    if (state === 'form' || state === 'success') {
      e.preventDefault();
      setState('cta');
    }
  }
});
```

**What NOT to copy from SearchPalette:**
- Global `document.addEventListener('keydown', ...)` — Contact's ESC must be scoped to the `<section>` per D-34.
- `⌘K / /` hotkeys — irrelevant; Contact is not a palette.
- Custom event bus (`vv:search:open`, `vv:search:close`) — Contact's only entry is a button click, no external triggers.
- `lastFocused` focus restoration — Contact isn't a modal. Cancel/Close returns naturally to the button row.

**(iv) i18n via data-attributes on root (SearchPalette:24-29):**
```astro
data-i18n-no-results={i.search.no_results}
data-i18n-kind-slides={i.search.kind_slides}
```
and read in script (SearchPalette:180-182):
```typescript
const noResultsLabel = palette.getAttribute('data-i18n-no-results') || 'No matches for';
```

**Contact does NOT need this pattern** — all i18n copy is rendered by Astro at build time (static template strings). The island never needs to read locale strings at runtime because it never *creates* text nodes (it just toggles visibility of pre-rendered HTML). Simpler than SearchPalette which builds result cards dynamically.

---

#### 1g. Summary — what Contact.astro looks like end-to-end

File structure (top to bottom):
1. Frontmatter — import `t`, `Locale`, `socialLinks`.
2. `<section id="contact" data-state="cta">` — root with attribute state.
3. Heading + subtitle (keep existing i18n `contact.title`, `contact.subtitle`).
4. Letter-badge grid (1b).
5. `<div data-contact-cta-wrapper>` — primary CTA button + `<noscript>` mailto (1c).
6. `<div data-contact-form-wrapper>` — Form Card (1d).
7. `<div data-contact-success-wrapper>` — success panel (1e).
8. `<style>` block — `data-state` CSS selectors toggling visibility.
9. `<script>` — island (1f).

---

### 2. `src/i18n/en.json` (+11 new keys)

**Analog:** the file itself — existing `contact` block at lines 74-77.

**Current shape (en.json:74-77):**
```json
"contact": {
  "title": "Let's Connect",
  "subtitle": "Find me on these platforms"
},
```

**Target shape (add 11 keys, keep existing two):**
```json
"contact": {
  "title": "Let's Connect",
  "subtitle": "Find me on these platforms",
  "write_me_cta": "Write me a message",
  "form": {
    "name_label": "Name",
    "name_placeholder": "Your name",
    "email_label": "Email",
    "email_placeholder": "you@domain.com",
    "message_label": "Message",
    "message_placeholder": "What should we build?",
    "send": "Send",
    "cancel": "Cancel"
  },
  "success": {
    "heading": "Check your email client",
    "body": "Your default mail app should have opened with a draft. Send when ready — I usually reply within a day or two.",
    "close": "Close"
  }
},
```

**Shape rationale:** nested `form` / `success` objects mirror the dot-path specified in CONTEXT.md D-29 (`contact.form.name_label`, `contact.success.heading`, …) and match the existing nested convention already used in the file (e.g. `nav.search_label`, `hero.tagline_accent`, etc.). The `t(locale)` helper in `src/i18n/utils.ts:10-12` returns the whole translations object — accessing `i.contact.form.name_label` just works with no helper changes.

---

### 3. `src/i18n/ru.json` (+11 new keys)

**Analog:** the file itself — existing `contact` block at lines 74-77 (mirror of en.json).

**Target shape (Russian copy from CONTEXT.md D-29, D-15):**
```json
"contact": {
  "title": "Связаться",
  "subtitle": "Найдите меня на этих платформах",
  "write_me_cta": "Напишите мне",
  "form": {
    "name_label": "Имя",
    "name_placeholder": "Ваше имя",
    "email_label": "Email",
    "email_placeholder": "you@domain.com",
    "message_label": "Сообщение",
    "message_placeholder": "О чём поговорим?",
    "send": "Отправить",
    "cancel": "Отмена"
  },
  "success": {
    "heading": "Проверьте почтовый клиент",
    "body": "Почтовое приложение должно было открыться с черновиком. Отправьте, когда будете готовы — обычно отвечаю за день-два.",
    "close": "Закрыть"
  }
},
```

**Rules (reinforced in CLAUDE.md):**
- Both JSONs change in the **same commit** — bilingual edits are atomic per site convention.
- `email_placeholder` stays `you@domain.com` in both locales (it's a literal email format, not translated content).
- `success.heading` is newline-free; `success.body` contains an em-dash `—` (same character as EN, not `--` or hyphen).

---

### 4. `src/data/social.ts` — **no edits** (D-37 reconsidered)

**Analog:** itself — existing `socialLinks` `as const` array.

**Decision (overrides CONTEXT.md D-37 conditional):** leave the file untouched. Rationale:
- `src/components/Footer.astro:18-32` actively destructures `{ name, url, icon }` and renders inline SVG paths keyed on `icon` values `linkedin | github | youtube | twitter | telegram`.
- Deleting `icon` from `social.ts` would break the footer at build time (TypeScript error) **and** at render (no SVG).
- D-37 explicitly says "leave it" if other callers rely on it — Footer is exactly that caller.

**Planner action:** note in PLAN.md that `social.ts` is untouched, and mention "Footer's SVG icon sprite is a candidate for deferred cleanup" in a future phase (not Phase 10 scope).

---

## Shared Patterns

### Pattern: Whole-card anchor for external links
**Source:** `src/components/Podcasts.astro:18-23`, `src/components/Book.astro:50-55`
**Apply to:** Each of the 5 letter-badge cards in Contact grid.
```astro
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  class="... card-glow animate-on-scroll"
>
```

### Pattern: `card-glow` hover utility
**Source:** `src/styles/global.css:118-124`
```css
.card-glow {
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}
.card-glow:hover {
  box-shadow: var(--shadow-glow);     /* 0 0 20px rgba(20,184,166,0.15) */
  border-color: var(--brand-primary); /* #14B8A6 */
}
```
**Apply to:** Letter-badge cards. **Do not apply** to Form Card (D-25).

### Pattern: `animate-on-scroll` entrance
**Source:** `src/styles/global.css:109-115`
```css
.animate-on-scroll { opacity: 0; }
.animate-on-scroll.is-visible { animation: fadeInUp 0.6s ease-out forwards; }
```
**Apply to:** Section heading, subtitle, letter grid, CTA wrapper. **Skip** form-wrapper and success-wrapper (they fade in via state swap, which is instant per D-06 — adding `animate-on-scroll` would cause them to stay at `opacity: 0` because the scroll observer never fires on an element that enters the DOM via `display` toggle).

### Pattern: Island null-guarded IIFE
**Source:** `src/components/SearchPalette.astro:166-173`
```typescript
const palette = document.getElementById('search-palette');
// ... more querySelectors
if (palette && card && input && ...) {
  // all state + listeners inside
}
```
**Apply to:** Contact island wrapper (prevents crashes if section is absent from a page variant).

### Pattern: Bilingual data-attribute for i18n-in-script
**Source:** `src/components/SearchPalette.astro:24-29, 180-182`
**Apply to Contact:** **NOT applicable.** Contact's island never generates strings at runtime — it just toggles visibility of statically rendered HTML. Do not over-engineer.

### Pattern: Primary teal CTA button
**Source:** `src/components/Book.astro:84-89` (swap amber→primary tokens)
**Apply to:** "Write me a message" CTA + "Send" button.
```
class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-bg-base font-body text-[15px] font-medium hover:bg-brand-primary-hover transition-colors"
```

### Pattern: Ghost button (Cancel / Close)
**Source:** reference app.jsx:131-155 `Button variant="ghost"` — no direct site analog, this is new.
```
class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent text-text-primary border border-border hover:border-brand-primary font-body text-[15px] font-medium transition-colors"
```

---

## No Analog Found

None. Every file in this phase has an established analog in the codebase.

The only structural "newness" is the **inline state machine with `data-state` attribute selectors** — this is a minor progression from SearchPalette's `classList.toggle('hidden')` pattern, not a new paradigm. CSS attribute selectors are a well-supported primitive in the same stylistic family as the existing scroll-observer `is-visible` class toggle. Planner should not treat this as risky — it's a declarative simplification over SearchPalette's imperative visibility handling.

---

## Metadata

**Analog search scope:** `src/components/`, `src/data/`, `src/i18n/`, `src/styles/`.
**Files scanned:** 9 direct reads (Contact, SearchPalette, Podcasts, Book, Presentations, Footer, social.ts, en.json, ru.json, utils.ts, design-tokens.css, global.css, reference app.jsx sections).
**Grep verifications:** 1 (`socialLinks` usage — revealed Footer dependency that overrides D-37 conditional).
**Pattern extraction date:** 2026-05-01
**Ready for:** `gsd-planner` to assemble `10-PLAN.md`.
