# Phase 12: Footer match — Pattern Map

**Mapped:** 2026-05-01
**Files analyzed:** 1 (modify — full rewrite, 43 → ~14 lines)
**Analogs found:** 1 / 1 (strong in-repo analogs — `Hero.astro`, `Presentations.astro`)

---

## File Classification

### Files to modify

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `src/components/Footer.astro` | component (presentational, i18n-aware, site-chrome) | request-response (SSG render) — `{ locale }` prop → `t(locale)` helper → i18n JSON lookup → inline text | `src/components/Hero.astro` (frontmatter props contract) + `src/components/Presentations.astro` (`max-w-[1120px]` container) | exact (both analogs ship identical Props + locale + `t()` patterns) |

### Files to create

None. Single-file rewrite; no new files, no new i18n keys, no new dependencies.

---

## Pattern Assignments

### `src/components/Footer.astro` (component, request-response)

**Analogs:**
- **Frontmatter / Props pattern** → `src/components/Hero.astro` (lines 1–10) — identical `{ locale }` + `t(locale)` → `i` destructure shape.
- **`max-w-[1120px]` container pattern** → `src/components/Presentations.astro` (line 25) and `src/components/Hero.astro` (line 13) — canonical v0.4 container width.
- **Reference UI kit source** → `~/.claude/skills/viktor-vedmich-design/ui_kits/vedmich-dev/app.jsx:640-648` (target shape).
- **Current file (to be replaced)** → `src/components/Footer.astro` (lines 1–43, verbatim below).

---

#### Analog 1 — `src/components/Hero.astro` (frontmatter / Props contract)

**Imports + Props + locale destructure** (lines 1–10 verbatim):

```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

Patterns to copy into `Footer.astro`:

- **Single import** from `../i18n/utils` — `t` (function) + `type Locale` (type).
- **No `socialLinks` import** — the new Footer is text-only; the old `import { socialLinks } from '../data/social'` must be **deleted**.
- `interface Props { locale: Locale; }` — exact shape (not optional).
- `const { locale } = Astro.props;` — inline destructure.
- `const i = t(locale);` — alias for nested i18n lookups (`i.footer.copyright`, `i.footer.built_with`).

**Footer-specific addition** (absent from Hero): a derived `year` constant.

```astro
const year = new Date().getFullYear();
```

This preserves the dynamic-year behaviour (per CONTEXT D-03) without polluting the JSX with inline `new Date()` calls.

---

#### Analog 2 — `src/components/Presentations.astro` (container + Tailwind utility pattern)

**Container wrapper** (lines 24–25 verbatim):

```astro
<section id="presentations" class="py-20 sm:py-28 bg-surface">
  <div class="max-w-[1120px] mx-auto px-6">
```

And from **`src/components/Hero.astro`** (line 13 verbatim — same container width, slightly different inner padding scheme):

```astro
<section id="hero" class="hero-deep-signal noise-overlay relative overflow-hidden pt-24 pb-16 px-6">
  <div class="max-w-[1120px] mx-auto w-full">
