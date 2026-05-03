// Wraps every <pre class="shiki"> emitted by Shiki in a <figure class="code-block">
// and prepends a <span class="code-lang-badge"> reading the language from
// the `data-language` attribute stashed by `remark-stash-code-lang.mjs`.
// Build-time, zero runtime JS. CSS in `src/styles/global.css` (Plan 02-04) styles
// the figure + badge; CodeCopyEnhancer (Plan 02-05) targets `.code-block > pre`
// for copy affordance.
//
// Pipeline order (per Astro docs): remark plugins -> remark->rehype conversion ->
// Shiki highlights <pre><code> -> shikiConfig.transformers run per block ->
// user rehype plugins (this one). At this point <pre> has class "shiki ...
// has-highlighted has-diff" and data-language="yaml" (from remark-stash).
//
// MDX inherits markdown.rehypePlugins via @astrojs/mdx default
// `extendMarkdownConfig: true` - no separate registration on the mdx() integration.

import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

export function rehypeCodeBadge() {
  return function transform(tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.tagName !== 'pre') return;

      // Only wrap Shiki's <pre>, not user-authored raw <pre>.
      const classes = Array.isArray(node.properties?.className)
        ? node.properties.className
        : [];
      if (!classes.includes('shiki')) return;

      // Idempotency: if parent is already our <figure class="code-block">, skip.
      if (
        parent.type === 'element' &&
        parent.tagName === 'figure' &&
        Array.isArray(parent.properties?.className) &&
        parent.properties.className.includes('code-block')
      ) {
        return;
      }

      // Read stashed language (remark-stash-code-lang puts it on node.properties).
      // Fall back to 'text' if absent (bare ``` fence, or stash plugin not registered).
      const lang =
        (typeof node.properties?.['data-language'] === 'string' &&
          node.properties['data-language']) ||
        'text';

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
