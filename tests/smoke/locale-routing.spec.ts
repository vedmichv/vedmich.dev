import { test, expect } from '@playwright/test';

const detected = [
  ['ru-RU', 'ru'],
  ['be-BY', 'ru'],
  ['uk-UA', 'en'],
  ['de-DE', 'en'],
  ['en-US', 'en'],
] as const;

for (const [browserLocale, expected] of detected) {
  test(`a ${browserLocale} browser lands on /${expected}/ and the choice is remembered`, async ({ browser }) => {
    const context = await browser.newContext({ locale: browserLocale });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`/${expected}/$`));
    await expect(page.locator('html')).toHaveAttribute('lang', expected);
    expect(await page.evaluate(() => localStorage.getItem('vedmich-lang'))).toBe(expected);
    await context.close();
  });
}

test('a stored language preference wins over the browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'uk-UA' });
  await context.addInitScript(() => {
    if (!localStorage.getItem('vedmich-lang')) localStorage.setItem('vedmich-lang', 'ru');
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/ru\/$/);
  await context.close();
});

test('without JavaScript the root page refreshes to /en/', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ru-RU', javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/$/);
  await context.close();
});
