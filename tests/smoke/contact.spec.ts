import { test, expect } from '@playwright/test';

// Contact is a local mailto handoff. The page never sends anything, so no text may say it did.
const email = 'viktor@vedmich.dev';

const copy = {
  en: {
    title: 'Contact',
    write: 'Write an email',
    copy: 'Copy address',
    done: 'Address copied',
    failed: 'Could not copy. Select the address and copy it by hand.',
    send: 'Open in my email app',
    heading: 'Your email app should open',
    claimsSent: /\b(?:has been|have been|was|were|is) sent\b|\bmessage sent\b|\bsent!/i,
  },
  ru: {
    title: 'Контакты',
    write: 'Написать письмо',
    copy: 'Скопировать адрес',
    done: 'Адрес скопирован',
    failed: 'Не получилось скопировать. Выдели адрес и скопируй вручную.',
    send: 'Открыть в почтовом приложении',
    heading: 'Почтовое приложение должно открыться',
    claimsSent: /(?:сообщение|письмо)\s+(?:было\s+|уже\s+)?отправлен|отправлено|отправили/i,
  },
} as const;

for (const locale of ['en', 'ru'] as const) {
  const c = copy[locale];

  test.describe(`${locale}: contact section`, () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

    test('shows the address as text with a mailto link, and no email field', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/${locale}/`);
      const section = page.locator('#contact');
      await expect(section.getByRole('heading', { level: 2, name: c.title })).toBeVisible();
      await expect(section.locator('[data-contact-address]')).toHaveText(email);
      await expect(section.getByRole('link', { name: c.write })).toHaveAttribute('href', `mailto:${email}`);
      await expect(section.getByRole('button', { name: c.copy })).toBeVisible();
      await expect(section.locator('input[type="email"], input[name="email"]')).toHaveCount(0);
      expect(errors).toEqual([]);
    });

    test('copy puts the address on the clipboard and announces it', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const status = page.locator('#contact [data-contact-copy-status]');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      await page.getByRole('button', { name: c.copy }).click();
      await expect(status).toHaveText(c.done);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
    });

    test('copy falls back when the Clipboard API is missing and reports a failure', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      });
      await page.goto(`/${locale}/`);
      const status = page.locator('#contact [data-contact-copy-status]');
      await page.getByRole('button', { name: c.copy }).click();
      await expect(status).toHaveText(c.done);

      await page.evaluate(() => {
        document.execCommand = () => false;
      });
      await page.getByRole('button', { name: c.copy }).click();
      await expect(status).toHaveText(c.failed);
      expect(await page.evaluate(() => String(window.getSelection()))).toBe(email);
    });

    test('keyboard opens the form, which asks for name and message and does not claim a send', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/${locale}/`);
      const section = page.locator('#contact');
      await section.getByRole('link', { name: c.write }).focus();
      await page.keyboard.press('Tab');
      await expect(section.getByRole('button', { name: c.copy })).toBeFocused();
      await section.getByRole('link', { name: c.write }).focus();
      await page.keyboard.press('Enter');

      const form = section.locator('[data-contact-form]');
      await expect(form).toBeVisible();
      await expect(form.locator('input[name="name"]')).toBeFocused();
      await expect(form.locator('input, textarea')).toHaveCount(2);
      await expect(form.locator('textarea[name="message"]')).toBeVisible();
      await expect(form.getByRole('button', { name: c.send })).toBeVisible();
      const subject = await form.getAttribute('data-subject');
      expect(subject).toContain('{name}');
      expect(subject).toContain('vedmich.dev:');
      expect(subject).not.toMatch(/[\u2013\u2014]/);

      await form.locator('input[name="name"]').fill('Ada $& Lovelace');
      await page.keyboard.press('Tab');
      await page.keyboard.type('Hello, a question about your post.');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      const success = section.locator('[data-contact-success-wrapper]');
      await expect(success.getByRole('heading', { name: c.heading })).toBeVisible();
      await expect(success.getByRole('heading', { name: c.heading })).toBeFocused();
      const text = await success.innerText();
      expect(text).toContain(email);
      expect(text).not.toMatch(c.claimsSent);
      const draft = JSON.parse((await page.evaluate(() => sessionStorage.getItem('vv-contact-draft'))) ?? '{}');
      expect(draft.name).toBe('Ada $& Lovelace');
      expect(draft).not.toHaveProperty('email');

      await page.keyboard.press('Escape');
      await expect(section.getByRole('link', { name: c.write })).toBeFocused();
      expect(errors).toEqual([]);
    });

    for (const width of [320, 390, 1440]) {
      test(`contact section fits ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/`);
        await page.locator('#contact').scrollIntoViewIfNeeded();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test('contact keeps a working mailto fallback without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/');
  const section = page.locator('#contact');
  await expect(section.locator('[data-contact-address]')).toBeVisible();
  await expect(section.locator(`a[href="mailto:${email}"]`).first()).toBeVisible();
  await expect(section.getByRole('link', { name: 'Write an email' })).toBeVisible();
  await expect(section.getByRole('button', { name: 'Copy address' })).toBeHidden();
  await expect(section.locator('[data-contact-form-wrapper]')).toBeHidden();
  await context.close();
});
