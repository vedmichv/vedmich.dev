import { test } from 'node:test';
import assert from 'node:assert/strict';

// Wave 0 scaffold — rehype-code-badge.mjs does not yet exist.
// Plan 02-03 will import from '../../rehype-code-badge.mjs' and add real assertions:
//   - wraps <pre class="shiki"> in <figure class="code-block">
//   - emits <span class="code-lang-badge"> with language text
//   - idempotent on already-wrapped input
//   - skips non-shiki <pre>

test('rehype-code-badge: scaffold placeholder (Wave 0)', () => {
  assert.ok(true, 'replaced in Plan 02-03 with real hast-tree fixtures');
});
