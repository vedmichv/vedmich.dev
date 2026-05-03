// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
import { remarkStashCodeLang } from './remark-stash-code-lang.mjs';
import { rehypeCodeBadge } from './rehype-code-badge.mjs';
import {
  transformerNotationHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://vedmich.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    // remarkStashCodeLang propagates fence `lang` onto <pre data-language="...">
    // so rehypeCodeBadge can read it after Shiki strips the language-* class.
    remarkPlugins: [remarkReadingTime, remarkStashCodeLang],
    // rehypeCodeBadge wraps every `<pre class="shiki">` in `<figure class="code-block">`
    // and prepends `<span class="code-lang-badge">LANG</span>`. Build-time, zero JS.
    // Deep Signal CSS for the badge + figure lands in Plan 02-04.
    rehypePlugins: [rehypeCodeBadge],
    // Shiki config — github-dark base + transformers for `// [!code highlight]` and
    // `// [!code ++]` / `// [!code --]`. MDX inherits via @astrojs/mdx's default
    // `extendMarkdownConfig: true`. Deep Signal CSS overrides land in Plan 02-04.
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      transformers: [
        transformerNotationHighlight(),
        transformerNotationDiff(),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // icon() uses default auto-tree-shaking; no `include` needed unless dynamic names appear.
  integrations: [
    mdx(),
    // Exclude draft content from sitemap (e.g. Phase 2 `__fixture-*` posts).
    // Astro builds draft pages into `dist/` by default; homepage/BlogPreview
    // filter via `.filter(p => !p.data.draft)`, but @astrojs/sitemap does not
    // know about that flag and would index the URL otherwise. Keep SEO clean.
    sitemap({
      filter: (page) => !/\/blog\/__/.test(page),
    }),
    icon(),
  ],
});
