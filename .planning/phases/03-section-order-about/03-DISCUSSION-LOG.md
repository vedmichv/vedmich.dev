# Phase 3: Section order + About — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 03-section-order-about
**Areas discussed:** Bio accent, Skill pills style, Cert block fate, Header nav order, Shim utilities, Mobile layout, Bilingual bio_accent, Spacing

---

## Bio accent

| Option | Description | Selected |
|--------|-------------|----------|
| 3-key split (Recommended) | `about.bio_before` / `about.bio_accent` / `about.bio_after`. Semantic, translator-friendly, no HTML in JSON. | ✓ |
| Single key + set:html | Store HTML span inside bio value; render via `set:html`. | |
| Marker + split in template | Use pipe markers `|...|` inside bio string and split in Astro. | |

**User's choice:** 3-key split
**Notes:** Matches the project pattern of JSON translations + typed `t(locale)` helper. Avoids HTML inside i18n.

---

## Skill pills style

| Option | Description | Selected |
|--------|-------------|----------|
| Match reference exactly (Recommended) | `rounded-full`, 13px, `px-3.5 py-1.5`, no hover effect. | ✓ |
| Reference + hover | Reference dimensions + teal hover border for interactive feedback. | |
| Keep current rounded-lg | Leave current pill style; reorder only. | |

**User's choice:** Match reference exactly
**Notes:** Strict parity with `app.jsx:116-123` Pill primitive. Hover intentionally removed because reference has none.

---

## Cert block fate

| Option | Description | Selected |
|--------|-------------|----------|
| Remove everything (Recommended) | Drop cert cards, CNCF callout, `certs_title` i18n key, `certifications` import. | ✓ |
| Remove cards, keep callout | Drop duplicate cards but keep "CNCF Kubernaut = all 5 certs" explainer. | |
| Keep as-is | Leave current About. | |

**User's choice:** Remove everything
**Notes:** "Все как на референсе там нет повтора сертификатов значит убираем - в этом нет смысла!"

---

## Header nav order

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror sections (Recommended) | `about → podcasts → book → speaking → presentations → blog → contact`. | ✓ |
| Leave as-is | Keep current `about → podcasts → speaking → book`. | |

**User's choice:** Mirror sections
**Notes:** `navItems` array drives both desktop and mobile menu, so a single edit covers both surfaces.

---

## Shim utilities (text-accent / text-warm*)

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with canonical tokens | Use `text-brand-primary`, `text-text-secondary`, `text-text-primary`, `bg-surface`. | ✓ |
| Keep shims | Leave `text-accent`, `bg-warm/5`, `border-warm/20`. | |

**User's choice:** Replace (implied by "максимум приблизиться к референсу")
**Notes:** Warm callout disappears with the cert block, so `*-warm/*` utilities naturally disappear. Remaining About markup uses canonical tokens throughout.

---

## Mobile layout (stacked vs grid)

| Option | Description | Selected |
|--------|-------------|----------|
| Current pattern (md breakpoint) | Stacked below 768px, `md:grid-cols-[1.4fr_1fr]` above. | ✓ |
| Single column on all viewports | Always stacked. | |

**User's choice:** Current pattern with reference ratio
**Notes:** Reference doesn't specify a breakpoint; stacked on mobile is natural. Grid ratio updated from `md:grid-cols-2` to `md:grid-cols-[1.4fr_1fr]` to match reference.

---

## Bilingual bio_accent

| Option | Description | Selected |
|--------|-------------|----------|
| Keep English in both locales | `«Cracking the Kubernetes Interview»` in EN + RU. | ✓ |
| Translate to RU | `«Как пройти собес по Kubernetes»` or similar. | |
| Leave English, no guillemets | `"Cracking the Kubernetes Interview"` without `«»`. | |

**User's choice:** Keep English in both (not translated — book is English-only)
**Notes:** "название книги - ее нету на русском поэтому и не переводим". Guillemets kept for visual parity with the RU punctuation convention.

---

## Spacing between sections

| Option | Description | Selected |
|--------|-------------|----------|
| Match reference (80px, gap-10) | `py-20`, `gap-10`, overline `mb-3`. | ✓ |
| Keep current (`py-20 sm:py-28`, `gap-12`) | Leave existing spacing. | |

**User's choice:** Match reference (implied by "максимум приблизиться к референсу")
**Notes:** Drop the `sm:py-28` bump; reduce column gap from `gap-12` (48px) to `gap-10` (40px).

---

## Claude's Discretion

- Keep `animate-on-scroll` class on columns (site-wide consistency, reference has no animation).
- Arbitrary-value Tailwind utilities (`text-[13px]`, `text-[11px]`) used only where no stock utility fits within ±1px.
- Natural sentence-structure translation of `about.bio_before` / `about.bio_after` in RU around the untranslated book title.

## Deferred Ideas

- **Projects section** — new capability to showcase GitHub projects / OSS. Needs its own phase: data source, card format, placement.
- **Expertise overline copy variation** — revisit if richer per-locale phrasing wanted later.
- **Pill hover interactions** — skipped to stay strict with reference.
- **Section transition animations** — reference has none; current scroll-fade kept for consistency.
