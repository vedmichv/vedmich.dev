# Deep Signal — Apply Plan

Step-by-step plan for the next session to migrate `vedmich.dev` from the current cyan/Electric-Horizon palette to the final **Deep Signal** design system (teal #14B8A6 + amber #F59E0B).

**Branch:** `deep-signal-design-system` (already created)
**Origin:** `vedmichv/vedmich.dev` (GitHub)
**Target:** `https://vedmich.dev`

---

## Context

- Brand system lives in the vault: `40-Content/45-Personal-Brand/45.20-Brand-Kit/DESIGN.md`
- Design handoff bundle (from claude.ai/design): `.design-handoff/deep-signal-design-system/`
- Logo hero (final, 2026-04-19): `vv-v2-gradient` — teal gradient rounded square + negative-space VV cutout
- Current site palette: cyan #06B6D4 (Palette A) — must be replaced
- Current fonts: Google Fonts CDN (Inter + JetBrains Mono) — must self-host
- **Space Grotesk is missing** from the live site — must be added for headlines/logo

## What is already prepared

```
vedmich.dev/
├── .design-handoff/
│   └── deep-signal-design-system/       # Full bundle from claude.ai/design
│       ├── README.md                    # Handoff instructions
│       ├── chats/chat1.md               # Conversation transcript (READ THIS FIRST)
│       └── project/
│           ├── colors_and_type.css      # Canonical token source
│           ├── reference/DESIGN.md      # Full design spec
│           ├── assets/                  # Logos (SVG + PNG)
│           ├── fonts/                   # WOFF2 files (9 files, latin subset)
│           ├── preview/                 # HTML previews of every token category
│           └── ui_kits/vedmich-dev/     # Generated UI kit (app.jsx + index.html)
├── public/fonts/                         # 9 WOFF2 files (copied, ready)
└── src/styles/design-tokens.css          # Font @font-face declarations (created)
```

## Step-by-step tasks

### Phase 1 — Read context (NO code yet)
1. Read `.design-handoff/deep-signal-design-system/README.md` (handoff instructions)
2. Read `.design-handoff/deep-signal-design-system/chats/chat1.md` (full user intent)
3. Read `.design-handoff/deep-signal-design-system/project/reference/DESIGN.md` (design spec)
4. Read `.design-handoff/deep-signal-design-system/project/colors_and_type.css` (token source of truth)
5. Read `.design-handoff/deep-signal-design-system/project/ui_kits/vedmich-dev/app.jsx` (generated UI kit)
6. Read current state:
   - `src/styles/global.css` (current @theme tokens)
   - `src/layouts/BaseLayout.astro` (Google Fonts link + head setup)
   - `src/components/Header.astro`, `Footer.astro`, and 2-3 page files to understand structure
7. Grep for hardcoded hex colors: `#06B6D4`, `#22D3EE`, `#F59E0B`, `#FBBF24` — note all occurrences

### Phase 2 — Token migration
8. Extend `src/styles/design-tokens.css` with the full `:root` block from `colors_and_type.css` (brand, bg, text, borders, status, topics, gradients, type scale, spacing, radius, shadows, motion, code syntax tokens)
9. Add the `.light, [data-theme="light"]` override block from the same source
10. Update `src/styles/global.css`:
    - Import `./design-tokens.css` at the top
    - Replace the `@theme` block mapping Tailwind utility names to the new CSS variables (so `bg-surface`, `text-primary`, `border` all come from Deep Signal tokens)
    - Remove hardcoded colors — keep all color lookups going through `var(--*)`
11. Update `src/layouts/BaseLayout.astro`:
    - Remove `<link rel="preconnect" href="https://fonts.googleapis.com">` block (lines ~38-40)
    - Fonts now load from self-hosted CSS (no action needed in HTML head)

### Phase 3 — Component sweep
12. Replace the Header logo: use `vv-logo-hero.png` or SVG version from `.design-handoff/.../assets/`
13. Update favicon: `public/favicon.svg` currently uses cyan single-V → replace with teal VV rounded-square from `.design-handoff/.../assets/vv-favicon.svg`
14. Refactor each section component (Hero, About, Podcasts, Speaking, Book, Presentations, Contact) to use new token utility classes (`text-brand-primary`, `bg-surface`, etc.)
15. Apply `--grad-mesh-deep` as the hero background (see `.design-handoff/.../preview/brand-terminal-hero.html` for the exact reference)

### Phase 4 — Verification
16. Run `npm run dev` and walk through every section. Take mental screenshots of before/after
17. Check both /en/ and /ru/ routes
18. Test `prefers-color-scheme: light` (add temporary toggle or use DevTools)
19. Run `npm run build` and verify zero errors
20. Check that the 9 WOFF2 files ship correctly (they're in `public/fonts/` → copied to `dist/fonts/`)
21. Lighthouse audit: First Contentful Paint should improve (no external font CDN)

### Phase 5 — Documentation + commit
22. Update `CLAUDE.md` in repo root — mark Deep Signal as live brand, update font sources
23. Update vault tracker: `40-Content/45-Personal-Brand/vedmich.dev Website.md` → mark Tailwind migration as Done
24. Update vault DESIGN.md: flip "vedmich.dev Tailwind CSS 4 theme tokens" from `Pending` to `Done`
25. One atomic commit per phase (tokens, components, hero, docs) — keep history readable
26. PR from `deep-signal-design-system` → `main` with before/after screenshots

---

## Key guardrails

- **Never use `#06B6D4`** (old cyan) — find-and-replace before commit
- **Never use `#7C3AED` or `#10B981`** (DKT brand collision)
- **Never use `#FF9900` or `#232F3E`** (AWS employer brand collision)
- Dark mode is default; light mode is for LinkedIn embeds/OG images — don't build a user-facing toggle in Phase 3 (can come later)
- Pure black `#000` and pure white `#FFF` body text are banned — use `#0F172A` / `#E2E8F0`

## Deliverables

- [ ] `src/styles/design-tokens.css` — complete, imports fonts + all tokens
- [ ] `src/styles/global.css` — Tailwind `@theme` block refactored
- [ ] `src/layouts/BaseLayout.astro` — Google Fonts removed
- [ ] `public/favicon.svg` — teal VV rounded-square
- [ ] All hardcoded cyan hex values gone
- [ ] CLAUDE.md updated
- [ ] PR opened from `deep-signal-design-system` → `main`

## Ready-to-use prompt for next session

> Read `.design-handoff/APPLY-PLAN.md` and follow Phases 1–5 in order. Start by reading the handoff chat transcript and design spec before writing any code. Use `superpowers:executing-plans` skill. Create a TaskList from the 26 numbered steps.
