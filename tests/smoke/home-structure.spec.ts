import { test, expect, type Page } from '@playwright/test';

// Homepage order, navigation, the six-event Speaking list, talk badges, the About photo and the DKT card.
const strings = {
  en: {
    nav: ['Blog', 'Speaking', 'Podcasts', 'Book', 'About', 'Contact'],
    latest: 'Latest',
    allTalks: 'All talks',
    allSlides: 'All slides',
    invite: 'Invite me to speak',
    photoAlt: 'Viktor Vedmich speaking at AWS Summit Berlin',
    badges: { video: 'Video', slides: 'Slides', article: 'Article' },
    dktCta: 'Go to dk-t.dev',
  },
  ru: {
    nav: ['Блог', 'Выступления', 'Подкасты', 'Книга', 'Обо мне', 'Контакты'],
    latest: 'Новое',
    allTalks: 'Все выступления',
    allSlides: 'Все слайды',
    invite: 'Пригласить выступить',
    photoAlt: 'Виктор Ведмич выступает на AWS Summit Berlin',
    badges: { video: 'Видео', slides: 'Слайды', article: 'Статья' },
    dktCta: 'Перейти на dk-t.dev',
  },
} as const;

const expectedOrder = ['hero', 'latest', 'blog', 'speaking', 'about', 'podcasts', 'book', 'contact'];

