import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Font contract: every font is self-hosted (AGENTS.md), Russian pages get real
 * Cyrillic faces, and English pages without Cyrillic text never download them.
 */

const THIRD_PARTY_FONT_HOST = /fonts\.(googleapis|gstatic)\.com/;

const pages = [
  '/en/',
  '/ru/',
  '/en/blog/',
  '/ru/blog/',
  '/en/speaking/',
  '/ru/speaking/',
  '/en/presentations/',
  '/ru/presentations/',
  '/en/blog/2026-03-20-karpenter-right-sizing/',
  '/ru/blog/2026-03-20-karpenter-right-sizing/',
  '/ru/speaking/2026-karpenter-production/',
];

/** Every standalone embed under public/embeds, as URL paths. */
function embedPaths(dir = 'public/embeds'): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...embedPaths(full));
    else if (name.endsWith('.html')) found.push('/' + full.replace(/^public\//, ''));
  }
  return found.sort();
}

/** Open a page, scroll it to trigger lazy iframes, and return every URL it (and its iframes) requested. */
async function requestedUrls(page: Page, path: string): Promise<string[]> {
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  await page.goto(path, { waitUntil: 'load' });
  // Lazy iframes and reveal-on-scroll content load when scrolled into view.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  return urls;
}

test('source files never reference a third-party font host', () => {
  const offenders: string[] = [];
  const scan = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) scan(full);
      else if (/\.(html|css|astro|mdx?|ts|js|mjs)$/.test(name) && THIRD_PARTY_FONT_HOST.test(readFileSync(full, 'utf8'))) {
        offenders.push(full);
      }
    }
  };
  scan('public/embeds');
  scan('src');
  expect(offenders).toEqual([]);
});

for (const path of pages) {
  test(`${path} requests no Google Fonts host`, async ({ page }) => {
    const urls = await requestedUrls(page, path);
    expect(urls.filter((url) => THIRD_PARTY_FONT_HOST.test(url))).toEqual([]);
  });
}

test('no embed requests a Google Fonts host', async ({ page }) => {
  const offenders: string[] = [];
  const all = embedPaths();
  expect(all.length).toBeGreaterThan(20);
  for (const path of all) {
    const urls: string[] = [];
    const listener = (request: { url(): string }) => urls.push(request.url());
    page.on('request', listener);
    const response = await page.goto(path, { waitUntil: 'load' });
    expect(response?.status(), path).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    page.off('request', listener);
    if (urls.some((url) => THIRD_PARTY_FONT_HOST.test(url))) offenders.push(path);
  }
  expect(offenders).toEqual([]);
});

test('Russian pages load the Cyrillic faces: Inter text and Manrope headings', async ({ page }) => {
  const urls = await requestedUrls(page, '/ru/');
  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === 'loaded' && face.unicodeRange.includes('U+400'))
      .map((face) => face.family.replace(/"/g, '')),
  );
  expect(loaded).toEqual(expect.arrayContaining(['Inter', 'Space Grotesk']));
  expect(urls.some((url) => url.endsWith('/fonts/inter-cyrillic-400-normal.woff2'))).toBe(true);
  expect(urls.some((url) => url.endsWith('/fonts/manrope-cyrillic-700-normal.woff2'))).toBe(true);

  // The Latin display face is still the first choice for Latin characters.
  const h1 = page.locator('h1');
  expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/^"?Space Grotesk"?/);
});

test('Russian pages preload their first-screen Cyrillic fonts, English pages do not', async ({ page }) => {
  await page.goto('/ru/');
  const ru = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(ru.filter((href) => href?.includes('cyrillic'))).toEqual([
    '/fonts/inter-cyrillic-400-normal.woff2',
    '/fonts/inter-cyrillic-500-normal.woff2',
    '/fonts/manrope-cyrillic-700-normal.woff2',
  ]);
  await page.goto('/en/blog/');
  const en = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(en.filter((href) => href?.includes('cyrillic'))).toEqual([]);
  expect(en.length).toBeGreaterThan(0);
});

test('English pages without Cyrillic text never download a Cyrillic font file', async ({ page }) => {
  for (const path of ['/en/blog/', '/en/speaking/', '/en/presentations/', '/en/blog/2026-03-20-karpenter-right-sizing/']) {
    const urls: string[] = [];
    const listener = (request: { url(): string }) => urls.push(request.url());
    page.on('request', listener);
    await page.goto(path, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    page.off('request', listener);
    const hasCyrillic = await page.evaluate(() => /[\u0400-\u04FF]/.test(document.body.innerText));
    if (hasCyrillic) continue;
    expect(urls.filter((url) => url.includes('cyrillic')), path).toEqual([]);
  }
});

test('Russian embeds render Cyrillic text with the self-hosted faces', async ({ page }) => {
  for (const path of ['/embeds/ltb/ru/01-three-lanes.html', '/embeds/mcp/ru/01-client-drives.html', '/embeds/gateway-api/ru/01-two-permissions.html']) {
    await page.goto(path, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() =>
      [...document.fonts]
        .filter((face) => face.status === 'loaded' && face.unicodeRange.includes('U+400'))
        .map((face) => face.family.replace(/"/g, '')),
    );
    expect(loaded, path).toEqual(expect.arrayContaining(['Inter', 'Space Grotesk']));
  }
});
