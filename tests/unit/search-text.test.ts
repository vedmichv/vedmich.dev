import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cutAtWord, h2Headings, leadText } from '../../src/data/search-text.ts';

const mdx = `
import PodLifecycleAnimation from '../../../components/PodLifecycleAnimation.astro';
import HtmlEmbed from '../../../components/HtmlEmbed.astro';

Salesforce runs **more than 1,000** Amazon EKS clusters. The [case study on the AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/x/) lists what changed.

<HtmlEmbed src="/embeds/karpenter/01-provisioning-paths.html" title="Cluster Autoscaler -> Karpenter: two routes" minHeight={1050} />

## Why Karpenter is different

- First bullet with \`inline code\`
- Second bullet

\`\`\`yaml
## not a heading
apiVersion: karpenter.sh/v1
\`\`\`

### A level three heading

| Name | Value |
|---|---|
| cpu | 4 |

> A quoted line.

![diagram alt text](/blog-assets/x.png)

## Trap 1: a [NodePool](https://karpenter.sh) has no ceiling {#trap-1}
`;

test('leadText drops imports, JSX tags, code blocks, headings, tables and images', () => {
  const lead = leadText(mdx, 2000);
  assert.ok(lead.startsWith('Salesforce runs more than 1,000 Amazon EKS clusters.'));
  assert.ok(lead.includes('The case study on the AWS Architecture Blog lists what changed.'));
  assert.ok(lead.includes('First bullet with inline code Second bullet'));
  assert.ok(lead.includes('A quoted line.'));
  for (const noise of ['import ', 'HtmlEmbed', 'minHeight', 'apiVersion', 'not a heading', '```', 'diagram alt text', 'Why Karpenter', '|---', '**', 'https://', 'level three']) {
    assert.ok(!lead.includes(noise), `lead should not contain "${noise}": ${lead}`);
  }
});

test('leadText keeps ">" inside quoted JSX attributes from leaking into the text', () => {
  const lead = leadText('Before.\n\n<SlideEmbed slide={6} caption="a > b and c" title=\'x\' />\n\nAfter.', 200);
  assert.equal(lead, 'Before. After.');
});

test('leadText cuts at a word boundary within the limit', () => {
  const lead = leadText('alpha beta gamma delta epsilon zeta eta theta', 20);
  assert.ok(lead.length <= 20);
  assert.equal(lead, 'alpha beta gamma');
  assert.equal(cutAtWord('short', 20), 'short');
  assert.equal(cutAtWord('abcdefghijklmnop', 8), 'abcdefgh');
});

test('h2Headings returns level 2 headings only, as plain text, ignoring code fences', () => {
  assert.deepEqual(h2Headings(mdx), ['Why Karpenter is different', 'Trap 1: a NodePool has no ceiling']);
  assert.deepEqual(h2Headings('# One\n\n## Two ##\n\n### Three\n\n#### Four'), ['Two']);
  assert.deepEqual(h2Headings('No headings here.'), []);
});

test('leadText and h2Headings are safe on empty input', () => {
  assert.equal(leadText('', 400), '');
  assert.deepEqual(h2Headings(''), []);
});
