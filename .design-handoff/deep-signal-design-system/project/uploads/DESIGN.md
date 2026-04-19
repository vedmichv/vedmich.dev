---
aliases:
  - Vedmich Brand Design System
date_created: 2026-03-31, 11:30:00
date_modified: 2026-04-19, 11:15:00
tags:
  - personal-brand
  - design-system
project: vedmich-brand
status: active
---

# Viktor Vedmich — Personal Brand Design System

> Single source of truth for visual identity across all platforms.

## Brand Foundation

### Positioning
**AI Engineer + AWS Solutions Architect + Kubernetes Expert**

Priority order:
1. AI Engineer — "I live in an AI-first world and show you how"
2. AWS Solutions Architect — enterprise-scale solutions
3. Kubernetes Expert — deep K8s credibility (book, CNCF Kubernaut, 5 certs)

### Personality
- **Voice**: Friendly Practitioner — warm, accessible, complex things in simple language with humor
- **Visual**: Tech Visionary — sleek, modern, minimal + wow-effect
- **Combined**: Fireship's accessibility + Vercel's visual polish

### Audience
Broad tech: junior devs to CTOs. EN-first, RU secondary.

### Goal
Recognition -> followers -> conference invitations -> thought leadership -> interview opportunities

### Brand Name
"Deep Signal" — depth of expertise (deep) + clarity of communication (signal)

**Usage:** "Deep Signal" is the design system codename. The public-facing brand identity is **"Viktor Vedmich"**. "Deep Signal" may appear as a tagline or series name but not as the primary brand identifier.

---

## Color System

### Design Philosophy
Teal sits at the intersection of blue (trust, enterprise) and green (growth, innovation) — claiming unique territory in the AI/Cloud/K8s space where blue is oversaturated and green is taken by DKT.

Amber accent adds warmth and friendliness, creating complementary contrast (cool primary + warm accent).

### Palette: "Deep Signal"

#### Semantic Color Tokens

| Token | Dark Mode | Light Mode | Purpose |
|-------|-----------|------------|---------|
| `--brand-primary` | #14B8A6 | #0F766E | Primary actions, links, highlights |
| `--brand-primary-hover` | #2DD4BF | #0F766E | Hover/focus states |
| `--brand-primary-soft` | #134E4A | #CCFBF1 | Subtle backgrounds |
| `--brand-accent` | #F59E0B | #B45309 | CTAs, important highlights, warmth |
| `--brand-accent-hover` | #FBBF24 | #92400E | Hover/focus states |
| `--brand-accent-soft` | #451A03 | #FEF3C7 | Accent backgrounds |
| `--bg-base` | #0F172A | #F8FAFC | Page background |
| `--bg-surface` | #1E293B | #FFFFFF | Cards, components |
| `--bg-elevated` | #334155 | #F1F5F9 | Elevated surfaces, dropdowns |
| `--bg-code` | #0D1117 | #F1F5F9 | Code block background |
| `--text-primary` | #E2E8F0 | #0F172A | Main text |
| `--text-secondary` | #94A3B8 | #475569 | Secondary text |
| `--text-muted` | #78909C | #64748B | Captions, metadata |
| `--text-on-primary` | #0F172A | #FFFFFF | Text on primary-colored bg |
| `--text-on-accent` | #0F172A | #FFFFFF | Text on accent-colored bg |
| `--border` | #334155 | #E2E8F0 | Borders, dividers |
| `--border-strong` | #475569 | #CBD5E1 | Stronger borders |

#### Status Colors

| Token | Value | Purpose |
|-------|-------|---------|
| `--success` | #10B981 | Success states |
| `--warning` | #F59E0B | Warnings (reuses accent) |
| `--error` | #EF4444 | Error states |
| `--info` | #3B82F6 | Informational |

#### Gradient

| Name | Value | Use |
|------|-------|-----|
| Brand gradient | `linear-gradient(135deg, #14B8A6, #0D9488)` | Headers, hero sections |
| Accent gradient | `linear-gradient(135deg, #F59E0B, #D97706)` | CTA buttons, highlights |
| Subtle gradient (dark) | `linear-gradient(160deg, #0F172A, #134E4A)` | Carousel slide backgrounds |
| Subtle gradient (light) | `linear-gradient(160deg, #F0FDFA, #FFFFFF)` | Light mode carousel |

#### Topic Accent Colors

Secondary colors for content variety at scale. Each topic has dark/light variants to ensure WCAG AA compliance in both modes. Topic colors appear ONLY in badges and accent elements — never replace brand teal/amber.

