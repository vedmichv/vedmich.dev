// Stashes fence language onto the hast <pre> as `data-language`.
// Runs in the remark stage (mdast `code` node has `.lang`); remark->rehype
// propagates `data.hProperties` into the generated <pre> element's properties,
// surviving Shiki which otherwise strips the class on <code>.
//
// Downstream: `rehype-code-badge.mjs` reads pre.properties['data-language']
// to render the badge text (yaml, bash, typescript, dockerfile, ...).

import { visit } from 'unist-util-visit';

export function remarkStashCodeLang() {
  return function transform(tree) {
    visit(tree, 'code', (node) => {
      if (!node.lang) return;
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties['data-language'] = node.lang;
    });
  };
}
