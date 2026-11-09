import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// The redirect is an inline script of the root page. Run the shipped source, not a copy.
const page = readFileSync(new URL('../../src/pages/index.astro', import.meta.url), 'utf8');
const script = page.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'root page must keep its inline redirect script');

interface Visit {
  language?: string;
  /** Value of the stored `vedmich-lang` preference. */
  stored?: string | null;
  /** Make every storage call throw, like a browser with storage blocked. */
  storageBlocked?: boolean;
}

function visit({ language, stored = null, storageBlocked = false }: Visit) {
  const written: Record<string, string> = {};
  let target: string | undefined;
  const localStorage = {
    getItem(key: string) {
      if (storageBlocked) throw new Error('blocked');
      return key === 'vedmich-lang' ? stored : null;
    },
    setItem(key: string, value: string) {
      if (storageBlocked) throw new Error('blocked');
      written[key] = value;
    },
  };
  vm.runInNewContext(script!, {
    navigator: { language },
    localStorage,
    window: { location: { replace: (url: string) => { target = url; } } },
  });
  return { target, written };
}

test('Russian and Belarusian browsers go to /ru/', () => {
  for (const language of ['ru', 'ru-RU', 'RU-ru', 'ru_UA', 'be', 'be-BY']) {
    assert.equal(visit({ language }).target, '/ru/', language);
  }
});

test('Ukrainian browsers go to /en/ because there is no Ukrainian version', () => {
  for (const language of ['uk', 'uk-UA', 'UK-ua']) {
    assert.equal(visit({ language }).target, '/en/', language);
  }
});

test('every other language, and a missing language, goes to /en/', () => {
  for (const language of ['en', 'en-US', 'de-DE', 'pl-PL', 'kk-KZ', 'ka-GE', undefined, '']) {
    assert.equal(visit({ language }).target, '/en/', String(language));
  }
});

test('only the primary subtag decides: a longer code that merely starts with ru or be is not Russian', () => {
  for (const language of ['rue', 'ber', 'bem-ZM', 'en-RU', 'de-BE']) {
    assert.equal(visit({ language }).target, '/en/', language);
  }
});

test('the detected locale is remembered', () => {
  assert.deepEqual(visit({ language: 'ru-RU' }).written, { 'vedmich-lang': 'ru' });
  assert.deepEqual(visit({ language: 'uk-UA' }).written, { 'vedmich-lang': 'en' });
});

test('a stored preference wins over the browser language and is not rewritten', () => {
  const ukrainianChoosingRussian = visit({ language: 'uk-UA', stored: 'ru' });
  assert.equal(ukrainianChoosingRussian.target, '/ru/');
  assert.deepEqual(ukrainianChoosingRussian.written, {});
  assert.equal(visit({ language: 'ru-RU', stored: 'en' }).target, '/en/');
});

test('an unknown stored value is ignored', () => {
  assert.equal(visit({ language: 'ru-RU', stored: 'uk' }).target, '/ru/');
  assert.equal(visit({ language: 'de-DE', stored: 'fr' }).target, '/en/');
});

test('blocked storage still redirects by the browser language', () => {
  assert.equal(visit({ language: 'ru-RU', storageBlocked: true }).target, '/ru/');
  assert.equal(visit({ language: 'uk-UA', storageBlocked: true }).target, '/en/');
});

test('the no-JavaScript fallback still refreshes to /en/', () => {
  assert.match(page, /<noscript>\s*<meta http-equiv="refresh" content="0;url=\/en\/" \/>\s*<\/noscript>/);
});