```

Patterns to copy into `Footer.astro`:

- **`max-w-[1120px]`** — Tailwind arbitrary-value width. Canonical v0.4 content width. Replaces current `max-w-6xl` (1152px).
- **`mx-auto`** — horizontal centering. Unchanged from current Footer.
- **`px-4 sm:px-6`** (Footer-specific, per CONTEXT D-02) — mobile guard. Hero and Presentations use `px-6` consistently, but CONTEXT explicitly calls for the `px-4 sm:px-6` progressive padding to protect 375px render (reference UI kit was designed at 1440px only).

Note for planner: do NOT blindly copy `px-6` from Presentations. CONTEXT D-02 is prescriptive — `px-4 sm:px-6` on the inner `<div>`.

---

#### Analog 3 — Reference UI kit target shape (`app.jsx:640-648`)

**Verbatim reference** (JSX with inline styles, from CONTEXT.md:18-28):

```jsx
const Footer = () => (
  <footer style={{ padding: '32px 24px', borderTop: `1px solid ${VV.border}` }}>
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between',
      fontFamily: VV.fontBody, fontSize: 13, color: VV.muted }}>
      <span>© 2026 Viktor Vedmich</span>
      <span>Built with Astro</span>
    </div>
  </footer>
);
```

Inline-style → Tailwind / design-token mapping:

| Reference inline style | Footer.astro (Tailwind + token) | Note |
|---|---|---|
| `borderTop: 1px solid ${VV.border}` | `class="border-t border-border"` on `<footer>` | Solid — drop `/50` alpha (CONTEXT D-02). |
| `padding: '32px 24px'` | `py-8 px-4 sm:px-6` on inner `<div>` | `py-8` = 32px. `px-4 sm:px-6` (mobile guard per D-02, not literal 24px) — CONTEXT explicitly accepts the divergence. |
| `maxWidth: 1120` | `max-w-[1120px]` | Arbitrary-value utility. |
| `margin: '0 auto'` | `mx-auto` | Standard centering. |
| `display: flex, justifyContent: 'space-between'` | `flex items-center justify-between` | Adds `items-center` for vertical alignment. |
| `fontFamily: VV.fontBody` | (implicit — body default) | `--font-body` = Inter, inherited from `<body>`. No class needed. |
| `fontSize: 13` | `text-[13px]` | Tailwind arbitrary value, per CONTEXT D-04. Replaces current `text-sm` (14px). |
| `color: VV.muted` | `text-text-muted` | Deep Signal token. `VV.muted` = `#78909C` = `--text-muted`. Unchanged from current. |
| `<span>© 2026 Viktor Vedmich</span>` | `<span>{i.footer.copyright.replace('{year}', String(year))}</span>` | Dynamic year + i18n (CONTEXT D-03). |
| `<span>Built with Astro</span>` | `<span>{i.footer.built_with}</span>` | Bilingual i18n preserved (CONTEXT D-04). |

---

#### Current markup (reference — the code being replaced)

For planner: these are the lines to delete (`src/components/Footer.astro:1-43` verbatim):

```astro
---
import { t, type Locale } from '../i18n/utils';
import { socialLinks } from '../data/social';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
const year = new Date().getFullYear();
---

<footer class="border-t border-border/50 bg-surface/30">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        {socialLinks.map(({ name, url, icon }) => (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-text-muted hover:text-accent transition-colors"
            title={name}
          >
            <span class="sr-only">{name}</span>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              {icon === 'linkedin' && <path d="…" />}
              {icon === 'github' && <path d="…" />}
              {icon === 'youtube' && <path d="…" />}
              {icon === 'twitter' && <path d="…" />}
              {icon === 'telegram' && <path d="…" />}
            </svg>
          </a>
        ))}
      </div>
      <div class="text-sm text-text-muted">
        {i.footer.copyright.replace('{year}', String(year))} &middot; {i.footer.built_with}
      </div>
    </div>
  </div>
</footer>
```

Delete markers (per CONTEXT D-01 + D-02):

1. Line 3: `import { socialLinks } from '../data/social';` — **DELETE** (unused after icon removal).
2. Lines 17–36: entire `<div class="flex items-center gap-4">…socialLinks.map…</div>` block with 5 SVG anchors — **DELETE**.
3. Line 14: `class="border-t border-border/50 bg-surface/30"` → replace with `class="border-t border-border"` (drop `/50` alpha, drop `bg-surface/30`).
4. Line 15: `class="max-w-6xl mx-auto px-4 sm:px-6 py-8"` → replace container width (`max-w-6xl` → `max-w-[1120px]`); drop the nested wrapping `<div class="flex flex-col sm:flex-row…gap-4">` at line 16.
5. Line 37: `class="text-sm text-text-muted"` → merge with container classes + bump to `text-[13px]`.
6. Line 38: `{i.footer.copyright.replace('{year}', String(year))} &middot; {i.footer.built_with}` (single-span, separator-delimited) → split into **two `<span>` siblings** for flex `justify-between` to separate them.