async function eventTitles(page: Page): Promise<string[]> {
  return page.locator('[data-talk-event]').evaluateAll((events) =>
    events.map((event) => event.querySelector('.font-display')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
  );
}

for (const locale of ['en', 'ru'] as const) {
  const s = strings[locale];

  test.describe(`${locale}: homepage structure`, () => {
    test('sections follow the approved order and the Slides section is gone', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const ids = await page.locator('main section[id]').evaluateAll((sections) => sections.map((section) => section.id));
      expect(ids).toEqual(expectedOrder);
      await expect(page.locator('#presentations')).toHaveCount(0);
      // The deck index stays reachable from Speaking.
      await expect(page.locator(`#speaking a[href="/${locale}/presentations/"]`)).toHaveText(new RegExp(s.allSlides));
    });

    test('header navigation lists six items in page order, without Slides', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${locale}/`);
      const desktop = page.locator('#site-header nav > ul a');
      await expect(desktop).toHaveText([...s.nav]);
      const hrefs = await desktop.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(hrefs).toEqual(['#blog', '#speaking', '#podcasts', '#book', '#about', '#contact']);
      // Language switch and search stay in the header.
      await expect(page.locator('#site-header .lang-switch[data-lang="en"]').first()).toBeVisible();
      await expect(page.locator('#site-header .lang-switch[data-lang="ru"]').first()).toBeVisible();
      await expect(page.locator('#search-trigger-desktop')).toBeVisible();
    });

    test('the mobile menu has the same six items plus search and the language switch', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${locale}/`);
      await page.locator('#mobile-menu-btn').click();
      await expect(page.locator('#mobile-menu li > a[href^="#"]')).toHaveText([...s.nav]);
      await expect(page.locator('#search-trigger-mobile')).toBeVisible();
      await expect(page.locator('#mobile-menu .lang-switch')).toHaveCount(2);
    });

    test('the Latest strip names the newest post and the newest talk', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const strip = page.locator('#latest');
      await expect(strip.getByRole('heading', { level: 2, name: s.latest })).toBeVisible();
      await expect(strip.locator('li')).toHaveCount(2);
      const post = strip.locator('[data-latest="post"] a');
      const talk = strip.locator('[data-latest="talk"] a');
      // The first blog card on the homepage is the newest post.
      const newestPost = await page.locator(`#blog a[href^="/${locale}/blog/"]:not([href="/${locale}/blog/"])`).first().getAttribute('href');
      await expect(post).toHaveAttribute('href', newestPost!);
      await expect(talk).toHaveAttribute('href', new RegExp(`^/${locale}/speaking/[^/]+/$`));
      for (const link of [post, talk]) {
        const href = (await link.getAttribute('href'))!;
        expect((await page.request.get(href)).status()).toBe(200);
      }
    });

    test('Speaking shows the six newest events, not six sessions', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const events = await eventTitles(page);
      expect(events).toHaveLength(6);
      const sessions = await page.locator('#speaking [data-talk-event] > ul > li').count();
      expect(sessions, 'events with several sessions keep all of them').toBeGreaterThan(6);

      await page.goto(`/${locale}/speaking/`);
      const all = await eventTitles(page);
      expect(all.length).toBeGreaterThan(6);
      expect(events, 'the homepage list is the head of the full list').toEqual(all.slice(0, 6));
    });

    test('Speaking links to all talks, all slides and the invite block', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const speaking = page.locator('#speaking');
      await expect(speaking.locator(`a[href="/${locale}/speaking/"]`)).toHaveText(new RegExp(s.allTalks));
      await expect(speaking.locator(`a[href="/${locale}/presentations/"]`)).toBeVisible();
      await expect(speaking.locator(`a[href="/${locale}/speaking/#invite"]`)).toContainText(s.invite);
    });

    test('About shows the stage photo with alt text, size, lazy loading and a 2x source', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const photo = page.locator('#about img');
      await expect(photo).toHaveAttribute('alt', s.photoAlt);
      await expect(photo).toHaveAttribute('width', '640');
      await expect(photo).toHaveAttribute('height', '960');
      await expect(photo).toHaveAttribute('loading', 'lazy');
      await expect(photo).toHaveAttribute('src', '/images/viktor-vedmich-640.webp');
      const srcset = (await photo.getAttribute('srcset'))!;
      expect(srcset).toContain('/images/viktor-vedmich-640.webp 640w');
      expect(srcset).toContain('/images/viktor-vedmich-1280.webp 1280w');
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
      for (const file of ['viktor-vedmich-640.webp', 'viktor-vedmich-1280.webp']) {
        expect((await page.request.get(`/images/${file}`)).status()).toBe(200);
      }
    });

    test('the photo does not dominate a phone screen', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${locale}/`);
      const box = await page.locator('#about img').boundingBox();
      expect(box!.width).toBeLessThanOrEqual(200);
      expect(box!.height).toBeLessThanOrEqual(300);
    });

    test('Podcasts and Book are separate full-width sections, one after the other', async ({ page }) => {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/`);
        const podcasts = (await page.locator('#podcasts').boundingBox())!;
        const book = (await page.locator('#book').boundingBox())!;
        expect(podcasts.width).toBeGreaterThan(width - 20);
        expect(book.width).toBeGreaterThan(width - 20);
        expect(book.y).toBeGreaterThanOrEqual(podcasts.y + podcasts.height - 1);
      }
    });

    test('the DKT card leads to dk-t.dev and shows its numbers', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const card = page.locator('article[aria-labelledby="podcast-dkt-title"]');
      await expect(card.getByRole('link', { name: new RegExp(`^${s.dktCta}`) })).toHaveAttribute('href', 'https://dk-t.dev/');
      await expect(card.locator('a[href="https://t.me/DevOpsKitchenTalks"]')).toHaveCount(1);
      await expect(card.locator('a[href="https://dk-t.dev/conferences/dkt-conf-2026"]')).toHaveCount(1);
      await expect(card.locator('[data-dkt-facts] dd')).toHaveText(['100+', '~10K', '500K+', '2020']);
      // The community site is the main link, so the player row no longer repeats it.
      await expect(card.locator('ul a[href="https://dk-t.dev/"]')).toHaveCount(0);
    });

    test('a talk with video, slides and an article shows three badges with the talk title in their names', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const row = page.locator('[data-talk-event] > ul > li').filter({ has: page.locator('[data-talk-badges] li:nth-child(3)') }).first();
      const badges = row.locator('[data-talk-badges] a');
      await expect(badges).toHaveCount(3);
      const title = (await row.locator(':scope > a').first().textContent())!.replace('→', '').trim();
      // The accessible name carries the badge label and the talk title.
      for (const label of [s.badges.video, s.badges.slides, s.badges.article]) {
        await expect(row.getByRole('link', { name: `${label}: ${title}` })).toHaveCount(1);
      }
      await expect(badges.nth(0)).toContainText(s.badges.video);
      await expect(badges.nth(1)).toContainText(s.badges.slides);
      await expect(badges.nth(2)).toContainText(s.badges.article);
      // Video and slides open elsewhere and say so; the article stays on the site.
      await expect(badges.nth(0)).toHaveAttribute('target', '_blank');
      await expect(badges.nth(1)).toHaveAttribute('target', '_blank');
      await expect(badges.nth(2)).toHaveAttribute('href', new RegExp(`^/${locale}/blog/`));
      await expect(badges.nth(2)).not.toHaveAttribute('target', /.+/);
      // Keyboard: every badge is a focusable link.
      for (let index = 0; index < 3; index++) {
        await badges.nth(index).focus();
        await expect(badges.nth(index)).toBeFocused();
      }
    });

    test('a talk without resources gets no badges', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const rows = page.locator('[data-talk-event] > ul > li');
      const total = await rows.count();
      const withBadges = await page.locator('[data-talk-badges]').count();
      expect(withBadges).toBeGreaterThan(0);
      expect(withBadges).toBeLessThan(total);
    });

    for (const width of [320, 390, 768, 1440]) {
      test(`home and speaking fit ${width}px without overflow or console errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
        await page.setViewportSize({ width, height: 900 });
        for (const path of [`/${locale}/`, `/${locale}/speaking/`]) {
          await page.goto(path);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, path).toBeLessThanOrEqual(0);
        }
        expect(errors).toEqual([]);
      });
    }
  });
}

test('core homepage content is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/');
  for (const id of ['latest', 'blog', 'speaking', 'about', 'podcasts', 'book', 'contact']) {
    await expect(page.locator(`#${id} h2`).first()).toBeVisible();
  }
  await expect(page.locator('#latest li')).toHaveCount(2);
  await expect(page.locator('#about img')).toBeVisible();
  await expect(page.locator('[data-talk-event]')).toHaveCount(6);
  await context.close();
});
