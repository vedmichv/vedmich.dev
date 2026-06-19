// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
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

// Collect the live-URLs of every `draft: true` blog post so the sitemap can
// exclude them. @astrojs/sitemap's `filter` only receives the URL string (no
// frontmatter), so we read the content files at config-eval time and build the
// set of draft URLs to drop. Drafts are still BUILT (reachable by direct link),
// just unlisted: kept out of the sitemap here + out of homepage/index/search by
// the `!data.draft` filters in those components. Promote = flip `draft:false`.
function draftBlogUrls() {
  const urls = new Set();
  for (const locale of ['en', 'ru']) {
    let files = [];
    try {
      files = readdirSync(new URL(`./src/content/blog/${locale}/`, import.meta.url));
    } catch {
      continue;
    }
    for (const file of files) {
      if (!/\.mdx?$/.test(file)) continue;
      const raw = readFileSync(
        new URL(`./src/content/blog/${locale}/${file}`, import.meta.url),
        'utf8',
      );
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fm && /^draft:\s*true\s*$/m.test(fm[1])) {
        const slug = file.replace(/\.mdx?$/, '');
        urls.add(`https://vedmich.dev/${locale}/blog/${slug}/`);
      }
    }
  }
  return urls;
}
const DRAFT_URLS = draftBlogUrls();

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
    // Exclude draft content from sitemap: both Phase 2 `__fixture-*` posts AND
    // real `draft: true` blog posts (unlisted-deploy model). Astro builds draft
    // pages into `dist/` by default so they're reachable by direct link;
    // homepage/BlogPreview/index/search filter via `!data.draft`, but
    // @astrojs/sitemap only sees the URL, so we drop draft URLs explicitly
    // (DRAFT_URLS, computed above) plus the `__` fixtures. Keep SEO clean.
    sitemap({
      filter: (page) => !/\/blog\/__/.test(page) && !DRAFT_URLS.has(page),
    }),
    icon(),
  ],
});
