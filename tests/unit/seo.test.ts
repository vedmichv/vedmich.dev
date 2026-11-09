import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DESCRIPTION_LIMIT, TITLE_LIMIT, formatDate, pageTitle, summarize } from '../../src/lib/seo.ts';

test('pageTitle appends the site name only while the title fits', () => {
  assert.equal(pageTitle('Kubernetes Security', 'en'), 'Kubernetes Security · Viktor Vedmich');
  assert.equal(pageTitle('Kubernetes Security', 'ru'), 'Kubernetes Security · Виктор Ведмич');
  const long = 'A title that already fills most of the search result line by itself';
  assert.equal(pageTitle(long, 'en'), long);
  for (const title of ['Short', 'x'.repeat(40), 'x'.repeat(43), 'x'.repeat(44)]) {
    const result = pageTitle(title, 'en');
    assert.ok(result === title || result.length <= TITLE_LIMIT, result);
  }
});

test('formatDate renders day-month-year per locale without a year marker', () => {
  const date = new Date('2026-10-04');
  assert.equal(formatDate(date, 'en'), '4 October 2026');
  assert.equal(formatDate(date, 'ru'), '4 октября 2026');
});

test('summarize returns the fallback for an empty body', () => {
  assert.equal(summarize('', 'Fallback text'), 'Fallback text');
  assert.equal(summarize(undefined, 'Fallback text'), 'Fallback text');
  assert.equal(summarize('```sh\nnpm ci\n```', 'Fallback text'), 'Fallback text');
});

test('summarize keeps a short body and strips Markdown', () => {
  assert.equal(
    summarize('A **bold** claim with a [link](https://example.com) and `code`.', 'x'),
    'A bold claim with a link and code.',
  );
});

test('summarize ends on a whole sentence when most of the room is used', () => {
  const first = 'The first sentence is long enough to be a good description for a search result page, because it uses most of the room.';
  const second = 'The second sentence pushes the whole text over the limit, so it has to be left out entirely.';
  const result = summarize(`${first} ${second}`, 'x');
  assert.equal(result, first);
  assert.ok(result.length <= DESCRIPTION_LIMIT);
});

test('summarize cuts at a word with an ellipsis when sentences are too short', () => {
  const body = `Short opener. ${'word '.repeat(60)}`;
  const result = summarize(body, 'x');
  assert.ok(result.endsWith('…'));
  assert.ok(result.length <= DESCRIPTION_LIMIT);
  assert.ok(!result.includes('  '));
  assert.ok(!/\s…$/.test(result));
});

test('summarize never exceeds the limit and never emits U+2014', () => {
  const body = 'Слово '.repeat(200);
  const result = summarize(body, 'x');
  assert.ok(result.length <= DESCRIPTION_LIMIT);
  assert.ok(!result.includes('—'));
});
