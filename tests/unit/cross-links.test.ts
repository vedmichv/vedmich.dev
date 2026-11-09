import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPostOrigins, findSiblingTalks, type LinkableEntry } from '../../src/lib/cross-links.ts';

const POST = '/en/blog/2026-10-04-rca/';

function entry(id: string, data: Partial<LinkableEntry['data']> = {}): LinkableEntry {
  return {
    id,
    data: {
      title: `Title of ${id}`,
      event: 'AWS Summit Hamburg',
      city: 'Hamburg',
      date: new Date('2026-05-20'),
      draft: false,
      ...data,
    },
  };
}

test('a talk whose post matches becomes a line with its page, video and slides', () => {
  const talk = entry('en/2026-rca', { post: POST, video: 'https://youtu.be/x', slides: 'https://example.com/s/' });
  const other = entry('en/2026-other', { post: '/en/blog/else/' });
  const origins = findPostOrigins(POST, 'en', [talk, other], []);
  assert.equal(origins.length, 1);
  assert.equal(origins[0].href, '/en/speaking/2026-rca/');
  assert.equal(origins[0].video, 'https://youtu.be/x');
  assert.equal(origins[0].slides, 'https://example.com/s/');
});

test('a deck for the same event and date folds into the talk instead of duplicating it', () => {
  const talk = entry('en/2026-rca', { post: POST, video: 'https://youtu.be/x' });
  const deck = entry('en/rca-deck', { post: POST });
  const origins = findPostOrigins(POST, 'en', [talk], [deck]);
  assert.equal(origins.length, 1);
  assert.equal(origins[0].slides, '/slides/rca-deck/');
});

test('a deck keeps the slides URL of the talk when the talk already has one', () => {
  const talk = entry('en/2026-rca', { post: POST, slides: 'https://example.com/talk-slides/' });
  const deck = entry('en/rca-deck', { post: POST });
  assert.equal(findPostOrigins(POST, 'en', [talk], [deck])[0].slides, 'https://example.com/talk-slides/');
});

test('a deck without a city is listed without an event label', () => {
  const deck = entry('en/concept', {
    post: POST,
    event: 'Concept deck · Technical deep-dive',
    city: null,
    date: new Date('2026-06-06'),
  });
  const origins = findPostOrigins(POST, 'en', [], [deck]);
  assert.equal(origins.length, 1);
  assert.equal(origins[0].event, null);
  assert.equal(origins[0].href, null);
  assert.equal(origins[0].slides, '/slides/concept/');
});

test('a deck with a city keeps its event and an explicit slides URL', () => {
  const deck = entry('en/conf', { post: POST, event: 'Conf', city: 'Berlin', slides: 'https://s.example/conf/' });
  const [origin] = findPostOrigins(POST, 'en', [], [deck]);
  assert.equal(origin.event, 'Conf');
  assert.equal(origin.slides, 'https://s.example/conf/');
});

test('other locales and drafts never match', () => {
  const ru = entry('ru/2026-rca', { post: POST });
  const draft = entry('en/2026-draft', { post: POST, draft: true });
  assert.deepEqual(findPostOrigins(POST, 'en', [ru, draft], [ru, draft]), []);
});

test('origins are ordered by date, oldest first', () => {
  const late = entry('en/late', { post: POST, date: new Date('2026-09-01') });
  const early = entry('en/early', { post: POST, date: new Date('2026-03-01'), event: 'Other event' });
  const titles = findPostOrigins(POST, 'en', [late, early], []).map((origin) => origin.title);
  assert.deepEqual(titles, ['Title of en/early', 'Title of en/late']);
});

test('sibling talks share the locale, event and year, exclude the talk itself and drafts', () => {
  const current = entry('en/a', { event: 'AWS re:Invent', date: new Date('2024-12-05') });
  const sameYear = entry('en/b', { event: 'AWS re:Invent', date: new Date('2024-12-04') });
  const otherYear = entry('en/c', { event: 'AWS re:Invent', date: new Date('2023-11-27') });
  const otherEvent = entry('en/d', { event: 'AWS Summit Berlin', date: new Date('2024-12-04') });
  const otherLocale = entry('ru/e', { event: 'AWS re:Invent', date: new Date('2024-12-04') });
  const draft = entry('en/f', { event: 'AWS re:Invent', date: new Date('2024-12-04'), draft: true });
  const siblings = findSiblingTalks(current, [current, sameYear, otherYear, otherEvent, otherLocale, draft]);
  assert.deepEqual(siblings.map((s) => s.id), ['en/b']);
});

test('sibling talks on the same day are ordered by title', () => {
  const current = entry('en/a', { event: 'Code Europe', date: new Date('2025-07-01') });
  const z = entry('en/z', { event: 'Code Europe', date: new Date('2025-07-01'), title: 'Zeta' });
  const b = entry('en/b', { event: 'Code Europe', date: new Date('2025-07-01'), title: 'Beta' });
  assert.deepEqual(findSiblingTalks(current, [z, b, current]).map((s) => s.data.title), ['Beta', 'Zeta']);
});