| Topic | Dark Mode | Light Mode | Badge Label |
|-------|-----------|------------|-------------|
| Kubernetes | #3B82F6 (4.85:1) | #2563EB (4.94:1) | K8S |
| Architecture | #818CF8 (5.98:1) | #4338CA (7.55:1) | ARCHITECTURE |
| Opinion/Hot Take | #F43F5E (4.86:1) | #BE123C (6.01:1) | OPINION |
| Tutorial/How-To | #22C55E (7.83:1) | #15803D (4.79:1) | TUTORIAL |

**Usage rules:**
- Max 1 topic color per slide/card alongside brand teal/amber
- Badge pattern: `bg-topic/10 border-topic/20 text-topic` (same as brand badges)
- Never use topic color for buttons, backgrounds, or body text

---

### DKT Differentiation

| Property | DKT Podcast | Vedmich Personal |
|----------|-------------|-----------------|
| Primary | Violet #7C3AED | Teal #14B8A6 |
| Accent | Neon Green #10B981 | Amber #F59E0B |
| Dark base | Warm #111827 | Cool #0F172A |
| Hue angle | Primary 263° + Accent 160° | Primary 175° + Accent 38° |
| Character | "Warm Terminal" | "Deep Signal" |
| Gradient | Violet-to-indigo | Teal-to-dark-teal |

These brands share NO colors in common. Primary hues are 88° apart. Accent hues are 122° apart.

### Contrast Ratios (WCAG 2.1 AA)

| Combination | Ratio | Pass | Verified |
|-------------|-------|------|----------|
| #14B8A6 on #0F172A | 7.17:1 | AAA | 2026-03-31 |
| #F59E0B on #0F172A | 8.31:1 | AAA | 2026-03-31 |
| #E2E8F0 on #0F172A | 14.48:1 | AAA | 2026-03-31 |
| #0F766E on #F8FAFC | 5.23:1 | AA | 2026-03-31 |
| #B45309 on #F8FAFC | 4.80:1 | AA | 2026-03-31 |
| #B45309 on #FFFFFF | 5.02:1 | AA | 2026-03-31 |
| #0F172A on #F8FAFC | 17.06:1 | AAA | 2026-03-31 |
| #78909C on #0F172A | 5.33:1 | AA | 2026-03-31 |
| #6B7F8E on #0D1117 | 4.55:1 | AA | 2026-03-31 |

---

## Typography

### Font Stack: "Tech Authority"

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| Headlines | **Space Grotesk** | 500-700 | system-ui, sans-serif |
| Body | **Inter** | 400-500 | system-ui, sans-serif |
| Code | **JetBrains Mono** | 400 | monospace |
| Labels/Caps | **Inter** | 500-600 | system-ui, sans-serif |

### Stitch MCP Mapping

| Role | Stitch Token |
|------|-------------|
| Headlines | `SPACE_GROTESK` |
| Body | `INTER` |
| Labels | `INTER` |

### Type Scale

| Token | Size | Line Height | Weight | Use |
|-------|------|------------|--------|-----|
| `--text-display` | 48px / 3rem | 1.1 | 700 | Hero headlines |
| `--text-h1` | 36px / 2.25rem | 1.2 | 600 | Page titles |
| `--text-h2` | 28px / 1.75rem | 1.3 | 600 | Section headers |
| `--text-h3` | 22px / 1.375rem | 1.4 | 500 | Subsection headers |
| `--text-h4` | 18px / 1.125rem | 1.4 | 600 | Card titles |
| `--text-body` | 18px / 1.125rem | 1.6 | 400 | Body text |
| `--text-small` | 16px / 1rem | 1.5 | 400 | Secondary text |
| `--text-caption` | 14px / 0.875rem | 1.4 | 400 | Captions, metadata |
| `--text-code` | 16px / 1rem | 1.5 | 400 | Code blocks |
| `--text-overline` | 12px / 0.75rem | 1.4 | 600 | Overline labels, ALL CAPS |

### Social Media Typography

| Context | Headline | Body | Caption |
|---------|---------|------|---------|
| LinkedIn carousel | 28-36px Space Grotesk 700 | 18-22px Inter 400 | 14px Inter 500 |
| Twitter/X image | 24-32px Space Grotesk 700 | 16-18px Inter 400 | 12px Inter 500 |
| YouTube thumbnail | 36-48px Space Grotesk 700 | — | — |
| Blog post | 36px Space Grotesk 600 | 18px Inter 400 | 14px Inter 400 |

