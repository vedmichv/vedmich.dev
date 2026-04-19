# Deep Signal — Viktor Vedmich Design System

**Public brand:** Viktor Vedmich · **System codename:** Deep Signal

A personal brand design system for an **AI Engineer + AWS Senior Solutions Architect + Kubernetes Expert**. Dark-by-default, teal-and-amber, code-forward. Think **Fireship's accessibility + Vercel's visual polish**.

## Positioning (priority order)

1. **AI Engineer** — "I live in an AI-first world and show you how"
2. **AWS Senior Solutions Architect** — enterprise-scale
3. **Kubernetes Expert** — CNCF Kubernaut, book author, 5 certs (CKA, CKS, CKAD, KCNA, KCSA)

## Sources

| Source | Path / URL | Notes |
|---|---|---|
| Design spec | `reference/DESIGN.md` | Full brand doc (419 lines) — the source of truth |
| Hero logo | `assets/vv-logo-hero.png` | Teal-gradient rounded square, VV negative-space cutout |
| Codebase | `vedmichv/vedmich.dev` (GitHub) | Astro 5 + Tailwind 4 portfolio |
| Slidev decks | `s.vedmich.dev` / `vedmichv/slidev` | Presentation system |
| Podcasts | DKT (91+ eps), AWS RU Podcast (65+ eps) | Separate DKT violet brand — DO NOT MIX |

> The live portfolio pulls from `src/styles/global.css` (Tailwind `@theme`). This system captures both what's live AND the target state from DESIGN.md.

---

## Index

| File | What's in it |
|---|---|
| `README.md` | This file — context, content rules, visual foundations, iconography |
| `colors_and_type.css` | CSS custom properties for color + type (dark default, light via `.light`) |
| `SKILL.md` | Agent-skill manifest — makes this system portable to Claude Code |
| `assets/` | Logos, favicons, variant monograms |
| `reference/DESIGN.md` | Full brand specification |
| `preview/` | Design-system cards (registered for the Design System tab) |
| `ui_kits/vedmich-dev/` | Portfolio site UI kit — homepage click-thru with 8 sections |
| `ui_kits/slidev/` | Presentation slide kit — 6 slide templates (title, section, content, code, quote, thanks) |

---

## CONTENT FUNDAMENTALS

**Voice: Friendly Practitioner.** Warm, accessible, complex things in simple language, with humor over formality. The reader is treated like a smart peer — not a student, not a customer. Fireship-style punch: concrete, compressed, no fluff.

### Casing
- **Sentence case** for everything: headlines, section titles, buttons. No Title Case Marketing Voice.
- Proper nouns keep their casing: Kubernetes, AWS, Karpenter, re:Invent, cdk8s.
- ALL CAPS only for `overline` labels and topic badges (`K8S`, `TUTORIAL`, `OPINION`).

### Pronouns + voice
- **"I"** is fine for first-person (bio, podcast intros). This is a personal brand.
- **"you"** for the reader (tutorials, blog posts).
- **"we"** sparingly — only when genuinely referring to a community (e.g. DKT).
- Active voice, short sentences. Present tense over future.

### Concrete examples from the live site

- Hero: **"Hi, I'm Viktor Vedmich"** — greeting, not a headline. Low-friction entry.
- Role: **"Senior Solutions Architect @ AWS"** — uses `@` as shorthand. Unpretentious.
- Tagline: **"Distributed Systems · Kubernetes · Cloud Architecture"** — middle-dot separator, not commas. Reads like a command-line pipe.
- DKT positioning: **"Technical deep-dives into DevOps, Kubernetes, and infrastructure"** — plainspoken, zero jargon-on-jargon.
- Book pitch: **"A comprehensive guide covering... to help you ace your next interview"** — concrete benefit, conversational ("ace").
- Stats are bragging rights but stated dryly: **"91+ episodes · 10K+ subscribers"**.

### Emoji

**Sparingly.** Never decorative. The live site uses zero emoji in UI copy. Emoji appear only in:
- Social platform labels where they're the platform convention (not in our system).
- Book/podcast list bullets in Obsidian-origin content — stripped before publishing.
- **Preferred substitute:** teal monogram badges, topic badges, JetBrains Mono inline code.

