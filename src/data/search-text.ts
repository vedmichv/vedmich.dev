/**
 * Build-time helpers that turn Markdown and MDX source into short plain text
 * for the search index. Pure functions, no Astro imports, covered by unit tests.
 */

const FENCE_RE = /(```|~~~)[\s\S]*?(?:\1|$)/g;

// A JSX or HTML tag whose attribute values may contain ">" inside quotes or braces.
const TAG_RE = /<\/?[A-Za-z][^<>"'{}]*(?:(?:"[^"]*"|'[^']*'|\{\{[^{}]*\}\}|\{[^{}]*\})[^<>"'{}]*)*\/?>/g;

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function stripCode(source: string): string {
  return source.replace(FENCE_RE, '\n');
}

/** Inline Markdown to text: links keep their label, images and emphasis marks disappear. */
function inlineText(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(TAG_RE, ' ')
    .replace(/[*`~]/g, '')
    .replace(/(^|\s)_+(\S(?:[^_]*\S)?)_+(?=\s|[.,;:!?)]|$)/g, '$1$2')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut at a word boundary near `max` characters. */
export function cutAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const space = text.lastIndexOf(' ', max);
  return text.slice(0, space > max * 0.6 ? space : max).trim();
}

/** Headings of level 2, in order, as plain text. Code blocks are ignored. */
export function h2Headings(source: string): string[] {
  const headings: string[] = [];
  for (const match of stripCode(source).matchAll(/^##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)) {
    const text = inlineText(match[1].replace(/\s*\{#[^}]*\}\s*$/, ''));
    if (text) headings.push(text);
  }
  return headings;
}

/**
 * Plain-text lead of a Markdown or MDX body: no code blocks, MDX imports, JSX or HTML
 * tags, headings, images, table rules or list markers. Links keep their label.
 */
export function leadText(source: string, max: number): string {
  const prose = stripCode(source)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^[ \t]*(?:import|export)[ \t][^\n]*$/gm, ' ')
    .replace(TAG_RE, ' ')
    .split('\n')
    .filter((line) => !/^\s{0,3}#{1,6}(\s|$)/.test(line))
    .filter((line) => !/^\s*[|:-]+[\s|:-]*$/.test(line))
    .filter((line) => !/^\s*\[[^\]]+\]:\s/.test(line))
    .map((line) =>
      line
        .replace(/^\s*>+\s?/, '')
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
        .replace(/\|/g, ' '),
    )
    .join('\n');
  return cutAtWord(inlineText(prose), max);
}
