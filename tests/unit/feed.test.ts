import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRssString } from '@astrojs/rss';
import {
  FEED_CHANNEL,
  feedOptions,
  feedPath,
  isFeedPost,
  selectFeedPosts,
  toFeedItems,
  type FeedEntry,
} from '../../src/lib/feed.ts';

const SITE = 'https://vedmich.dev';

function post(id: string, date: string, data: Partial<FeedEntry['data']> = {}): FeedEntry {
  return {
    id,
    data: { title: `Title of ${id}`, description: `About ${id}`, date: new Date(date), draft: false, ...data },
  };
}

const entries: FeedEntry[] = [
  post('en/2026-02-10-old', '2026-02-10'),
  post('en/2026-10-04-new', '2026-10-04'),
  post('en/2026-06-22-unlisted', '2026-06-22', { draft: true }),
  post('en/__fixture-syntax', '2026-01-01'),
  post('en/__fixture-listed', '2026-12-01'),
  post('en/2026-03-20-middle', '2026-03-20'),
  post('ru/2026-10-04-new', '2026-10-04'),
  post('ru/2026-02-10-old', '2026-02-10'),
  post('ru/__fixture-ru', '2026-12-01'),
];

test('a feed holds the locale posts, newest first', () => {
  assert.deepEqual(
    selectFeedPosts(entries, 'en').map((entry) => entry.id),
    ['en/2026-10-04-new', 'en/2026-03-20-middle', 'en/2026-02-10-old'],
  );
  assert.deepEqual(
    selectFeedPosts(entries, 'ru').map((entry) => entry.id),
    ['ru/2026-10-04-new', 'ru/2026-02-10-old'],
  );
});

test('drafts and double-underscore fixtures stay out, even when they are not marked as drafts', () => {
  const ids = selectFeedPosts(entries, 'en').map((entry) => entry.id);
  assert.ok(!ids.includes('en/2026-06-22-unlisted'));
  assert.ok(!ids.includes('en/__fixture-syntax'));
  assert.ok(!ids.includes('en/__fixture-listed'));
  assert.equal(isFeedPost(post('en/__x', '2026-01-01', { draft: false }), 'en'), false);
  assert.equal(isFeedPost(post('en/a__b', '2026-01-01'), 'en'), true);
});

test('a post of the other locale never appears, and the input is not reordered', () => {
  const before = entries.map((entry) => entry.id);
  selectFeedPosts(entries, 'ru');
  assert.deepEqual(entries.map((entry) => entry.id), before);
  assert.ok(selectFeedPosts(entries, 'ru').every((entry) => entry.id.startsWith('ru/')));
});

test('equal dates are ordered by slug, whatever the input order', () => {
  const a = post('en/a-same-day', '2026-05-05');
  const b = post('en/b-same-day', '2026-05-05');
  const forward = selectFeedPosts([a, b], 'en').map((entry) => entry.id);
  const backward = selectFeedPosts([b, a], 'en').map((entry) => entry.id);
  assert.deepEqual(forward, ['en/b-same-day', 'en/a-same-day']);
  assert.deepEqual(backward, forward);
});

test('an item has an absolute link with a trailing slash, the description and the date', () => {
  const [item] = toFeedItems(entries, 'ru', SITE);
  assert.deepEqual(item, {
    title: 'Title of ru/2026-10-04-new',
    description: 'About ru/2026-10-04-new',
    link: 'https://vedmich.dev/ru/blog/2026-10-04-new/',
    pubDate: new Date('2026-10-04'),
  });
  assert.ok(!('content' in item));
});

test('the feed paths and the channel metadata exist for both locales', () => {
  assert.equal(feedPath('en'), '/en/rss.xml');
  assert.equal(feedPath('ru'), '/ru/rss.xml');
  assert.equal(FEED_CHANNEL.en.language, 'en');
  assert.equal(FEED_CHANNEL.ru.language, 'ru');
  assert.notEqual(FEED_CHANNEL.en.title, FEED_CHANNEL.ru.title);
  assert.match(FEED_CHANNEL.ru.title, /[а-я]/i);
  for (const meta of Object.values(FEED_CHANNEL)) {
    assert.ok(meta.title && meta.description);
    for (const text of [meta.title, meta.description]) assert.ok(!/[\u2013\u2014]/.test(text));
  }
});

/** Text of the first element with this name, with the five XML entities decoded. */
function firstText(xml: string, tag: string, from = 0): string {
  const match = xml.slice(from).match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  assert.ok(match, `<${tag}> is missing`);
  return match[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

test('markup characters in a title or description are escaped and round-trip as text', async () => {
  const title = `Tom & Jerry <script>alert("x")</script> 'single' ]]> &amp;`;
  const description = `1 < 2 && 3 > 2, "quoted" <b>bold</b> & more`;
  const xml = await getRssString(feedOptions('en', [post('en/2026-10-04-odd', '2026-10-04', { title, description })], SITE));

  assert.ok(!xml.includes('<script>'));
  assert.ok(!xml.includes('<b>'));
  assert.ok(!xml.includes('Tom & Jerry'));
  const itemStart = xml.indexOf('<item>');
  assert.ok(itemStart > 0);
  assert.equal(firstText(xml, 'title', itemStart), title);
  assert.equal(firstText(xml, 'description', itemStart), description);
});

test('the rendered feed carries the channel fields, the language and only listed posts', async () => {
  const xml = await getRssString(feedOptions('ru', entries, SITE));
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.equal(firstText(xml, 'title'), FEED_CHANNEL.ru.title);
  assert.equal(firstText(xml, 'description'), FEED_CHANNEL.ru.description);
  assert.equal(firstText(xml, 'link'), 'https://vedmich.dev/ru/blog/');
  assert.equal(firstText(xml, 'language'), 'ru');
  assert.ok(xml.includes('<atom:link href="https://vedmich.dev/ru/rss.xml" rel="self" type="application/rss+xml"/>'));
  assert.equal(xml.match(/<item>/g)?.length, 2);
  assert.equal(xml.match(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 GMT<\/pubDate>/g)?.length, 2);
  assert.ok(!xml.includes('__fixture'));
  assert.ok(!xml.includes('content:encoded'));
});
