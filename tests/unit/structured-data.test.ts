import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  blogPostingJsonLd,
  homePageJsonLd,
  personNode,
  serializeJsonLd,
  talkEventJsonLd,
} from '../../src/lib/structured-data.ts';
import { socialLinks } from '../../src/data/social.ts';

const site = 'https://vedmich.dev';

test('serializeJsonLd escapes the less-than sign and round-trips', () => {
  const hostile = { '@type': 'Thing', name: '</script><script>alert(1)</script><!--' };
  const text = serializeJsonLd(hostile);
  assert.ok(!text.includes('<'), text);
  assert.ok(text.includes('\\u003c/script>'));
  assert.deepEqual(JSON.parse(text), hostile);
});

test('person node lists every social link and names Viktor per locale', () => {
  const en = personNode(site, 'en');
  const ru = personNode(site, 'ru');
  assert.deepEqual(en.sameAs, socialLinks.map((link) => link.url));
  assert.equal(en.name, 'Viktor Vedmich');
  assert.equal(ru.name, 'Виктор Ведмич');
  assert.equal(en['@id'], ru['@id']);
  assert.equal(en['@id'], 'https://vedmich.dev/#person');
});

test('home page graph holds a Person and a WebSite that point at the person', () => {
  const home = homePageJsonLd(site, 'ru', 'Описание');
  assert.equal(home['@context'], 'https://schema.org');
  const nodes = home['@graph'] as Record<string, unknown>[];
  assert.deepEqual(nodes.map((node) => node['@type']), ['Person', 'WebSite']);
  const website = nodes[1];
  assert.equal(website.inLanguage, 'ru');
  assert.equal(website.url, 'https://vedmich.dev/ru/');
  assert.deepEqual(website.author, { '@id': 'https://vedmich.dev/#person' });
});

test('blog posting carries the fields the content has', () => {
  const post = blogPostingJsonLd({
    site,
    locale: 'en',
    url: 'https://vedmich.dev/en/blog/hello/',
    title: 'Hello',
    description: 'A description',
    date: new Date('2026-06-06'),
    author: 'Viktor Vedmich',
    tags: ['Kubernetes', 'AWS'],
  });
  assert.equal(post['@type'], 'BlogPosting');
  assert.equal(post.headline, 'Hello');
  assert.equal(post.datePublished, '2026-06-06');
  assert.equal(post.inLanguage, 'en');
  assert.equal(post.url, 'https://vedmich.dev/en/blog/hello/');
  assert.deepEqual(post.image, ['https://vedmich.dev/og-default.png']);
  assert.equal(post.keywords, 'Kubernetes, AWS');
  assert.equal((post.author as Record<string, unknown>)['@id'], 'https://vedmich.dev/#person');
  assert.equal('dateModified' in post, false);
});

test('blog posting uses a cover image and a guest author as given', () => {
  const post = blogPostingJsonLd({
    site,
    locale: 'ru',
    url: 'https://vedmich.dev/ru/blog/guest/',
    title: 'Гость',
    description: 'Описание',
    date: new Date('2026-10-04'),
    author: 'Guest Author',
    tags: [],
    image: '/blog-assets/cover.jpg',
  });
  assert.deepEqual(post.image, ['https://vedmich.dev/blog-assets/cover.jpg']);
  assert.deepEqual(post.author, { '@type': 'Person', name: 'Guest Author' });
});

test('talk event has a date, a place and the conference, and a recording only with a video', () => {
  const input = {
    site,
    locale: 'en' as const,
    url: 'https://vedmich.dev/en/speaking/2024-berlin/',
    title: 'Talk',
    description: 'About the talk',
    event: 'AWS Summit Berlin',
    city: 'Berlin',
    date: new Date('2024-05-15'),
  };
  const bare = talkEventJsonLd(input);
  assert.equal(bare['@type'], 'Event');
  assert.equal(bare.startDate, '2024-05-15');
  assert.deepEqual(bare.superEvent, { '@type': 'Event', name: 'AWS Summit Berlin' });
  assert.equal((bare.location as Record<string, unknown>).name, 'Berlin');
  assert.equal('recordedIn' in bare, false);
  assert.equal('inLanguage' in bare, false);

  const recorded = talkEventJsonLd({ ...input, video: 'https://www.youtube.com/watch?v=abc' });
  assert.equal((recorded.recordedIn as Record<string, unknown>).url, 'https://www.youtube.com/watch?v=abc');
});
