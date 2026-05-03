// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkReadingTime } from './remark-reading-time.mjs';
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
    remarkPlugins: [remarkReadingTime],
    // Shiki config — github-dark base + transformers for `// [!code highlight]` and
    // `// [!code ++]` / `// [!code --]`. MDX inherits via @astrojs/mdx's default
    // `extendMarkdownConfig: true`. Deep Signal CSS overrides land in Plan 02-04.
    // Language-badge rehype plugin arrives in Plan 02-03.
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
  integrations: [mdx(), sitemap(), icon()],
});
