import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rehypeCodeBadge } from '../../rehype-code-badge.mjs';

// Minimal hast fixture factory — a root with a single <pre class="shiki"> child.
// Mirrors what Shiki emits on Astro after transformers run:
//   <pre class="shiki github-dark" data-language="yaml"><code>...</code></pre>
function makeShikiTree(opts: {
  language?: string;
  extraPreClasses?: string[];
  preTagName?: 'pre' | 'div';
} = {}) {
  const { language = 'yaml', extraPreClasses = [], preTagName = 'pre' } = opts;
  return {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: preTagName,
        properties: {
          className: ['shiki', 'github-dark', ...extraPreClasses],
          'data-language': language,
        },
        children: [
          {
            type: 'element',
            tagName: 'code',
            properties: {},
            children: [{ type: 'text', value: 'apiVersion: v1\n' }],
          },
        ],
      },
    ],
  };
}

test('rehypeCodeBadge wraps <pre class="shiki"> in <figure class="code-block">', () => {
  const tree = makeShikiTree({ language: 'yaml' });
  const transform = rehypeCodeBadge();
  transform(tree as any);

  const root = tree.children[0] as any;
  assert.equal(root.tagName, 'figure');
  assert.ok(
    Array.isArray(root.properties.className) &&
      root.properties.className.includes('code-block'),
    'figure must have code-block class',
  );
  // Figure's two children: badge span + original pre
  assert.equal(root.children.length, 2);
  assert.equal(root.children[1].tagName, 'pre');
});

test('rehypeCodeBadge prepends <span class="code-lang-badge"> with language text', () => {
  const tree = makeShikiTree({ language: 'typescript' });
  const transform = rehypeCodeBadge();
  transform(tree as any);

  const figure = tree.children[0] as any;
  const badge = figure.children[0];
  assert.equal(badge.tagName, 'span');
  assert.ok(
    Array.isArray(badge.properties.className) &&
      badge.properties.className.includes('code-lang-badge'),
    'badge must have code-lang-badge class',
  );
  // hast normalizes `aria-hidden` attribute to camelCase property `ariaHidden`.
  // This serializes back to `aria-hidden="true"` when emitted to HTML.
  assert.equal(badge.properties.ariaHidden, 'true');
  // Badge text content is a single text child with the language string
  assert.equal(badge.children[0].value, 'typescript');
});

test('rehypeCodeBadge falls back to "text" badge when data-language is missing', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['shiki', 'github-dark'] },
        children: [{ type: 'element', tagName: 'code', properties: {}, children: [] }],
      },
    ],
  };
  const transform = rehypeCodeBadge();
  transform(tree as any);

  const figure = tree.children[0] as any;
  assert.equal(figure.tagName, 'figure');
  assert.equal(figure.children[0].children[0].value, 'text');
});

test('rehypeCodeBadge skips <pre> without the "shiki" class (user-authored raw pre)', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['user-authored'] },
        children: [{ type: 'text', value: 'raw text' }],
      },
    ],
  };
  const transform = rehypeCodeBadge();
  transform(tree as any);

  // Untouched: still <pre>, not wrapped in <figure>
  assert.equal((tree.children[0] as any).tagName, 'pre');
});

test('rehypeCodeBadge is idempotent — second run over already-wrapped tree is a no-op', () => {
  const tree = makeShikiTree({ language: 'bash' });
  const transform = rehypeCodeBadge();
  transform(tree as any);  // first run: wraps
  const afterFirst = JSON.parse(JSON.stringify(tree));

  transform(tree as any);  // second run: must not rewrap
  const afterSecond = JSON.parse(JSON.stringify(tree));
  assert.deepEqual(afterFirst, afterSecond, 'second transform must be a no-op');
});

test('rehypeCodeBadge skips <div> elements (even with shiki class)', () => {
  const tree = makeShikiTree({ preTagName: 'div' });
  const transform = rehypeCodeBadge();
  transform(tree as any);

  // <div> with shiki class is not a <pre>, so untouched
  assert.equal((tree.children[0] as any).tagName, 'div');
});