---

#### Target shape (per CONTEXT D-05)

Assembled from the analogs above:

```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
const year = new Date().getFullYear();
---

<footer class="border-t border-border">
  <div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 flex items-center justify-between text-[13px] text-text-muted">
    <span>{i.footer.copyright.replace('{year}', String(year))}</span>
    <span>{i.footer.built_with}</span>
  </div>
</footer>
```

LOC delta: 43 → 14 lines (–29). No `<style>` block needed (all tokens + utilities).

---

## Shared Patterns

### Astro component contract — `{ locale }` prop

**Source:** Every homepage component that handles i18n. Consistent shape across:
- `src/components/Hero.astro:1-10`
- `src/components/Presentations.astro:1-11`
- `src/components/Footer.astro:1-11` (current, to be preserved)

**Apply to:** `src/components/Footer.astro` (rewrite).

```astro
---
import { t, type Locale } from '../i18n/utils';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const i = t(locale);
---
```

Invariant for the whole `v0.4` codebase. Do NOT deviate — `BaseLayout.astro:72` calls `<Footer locale={locale} />` and relies on this exact signature.

### i18n template-replace pattern (dynamic year)

**Source:** current `Footer.astro:38` — the only consumer of `.replace('{year}', …)` in the codebase. Unique to this component.

**Apply to:** new `Footer.astro`, unchanged.

```astro
{i.footer.copyright.replace('{year}', String(year))}
```

Notes:
- `i.footer.copyright` contains the literal placeholder `{year}` (EN: `"© {year} Viktor Vedmich"`, RU: `"© {year} Виктор Ведмич"`).
- `String(year)` coerces `number` → `string` for `String.prototype.replace` signature safety.
- Placeholder token choice `{year}` is Footer-local; no other i18n string uses a template placeholder, so no shared utility is warranted.
- Analog for placeholder-style templating (different syntax): `src/components/Presentations.astro:21` uses `.replace('{N}', String(totalCount))` — same pattern, different key. Keep both in sync mentally: `replace('{key}', String(value))` is the codebase idiom.

### Deep Signal container width (`max-w-[1120px]`)

**Source:** `src/components/Hero.astro:13` + `src/components/Presentations.astro:25` (plus all other v0.4 homepage sections from Phase 4+).

**Apply to:** `Footer.astro` inner `<div>`.

```astro
<div class="max-w-[1120px] mx-auto px-4 sm:px-6 py-8 …">
```

Note: current Footer uses `max-w-6xl` (= 1152px), which is 32px wider than canonical v0.4. The switch is cosmetic (32px / 2 = 16px per side) but visually aligns Footer edges with every other section.

### Deep Signal color tokens — no hardcoded hex

**Source:** `CLAUDE.md` anti-pattern table — "Never add hardcoded hex colors to components — always reference a token".

**Apply to:** all components in this phase (only Footer here).

Tokens used:
- `text-text-muted` → `--text-muted` (`#78909C`). Matches reference `VV.muted`.
- `border-border` → `--border` (`#334155`). Matches reference `VV.border`.

Not used (but deliberately **absent** from target):
- No `bg-*` on `<footer>` — dropping `bg-surface/30` allows `--bg-base` gradient continuity.
- No hex literals. No deprecated cyan (`#06B6D4`, `#22D3EE`).

### i18n parity — EN + RU mirror

**Source:** `CLAUDE.md` — "Bilingual edits — every text change must land in BOTH `src/i18n/en.json` and `src/i18n/ru.json`".

**Apply to:** ANY text change. This phase has **no text changes** — both keys already exist and are symmetric:

| Key | EN (line 97-98) | RU (line 97-98) |
|---|---|---|
| `footer.built_with` | `"Built with Astro"` | `"Создано на Astro"` |
| `footer.copyright` | `"© {year} Viktor Vedmich"` | `"© {year} Виктор Ведмич"` |

