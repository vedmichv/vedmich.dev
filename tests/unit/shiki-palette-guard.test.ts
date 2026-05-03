import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeToHtml } from 'shiki';

// Freeze github-dark palette hexes. If Shiki bumps the theme and one of these
// changes, the corresponding test fails fast — forcing us to update the
// matching attribute selector inside the SHIKI_TOKEN_OVERRIDES_BEGIN / _END
// sentinel block in src/styles/global.css so the Deep Signal token override
// keeps matching. Grep for `SHIKI_TOKEN_OVERRIDES_BEGIN` — line numbers drift.
//
// Run via: `npm run test:unit`. This test is picked up automatically by the
// `tests/unit/*.test.ts` glob in package.json.
//
// When to run: before `npm update astro` or any Astro minor/major bump. If
// any assertion fails after the bump, the failure message points to the exact
// global.css selector that needs its hex updated. Do not merge the bump until
// all 8 pass.
//
// Load-bearing assertions (mirrors the 8 attribute selectors in the
// SHIKI_TOKEN_OVERRIDES_BEGIN block of global.css):
//   #E1E4E8 → --text-primary      (default text)
//   #F97583 → --brand-primary     (keywords)
//   #9ECBFF → --brand-accent      (strings)
//   #85E89D → --brand-primary     (yaml keys / markdown list markers)
//   #79B8FF → --brand-primary-hover (types / numbers)
//   #6A737D → --text-muted        (comments)
//   #B392F0 → --text-primary      (function names)
//   #FFAB70 → --brand-primary-hover (bash variables / regex literals)

test('github-dark default text color is #E1E4E8', async () => {
  const html = await codeToHtml('const x = 1', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#E1E4E8/i, 'default text hex drifted — update global.css selector for #E1E4E8');
});

test('github-dark keyword color is #F97583', async () => {
  const html = await codeToHtml('const x = 1', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#F97583/i, 'keyword hex drifted — update global.css selector for #F97583');
});

test('github-dark string literal color is #9ECBFF', async () => {
  const html = await codeToHtml('const x = "hello"', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#9ECBFF/i, 'string hex drifted — update global.css selector for #9ECBFF');
});

test('github-dark yaml key color is #85E89D', async () => {
  const html = await codeToHtml('apiVersion: v1\nkind: Pod\n', { lang: 'yaml', theme: 'github-dark' });
  assert.match(html, /color:#85E89D/i, 'yaml-key hex drifted — update global.css selector for #85E89D');
});

test('github-dark type annotation color is #79B8FF', async () => {
  const html = await codeToHtml('const x: number = 1', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#79B8FF/i, 'type hex drifted — update global.css selector for #79B8FF');
});

test('github-dark comment color is #6A737D', async () => {
  const html = await codeToHtml('// comment', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#6A737D/i, 'comment hex drifted — update global.css selector for #6A737D');
});

test('github-dark function-name color is #B392F0', async () => {
  const html = await codeToHtml('function foo() {}\nfoo();', { lang: 'ts', theme: 'github-dark' });
  assert.match(html, /color:#B392F0/i, 'function-name hex drifted — update global.css selector for #B392F0');
});

test('github-dark bash variable color is #FFAB70', async () => {
  // NB: Shiki's bash grammar (github-dark) colors `$FOO`-style identifier variables
  // as default text (#E1E4E8), but positional args `$1`/`$2` get #FFAB70. The
  // positional-arg fixture is the most reliable single-line probe for this hex.
  const html = await codeToHtml('echo $1', { lang: 'bash', theme: 'github-dark' });
  assert.match(html, /color:#FFAB70/i, 'bash-variable hex drifted — update global.css selector for #FFAB70');
});