---

## Spacing System

Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Component internal padding |
| `--space-3` | 12px | Small gaps |
| `--space-4` | 16px | Standard padding, icon gaps |
| `--space-5` | 20px | Medium padding |
| `--space-6` | 24px | Card padding, section gaps |
| `--space-8` | 32px | Large gaps |
| `--space-10` | 40px | Section margins |
| `--space-12` | 48px | Page-level spacing |
| `--space-16` | 64px | Major section breaks |

---

## Border & Shape

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Small elements, badges, tags |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Large cards, modals |
| `--radius-xl` | 16px | Featured cards, carousels |
| `--radius-full` | 9999px | Avatars, pills, toggle |

**Stitch roundness**: `ROUND_EIGHT` (8px default)

---

## Shadows

### Dark Mode

| Token | Value |
|-------|-------|
| `--shadow-sm` | 0 1px 2px rgba(0,0,0,0.3) |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,0.4) |
| `--shadow-lg` | 0 8px 24px rgba(0,0,0,0.5) |
| `--shadow-glow` | 0 0 20px rgba(20,184,166,0.15) |

### Light Mode

| Token | Value |
|-------|-------|
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.08) |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,0.1) |
| `--shadow-lg` | 0 8px 24px rgba(0,0,0,0.12) |
| `--shadow-glow` | 0 0 20px rgba(13,148,136,0.1) |

---

## Platform Specs

### LinkedIn

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| Carousel slide | 1080x1080px | PDF (multi-page) | 6-10 slides |
| Single image post | 1200x1200px | PNG/JPG | Square |
| Link preview | 1200x628px | PNG/JPG | Landscape |
| Profile banner | 1584x396px | PNG/JPG | Brand gradient bg |

### Twitter/X

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| Image post | 1600x900px | PNG/JPG | 16:9, test on pure-black bg |
| Profile header | 1500x500px | PNG/JPG | 3:1 |
| Profile photo | 400x400px | PNG/JPG | Circle crop |

### YouTube

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| Thumbnail | 1280x720px | PNG/JPG | Bold text, high contrast |
| Channel art | 2560x1440px | PNG/JPG | Safe zone: 1546x423px center |

### vedmich.dev

| Property | Value |
|----------|-------|
| Framework | Astro 5.x + Tailwind CSS 4 |
| Color mode | Dual (dark default, `prefers-color-scheme` toggle) |
| Max content width | 768px (prose), 1280px (full) |
| Font loading | Google Fonts via `@fontsource` or CDN |

---

## Content Templates

### LinkedIn Carousel: "Threaded How-To" (6 slides)

