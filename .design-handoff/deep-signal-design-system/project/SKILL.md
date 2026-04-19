---
name: viktor-vedmich-design
description: Use this skill to generate well-branded interfaces and assets for Viktor Vedmich (the "Deep Signal" personal brand), either for production or throwaway prototypes, mocks, slides, and social graphics. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files. Key entry points:

- `README.md` — content fundamentals, visual foundations, iconography
- `reference/DESIGN.md` — full brand specification (419 lines)
- `colors_and_type.css` — CSS custom properties, drop-in
- `assets/` — logos, favicons
- `ui_kits/vedmich-dev/` — portfolio site components
- `ui_kits/slidev/` — presentation slide components
- `preview/` — design-system cards (examples of tokens in use)

If creating visual artifacts (slides, mocks, throwaway prototypes, social carousels, podcast art, etc), copy assets out and create static HTML files for the user to view. Link Google Fonts for **Space Grotesk** (headlines), **Inter** (body), **JetBrains Mono** (code).

If working on production code, copy assets and read the rules here to become an expert in designing with this brand. The live codebase is `vedmichv/vedmich.dev` (Astro 5 + Tailwind 4); color tokens live in `src/styles/global.css` `@theme` block.

If the user invokes this skill without any other guidance, ask them what they want to build or design (LinkedIn carousel? conference deck? portfolio section? podcast cover?), ask some clarifying questions about platform and language (EN/RU), then act as an expert designer who outputs HTML artifacts or production code depending on the need.

**Hard rules — DO NOT violate:**
- Never use DKT violet `#7C3AED` or DKT green `#10B981` (separate podcast brand).
- Never use AWS orange `#FF9900` (employer brand).
- Never use pure black `#000` or pure white `#FFF` text.
- Dark mode is default. Light mode is for LinkedIn carousels only.
- Zero decorative emoji.
