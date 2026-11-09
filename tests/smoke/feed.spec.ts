import { test, expect } from '@playwright/test';

const unlisted = '2026-06-22-pod-pending-decode-tree';

interface ParsedFeed {
  version: string | null;
  title: string | null;
  description: string | null;
  link: string | null;
  language: string | null;
  selfHref: string | null;
  items: { title: string | null; link: string | null; guid: string | null; description: string | null; pubDate: string | null }[];
}

for (const locale of ['en', 'ru'] as const) {
  test(`${locale}: the RSS feed is valid XML with the listed posts, newest first`, async ({ page }) => {
    // The blog index is the reference for what is listed.
    await page.goto(`/${locale}/blog/`);
    const listed = await page
      .locator(`main a[href^="/${locale}/blog/"]`)
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(listed.length).toBeGreaterThan(0);

    const response = await page.request.get(`/${locale}/rss.xml`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    const xml = await response.text();
    expect(xml).not.toContain(unlisted);
    expect(xml).not.toContain('__fixture');
    expect(xml).not.toContain('<content:encoded');

    // The browser parser rejects malformed XML with a <parsererror> document.
    const feed = await page.evaluate((text): ParsedFeed | null => {
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      if (doc.getElementsByTagName('parsererror').length > 0) return null;
      const channel = doc.querySelector('rss > channel')!;
      const own = (parent: Element, name: string) =>
        [...parent.children].find((child) => child.tagName === name)?.textContent ?? null;
      return {
        version: doc.documentElement.getAttribute('version'),
        title: own(channel, 'title'),
        description: own(channel, 'description'),
        link: own(channel, 'link'),
        language: own(channel, 'language'),
        selfHref: [...channel.children].find((child) => child.tagName === 'atom:link')?.getAttribute('href') ?? null,
        items: [...channel.querySelectorAll(':scope > item')].map((item) => ({
          title: own(item, 'title'),
          link: own(item, 'link'),
          guid: own(item, 'guid'),
          description: own(item, 'description'),
          pubDate: own(item, 'pubDate'),
        })),
      };
    }, xml);

    expect(feed, 'the feed must parse as XML').not.toBeNull();
    expect(feed!.version).toBe('2.0');
    expect(feed!.title).toBe(locale === 'en' ? 'Viktor Vedmich: Blog' : 'Виктор Ведмич: блог');
    expect(feed!.description).toBeTruthy();
    expect(feed!.link).toBe(`https://vedmich.dev/${locale}/blog/`);
    expect(feed!.language).toBe(locale);
    expect(feed!.selfHref).toBe(`https://vedmich.dev/${locale}/rss.xml`);

    // Same posts, same order as the blog index.
    expect(feed!.items.map((item) => new URL(item.link!).pathname)).toEqual(listed);
    const times: number[] = [];
    for (const item of feed!.items) {
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.link).toMatch(new RegExp(`^https://vedmich\\.dev/${locale}/blog/[^/]+/$`));
      expect(item.guid).toBe(item.link);
      expect(item.pubDate).toMatch(/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
      times.push(Date.parse(item.pubDate!));
    }
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  test(`${locale}: every page advertises its feed and the feed link is reachable`, async ({ page }) => {
    for (const path of ['', 'blog/', 'blog/hello-world/', 'speaking/']) {
      await page.goto(`/${locale}/${path}`);
      const alternate = page.locator('head link[rel="alternate"][type="application/rss+xml"]');
      await expect(alternate).toHaveCount(1);
      await expect(alternate).toHaveAttribute('href', `/${locale}/rss.xml`);
      await expect(alternate).toHaveAttribute('title', locale === 'en' ? 'Viktor Vedmich: Blog' : 'Виктор Ведмич: блог');
    }
    expect((await page.request.get(`/${locale}/rss.xml`)).status()).toBe(200);
  });

  test(`${locale}: the blog index links to the feed`, async ({ page }) => {
    await page.goto(`/${locale}/blog/`);
    const link = page.locator(`main a[href="/${locale}/rss.xml"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toBeVisible();
    await expect(link).toHaveText(locale === 'en' ? 'RSS feed' : 'RSS-лента');
    await link.focus();
    await expect(link).toBeFocused();
  });
}
