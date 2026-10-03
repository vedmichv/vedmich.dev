import { test, expect } from '@playwright/test';

const unlisted = '/en/blog/2026-06-22-pod-pending-decode-tree/';

for (const locale of ['en', 'ru']) {
  test(`${locale}: main routes load without script errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of ['', 'blog/', 'presentations/', 'speaking/', 'blog/hello-world/']) {
      const response = await page.goto(`/${locale}/${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main')).toBeVisible();
      const socialImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect((await page.request.get(new URL(socialImage!).pathname)).status()).toBe(200);
      const alternate = await page.locator(`link[hreflang="${locale === 'en' ? 'ru' : 'en'}"]`).getAttribute('href');
      expect(alternate).toBeTruthy();
      expect((await page.request.get(new URL(alternate!).pathname)).status()).toBe(200);
    }
    expect(errors).toEqual([]);
  });

  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`${locale}: header fits ${width}px and mobile menu is accessible`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await page.goto(`/${locale}/`);
      const outside = await page.locator('#site-header a, #site-header button').evaluateAll((elements) =>
        elements.filter((element) => {
          const r = element.getBoundingClientRect();
          return r.width > 0 && (r.left < 0 || r.right > innerWidth + 1);
        }).map((element) => element.textContent),
      );
      expect(outside).toEqual([]);
      if (width < 1280) {
        const menu = page.locator('#mobile-menu-btn');
        await menu.click();
        await expect(menu).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(menu).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).toBeFocused();
      }
    });
  }
}

test('untranslated unlisted content stays reachable without broken alternate links', async ({ page }) => {
  const response = await page.goto(unlisted);
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await expect(page.locator('.lang-switch[data-lang="ru"]').first()).toHaveAttribute('href', '/ru/blog/');
  for (const path of ['/en/', '/en/blog/']) {
    await page.goto(path);
    await expect(page.locator(`a[href*="pod-pending-decode-tree"]`)).toHaveCount(0);
    expect(await page.locator('#search-index-data').textContent()).not.toContain('pod-pending-decode-tree');
  }
  const sitemap = await page.request.get('/sitemap-0.xml');
  expect(await sitemap.text()).not.toContain('pod-pending-decode-tree');
  expect(await sitemap.text()).not.toContain('__fixture');
});

test('locale detection works when browser storage is blocked', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ru-RU' });
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/ru\/$/);
  await context.close();
});

test('search fits a short mobile viewport and exposes keyboard selection', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/ru/');
  const menu = page.locator('#mobile-menu-btn');
  await menu.click();
  await page.locator('#search-trigger-mobile').click();
  const dialog = page.getByRole('dialog');
  const input = page.getByRole('combobox');
  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const bounds = await page.locator('#search-palette-card').boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480);
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'search-result-1');
  await expect(page.locator('#search-result-1')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#search-palette-count')).toContainText('Результаты:');
  await input.fill('nonexistent-<script>');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await expect(page.locator('#search-palette-results')).toContainText('nonexistent-<script>');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(menu).toBeFocused();
});

test('search opens a post and excludes unlisted content', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('/');
  const input = page.getByRole('combobox');
  await input.fill('latency throughput bandwidth');
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/en\/blog\/2026-06-11-latency-throughput-bandwidth\/?$/);
});

test('content and contact fallback remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/');
  await expect(page.locator('#about h2')).toBeVisible();
  await expect(page.locator('#blog h2')).toBeVisible();
  await expect(page.locator('noscript a[href="mailto:viktor@vedmich.dev"]')).toBeVisible();
  await context.close();
});

test('keyboard visitors can bypass repeated navigation', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('missing pages retain the requested URL and offer recovery links', async ({ page }) => {
  const response = await page.goto('/en/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page).toHaveURL(/\/en\/does-not-exist\/$/);
  await expect(page.locator('a[href="/en/"]')).toBeVisible();
  await expect(page.locator('a[href="/ru/"]')).toBeVisible();
});

test('404 bootstrap preserves the slide deep link while loading its shell', async ({ page }) => {
  await page.route('**/slides/review-fixture/index.html', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html><head><title>Slide shell</title></head><body><h1>Slide shell loaded</h1></body></html>',
  }));
  await page.goto('/slides/review-fixture/10?clicks=3');
  await expect(page.getByRole('heading', { name: 'Slide shell loaded' })).toBeVisible();
  await expect(page).toHaveURL(/\/slides\/review-fixture\/10\?clicks=3$/);
});