Planner: no i18n file edits needed for Phase 12.

---

## Removed Dependency — Dead-Code Note

### `socialLinks` import

**Current coupling:** `src/components/Footer.astro:3` → `src/data/social.ts:1` (`export const socialLinks = [ … ]`).

**After Phase 12:**
- `src/components/Footer.astro` no longer imports `socialLinks`.
- `src/data/social.ts` `socialLinks` export stays — **still consumed** by `src/components/Contact.astro:3` (verified via grep: only two importers today; Footer + Contact).

**Planner caution:** do NOT delete `src/data/social.ts` or the `socialLinks` export. Only delete the import line in `Footer.astro`. The Contact section (Phase 10 — letter-badges form) still drives the 5-platform social row from this data.

### 5 inline SVG `<path>` blocks

Hardcoded SVG path strings at lines 28–32 of current Footer (LinkedIn, GitHub, YouTube, X/Twitter, Telegram). All 5 `<path>` literals are deleted along with the `socialLinks.map(…)` block.

The same SVG paths also live in `src/components/Contact.astro` (Phase 10 letter-badges used a different rendering path — letter glyphs, not SVG icons). If the Contact section renders SVG icons from the same source, no duplication removed. Verified: `Contact.astro` does NOT embed SVG `<path>` — it uses letter-badges (L/G/Y/X/T) and label text. Footer SVG blocks are genuinely one-off, safe to delete.

---

## No Analog Found

None. The rewrite is fully covered by two in-repo analogs (Hero + Presentations) plus one external reference (`app.jsx:640-648`). No greenfield patterns, no new libraries, no new i18n keys.

---

## Metadata

**Analog search scope:**
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/components/` (all `.astro` files with `{ locale }` props + `max-w-[1120px]` usage)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/data/social.ts` (verify export consumers after import removal)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/i18n/{en,ru}.json` (verify footer keys exist bilingually)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/styles/design-tokens.css` (verify `--text-muted`, `--border` tokens)
- `/Users/viktor/Documents/GitHub/vedmich/vedmich.dev/src/layouts/BaseLayout.astro` (verify consumer contract — `<Footer locale={locale} />` on line 72)

**Files read for pattern extraction:**
- `src/components/Footer.astro` (43 lines, full file — the rewrite target)
- `src/components/Hero.astro` (89 lines, full file — frontmatter + container analogs)
- `src/components/Presentations.astro` (44 lines, full file — container + replace() analog)
- `src/layouts/BaseLayout.astro` (105 lines, full file — consumer)
- `src/styles/design-tokens.css` (298 lines, full file — token confirmation)
- `src/i18n/en.json` (101 lines, full file — footer key verification)
- `src/i18n/ru.json` (101 lines, full file — bilingual parity verification)
- `.planning/phases/12-footer-match/12-CONTEXT.md` (249 lines, full file — decisions)
- `.planning/phases/11-logo-favicon-refresh/11-PATTERNS.md` (371 lines, full file — format exemplar)

**Filesystem facts verified:**
- `socialLinks` has **two** consumers today (`src/components/Footer.astro:3`, `src/components/Contact.astro:3`); after Phase 12, Contact remains the sole consumer. The `src/data/social.ts` export stays intact.
- `footer.copyright` + `footer.built_with` keys are present at lines 96–99 of both `src/i18n/en.json` and `src/i18n/ru.json` — bilingual parity already in place, no JSON edits needed.
- Design tokens `--text-muted` (line 95) and `--border` (line 100) live in `src/styles/design-tokens.css`; corresponding Tailwind utilities `text-text-muted` and `border-border` resolve via the `@theme` bridge in `src/styles/global.css` (existing usage confirmed across multiple components).
- `BaseLayout.astro:72` calls `<Footer locale={locale} />` — props contract must remain `{ locale: Locale }`.

**Pattern extraction date:** 2026-05-01
