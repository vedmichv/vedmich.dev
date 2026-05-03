// Wraps every Shiki-emitted <pre> in a <figure class="code-block"> and prepends
// a <span class="code-lang-badge"> reading the language from the `data-language`
// attribute. Build-time, zero runtime JS. CSS in `src/styles/global.css`
// (Plan 02-04) styles the figure + badge; CodeCopyEnhancer (Plan 02-05) targets
// `.code-block > pre` for copy affordance.
//
// Marker class detection: Shiki's own renderer emits `class="shiki"`, but Astro's
// built-in Shiki rehype plugin wraps it under `class="astro-code"` (Astro-specific
// marker). We accept EITHER class so the plugin is correct for both direct-Shiki
// use and Astro pipelines.
//
// Astro v5 hast property flavor: Astro's internal Shiki rehype plugin emits hast
// with raw HTML-attribute keys (`class` as string, `tabindex`, `style`) rather
// than the hast-standard camelCase (`className` as array, `tabIndex`). We
// therefore read BOTH `class` (string, space-separated) and `className` (array)
// to survive either flavor. Same for `data-language` / `dataLanguage`.
//
// Astro v5 pipeline order: user rehype plugins run AFTER Astro's internal Shiki
// rehype plugin (verified empirically — tree shows pre.class="astro-code
// github-dark has-highlighted ..." at the time this visitor runs). The earlier
// plan notes saying we run BEFORE Shiki are incorrect for Astro 5.18.
//
// Data-language source: Astro's internal Shiki rehype plugin itself populates
// `data-language="yaml"` on <pre> from the fence lang (not the code's className).
// `remark-stash-code-lang.mjs` is a belt-and-suspenders fallback for pipelines
// where Astro's internal behavior ever changes.
//
// MDX inherits markdown.rehypePlugins via @astrojs/mdx default
// `extendMarkdownConfig: true` - no separate registration on the mdx() integration.

import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

const SHIKI_MARKER_CLASSES = new Set(['shiki', 'astro-code']);

/** Extract the list of CSS class names from either hast flavor. */
function getClassList(properties) {
  if (!properties) return [];
  if (Array.isArray(properties.className)) return properties.className;
  if (typeof properties.class === 'string') return properties.class.split(/\s+/).filter(Boolean);
  return [];
}

/** Extract the `data-language` value from either hast flavor. */
function getDataLanguage(properties) {
  if (!properties) return undefined;
  if (typeof properties['data-language'] === 'string') return properties['data-language'];
  if (typeof properties.dataLanguage === 'string') return properties.dataLanguage;
  return undefined;
}

export function rehypeCodeBadge() {
  return function transform(tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;

      // Only wrap Shiki-rendered <pre>, not user-authored raw <pre>.
      // Accept Shiki's own `shiki` class OR Astro's `astro-code` wrapper class.
      const classes = getClassList(node.properties);
      if (!classes.some((c) => SHIKI_MARKER_CLASSES.has(c))) return;

      // Idempotency: if parent is already our <figure class="code-block">, skip.
      if (
        parent.type === 'element' &&
        parent.tagName === 'figure' &&
        getClassList(parent.properties).includes('code-block')
      ) {
        return;
      }

      // Read language from either `data-language` or `dataLanguage` (hast flavors).
      // Fall back to 'text' if absent (bare ``` fence, or data attribute stripped).
      const lang = getDataLanguage(node.properties) || 'text';

      const badge = h(
        'span',
        { className: ['code-lang-badge'], 'aria-hidden': 'true' },
        lang,
      );
      const figure = h('figure', { className: ['code-block'] }, [badge, node]);

      parent.children[index] = figure;
    });
  };
}