| Slide | Content | Design |
|-------|---------|--------|
| 1 (Hook) | Badge + bold headline + one-line promise | Brand gradient bg, 36px Space Grotesk 700 white |
| 2-5 (Steps) | Step number + header + 2-3 bullets or code | Surface bg (#1E293B), teal step number, 22px headers |
| 6 (CTA) | Follow prompt + key takeaway | Accent gradient bg, amber CTA |

### LinkedIn Carousel: "Opinion + Evidence" (8 slides)

| Slide | Content | Design |
|-------|---------|--------|
| 1 (Claim) | Provocative statement + stat | Brand gradient bg, bold headline |
| 2-7 (Evidence) | One evidence card each (quote, example, data) | Alternating surface/elevated bg |
| 8 (CTA) | Summary + follow CTA | Accent gradient bg |

### Blog Post Header

| Element | Spec |
|---------|------|
| Background | Subtle brand gradient or solid surface |
| Title | Space Grotesk 700, 36px |
| Meta | Inter 400, 14px, muted color |
| Tags | Teal badges, 12px, radius-full |

---

## Brand Elements

### Logo / Wordmark

Primary identifier: **Viktor Vedmich** in Space Grotesk 700.
- Dark mode: white text, teal dot/accent
- Light mode: slate-900 text, teal dot/accent
- Monogram: **VV** in teal rounded-square (for avatar, favicon)

> [!tip] Final logo decision (2026-04-19)
> **Hero variant: `v2-gradient`** — teal-gradient rounded square with negative-space VV cutout in `#0F172A`. File: `assets/variations/vv-v2-gradient.png`.
> Replaces the flat-circle primary for all hero usage (avatar, favicon, OG images, slide decks).
> TODO: vectorize to `assets/vv-logo-hero.svg` before Tailwind rollout on vedmich.dev.

### VV Monogram

| Variant | Shape | Background | Text/Cutout | File | Use |
|---------|-------|-----------|-------------|------|-----|
| **Hero** | Rounded square, gradient | `#14B8A6` → `#0D9488` | `#0F172A` (negative space) | `assets/variations/vv-v2-gradient.png` | Default avatar, social, app icon, OG images |
| Primary-flat | Circle, solid | #14B8A6 | #0F172A | `assets/vv-logo-primary.svg` | Fallback, inline text |
| Inverse | Circle | #0F172A | #14B8A6 | `assets/vv-logo-inverse.svg` | Very light backgrounds |
| Accent | Circle | #F59E0B | #0F172A | `assets/vv-logo-accent.svg` | Special/event only |
| Favicon | Rounded square | #14B8A6 | #0F172A | `assets/vv-favicon.svg` | Browser tab 32x32 (match Hero shape) |

### Tagline Options (pick one)

1. "Deep expertise. Clear signal."
2. "AI, Cloud, Kubernetes — explained."
3. "Building the future, one architecture at a time."

---

## Motion Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--transition-fast` | 150ms ease-out | Hover states, color changes |
| `--transition-normal` | 250ms ease-out | Card interactions, reveals |
| `--transition-slow` | 400ms cubic-bezier(0.16, 1, 0.3, 1) | Page transitions, large elements |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Default easing for all animations |

---

## Architecture Diagram Style

| Element | Dark Mode | Light Mode | Font |
|---------|-----------|------------|------|
| Box bg | #1E293B | #FFFFFF | — |
| Box border | #334155 | #E2E8F0 | — |
| Highlighted box bg | rgba(20,184,166,0.1) | rgba(15,118,110,0.1) | — |
| Highlighted box border | #14B8A6 | #0F766E | — |
| Arrow | #14B8A6 | #0F766E | — |
| Arrow label | #94A3B8 | #475569 | JetBrains Mono 12px |
| Box label | #E2E8F0 | #0F172A | Inter 500 |
| Glow effect | 0 0 20px rgba(20,184,166,0.15) | 0 0 20px rgba(15,118,110,0.1) | — |

---

## Code Block Syntax Highlighting

The code block is the **brand DNA** — the element that makes Deep Signal visually distinct.

| Role | Dark Mode | Light Mode | Examples |
|------|-----------|------------|----------|
| Functions/keys | #14B8A6 (teal) | #0F766E | `createMCPServer`, `name`, `tools` |
| Keywords/strings | #F59E0B (amber) | #B45309 | `const`, `import`, `"tool-gateway"` |
| Comments | #6B7F8E | #94A3B8 | `// MCP server config` |
| Regular text | #E2E8F0 | #0F172A | variables, brackets |
| Code background | #0D1117 | #F1F5F9 | — |
| Terminal dots | #EF4444, #F59E0B, #22C55E | #CBD5E1 (all gray) | — |

---

## Anti-Patterns

| Do NOT | Why |
|--------|-----|
| Use DKT violet #7C3AED | Separate brand |
| Use DKT green #10B981 as accent | Too close to DKT |
| Use AWS orange #FF9900 | Employer brand |
| Use pure black #000000 | Causes glare, use #0F172A |
| Use pure white #FFFFFF text on dark | Causes glare, use #E2E8F0 |
| Mix dark bg with low-contrast teal text | Must pass WCAG AA (4.5:1) |
| Use gradient as primary on small text | Gradients for large areas only |
| Put teal text on amber bg | Poor contrast, clashing |

---

## Implementation Targets

| Platform | Tool | Status |
|----------|------|--------|
| Stitch MCP | Design system + 13 screens (dark+light, code blocks) | Active |
| Canva | Brand Kit "vedmich.dev" (colors, fonts, 6+ designs) | Active |
| pptx-generator | `brands/vedmich/` config (brand.json, config, system, tone) | Done |
| vedmich.dev | Tailwind CSS 4 theme tokens | Pending |
| LinkedIn | Profile banner, carousel templates | In Progress |
| Twitter/X | Profile header, image templates | Pending |

---

## Research Source

Based on competitive analysis of 13 tech thought leader brands (2026-03-30):
[[2026-03-30-Brand-Competitive-Analysis]]

Key finding: Teal is unoccupied as primary color in AI/Cloud/K8s thought leadership.
Amber accent is unique complement not used by any analyzed brand.

---

*This is a living document. Update when brand evolves.*