### Tone switches

- **EN-first** for tech content — broad reach.
- **RU** for personal/podcast (AWS на русском, DKT Russian segment) — same voice, same casing rules, same sparingness with emoji.
- **Never** mix languages in one sentence except for proper nouns and code.

### Anti-patterns in copy

- No "Unlock the power of…" / "Transform your…" marketing LinkedIn-speak.
- No ChatGPT em-dash-ladden lists of adjectives.
- No "We believe" mission-statement framing.
- Don't say "leverage". Just use "use".

---

## VISUAL FOUNDATIONS

### The governing idea

A code block is the hero element. The whole system is designed so a `<pre>` with teal function names and amber keywords looks at home — everything else composes around that.

### Color

- **Primary:** teal `#14B8A6` (dark) / `#0F766E` (light). Unique in the AI/Cloud space — blue is oversaturated, green is taken by DKT.
- **Accent:** amber `#F59E0B` (dark) / `#B45309` (light). Warmth against the cool teal.
- **Dark base:** `#0F172A` — never pure black. Pure black causes OLED glare against the teal glow.
- **Text:** `#E2E8F0` on dark, `#0F172A` on light — never pure white, never pure black.
- **One topic color max** per slide/card (`K8S` blue, `ARCHITECTURE` indigo, `OPINION` rose, `TUTORIAL` green) — only in badges, never in buttons or body text.

### Typography

- **Space Grotesk 500–700** — all headlines. Geometric, slightly quirky, tech-forward. Tight letter-spacing (`-0.01em`) on body headings, tighter (`-0.02em`) on display.
- **Inter 400–500** — all body, labels.
- **JetBrains Mono 400** — code, inline `code`, terminal-styled hero text. Brand DNA.
- **Scale** is concrete, not fluid: 48 / 36 / 28 / 22 / 18 / 16 / 14 / 12. Body starts at 18px — this is a *reading* brand, not a dense-dashboard one.

### Spacing

4px base: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64. Cards pad at 24 (`--space-6`); section gaps at 48–64.

### Backgrounds

- **Default:** flat `#0F172A`. No texture, no grain.
- **Hero / section headers:** `linear-gradient(135deg, #14B8A6, #0D9488)` — the brand gradient. Use for < 30% of viewport; never for body text backing.
- **Carousel / slide backdrops:** subtle `linear-gradient(160deg, #0F172A, #134E4A)` — dark-navy into deep-teal. Quiet, not flashy.
- **No stock photography.** No hand-drawn illustrations. Imagery (when present) is: the VV monogram, code screenshots, architecture diagrams, conference photos.
- **Architecture diagrams** have their own mini-system: `#1E293B` box fill, `#334155` border, teal glow on the highlighted box, JetBrains Mono 12px arrow labels.

### Animation

- **Fades up, not bounces.** `fadeInUp` on scroll-reveal: 24px translate, 600ms, `ease-out`.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out, the quietly confident curve.
- **Durations:** 150ms (hover), 250ms (cards), 400ms (large elements). Never > 500ms.
- **Typing cursor** (terminal aesthetic): 1s step-end blink, teal.
- No spring physics. No spin/pop/hover-jiggle. This brand is calm.

### Hover

- **Cards:** `box-shadow: 0 0 20px rgba(20,184,166,0.15)` (teal glow) + border color shift to `--brand-primary`. 250ms transition.
- **Buttons:** color shifts by one step (`#14B8A6` → `#2DD4BF`). No scale transform.
- **Links:** color → `--brand-primary-hover`. No underline added.

### Press / active

- Subtle `filter: brightness(0.92)` or shift back toward base. No scale-down.

### Borders

- **Default:** `1px solid #334155`. Everywhere — cards, inputs, dividers.
- **Strong:** `#475569` for separators that need to read louder.
- **Focus:** 2px teal outline with 2px offset, not a filled background.

### Shadows

Two-tier: standard elevation (subtle, cool) + glow (brand-colored, for interactive affordance). Dark mode shadows are deeper (30–50% black); light mode are softer (8–12% black). The **`--shadow-glow`** is what tells you something is hovered or focused — NOT a scale transform.

### Protection gradients vs capsules

- **Capsules** (pills with border) for status, filters, tags — `radius-full`, `1px solid`, translucent bg.
- **Protection gradients** (dark fade over imagery) only on conference/speaker photos where text overlays.

### Layout

- **Max content width:** 768px prose, 1280px full-width.
- **Grid:** 12-col implicit, but most layouts are 1, 2, or 3 columns flex.
- **Alignment:** left-aligned text always. Center-alignment only for hero greetings and empty states.
- **Fixed elements:** sticky header with backdrop-blur on scroll. No sticky footer, no floating CTAs.

### Transparency + blur

- Sticky header: `background: rgba(15,23,42,0.8); backdrop-filter: blur(12px);`
- Modal overlays: `rgba(15,23,42,0.6)` scrim.
- Soft brand backgrounds: `rgba(20,184,166,0.1)` — for highlighted boxes, badges.
- Never blur over hero imagery (there isn't any). Blur is a UI mechanic, not a decorative effect.

### Imagery mood

- Cool, saturated teal highlights on dark.
- Architecture diagrams are the dominant "imagery." Photography is sparse and mostly conference/speaker shots — unfiltered, un-graded.
- No grain, no film emulation, no duotone photos.

### Corner radii

4 / 8 / 12 / 16 / full. Most things are 8 (buttons, inputs, cards) or 12 (large cards). Pills are `full`. Hard corners (0) appear nowhere.

### Cards

- `background: #1E293B` (surface), `1px solid #334155`, `radius: 12`, `padding: 24`.
- Default: no shadow. Hover: teal glow + teal border.
- Keep a clear hierarchy: overline → h3 → body → optional footer row with meta/CTA.

---

## ICONOGRAPHY

### System in use

- **Lucide** (`lucide.dev`) is the system match — 24px stroke icons, `stroke-width: 1.5` or `2`, `currentColor`. Match the "clean line, geometric" feel of Space Grotesk.
- The live codebase stores social icons inline as SVG (LinkedIn, GitHub, YouTube, X, Telegram). It does NOT bundle an icon font.
- **Substitution flagged:** The codebase's 5 social SVGs weren't in a copyable bundle — we link Lucide via CDN for the UI kits and note this below. **Ask:** if you have preferred SVGs for the socials, drop them into `assets/icons/` and we'll swap.

### Usage rules

- **Stroke:** 2px at 24px size, 1.5px at 32px+. Never filled unless it's a status badge.
- **Color:** `currentColor` always. Let text color drive icon color.
- **Sizing with type:** icon height ≈ cap height of adjacent text. For 18px body = 20px icon; for 14px caption = 16px icon.
- **Never** mix Lucide with Heroicons or Material — stroke weights clash.

### Emoji

**No.** This brand uses zero emoji in UI. Where other brands would use 🚀 ✅ 💡 — we use:
- A teal filled circle for status (✓ state).
- A topic badge (`KUBERNETES`, `TUTORIAL`) in uppercase overline.
- An amber dot for warmth / "hot take" flags.

### Unicode characters

- **Middle dot `·`** for inline separators: "Distributed Systems · Kubernetes · Cloud".
- **Em dash `—`** for asides and attribution: "— Viktor".
- **Ellipsis `…`** as the character, not three periods.
- **Arrow `→`** for CTAs ("Read more →") — simpler than an SVG arrow icon.

### Logo usage

- **Hero variant** (`assets/vv-logo-hero.png`) — teal-gradient rounded square, VV negative-space cutout in `#0F172A`. Use for avatars, OG images, app icons, slide title cards.
- **Primary flat** (`assets/vv-logo-primary.svg`) — fallback where gradient renders badly (print, small favicon).
- **Inverse** (`assets/vv-logo-inverse.svg`) — dark circle, teal VV. For very light backgrounds.
- **Favicon** (`assets/vv-favicon.svg`) — rounded-square, mirrors the hero shape at 32px.
- **Never** place VV on a teal background (no contrast). Never rotate. Never use on top of photos without a solid backing shape.
