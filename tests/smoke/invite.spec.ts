import { test, expect } from '@playwright/test';

// The organizer path on /speaking/. The mailto link is a local handoff: nothing is sent from the page.
const email = 'viktor@vedmich.dev';

const strings = {
  en: {
    title: 'Invite me to speak',
    cta: 'Write about a talk',
    subject: 'vedmich.dev: speaking invitation',
    topics: 4,
    formats: ['Talk', 'Chalk talk', 'Workshop'],
    languages: ['English', 'Russian'],
    kit: 'Speaker kit',
    download: 'Download photo',
    copy: 'Copy',
    copied: 'Copied',
    done: (words: string, language: string) => `Copied: ${words}, ${language}`,
    failed: 'Could not copy. Select the text and copy it by hand.',
    cards: [
      { id: 'bio-en-short', label: '50 words · English', words: 50, lang: 'en', copyName: 'Copy the bio: 50 words, English' },
      { id: 'bio-en-long', label: '100 words · English', words: 100, lang: 'en', copyName: 'Copy the bio: 100 words, English' },
      { id: 'bio-ru-short', label: '50 words · Russian', words: 50, lang: 'ru', copyName: 'Copy the bio: 50 words, Russian' },
      { id: 'bio-ru-long', label: '100 words · Russian', words: 100, lang: 'ru', copyName: 'Copy the bio: 100 words, Russian' },
    ],
  },
  ru: {
    title: 'Пригласить выступить',
    cta: 'Написать про выступление',
    subject: 'vedmich.dev: приглашение выступить',
    topics: 4,
    formats: ['Доклад', 'Chalk talk', 'Воркшоп'],
    languages: ['Английский', 'Русский'],
    kit: 'Материалы спикера',
    download: 'Скачать фото',
    copy: 'Копировать',
    copied: 'Скопировано',
    done: (words: string, language: string) => `Скопировано: ${words}, ${language}`,
    failed: 'Не получилось скопировать. Выдели текст и скопируй вручную.',
    cards: [
      { id: 'bio-ru-short', label: '50 слов · русский', words: 50, lang: 'ru', copyName: 'Копировать биографию: 50 слов, русский' },
      { id: 'bio-ru-long', label: '100 слов · русский', words: 100, lang: 'ru', copyName: 'Копировать биографию: 100 слов, русский' },
      { id: 'bio-en-short', label: '50 слов · английский', words: 50, lang: 'en', copyName: 'Копировать биографию: 50 слов, английский' },
      { id: 'bio-en-long', label: '100 слов · английский', words: 100, lang: 'en', copyName: 'Копировать биографию: 100 слов, английский' },
    ],
  },
} as const;

const wordCount = (text: string) => text.trim().split(/\s+/).length;

for (const locale of ['en', 'ru'] as const) {
  const s = strings[locale];

  test.describe(`${locale}: invite block and speaker kit`, () => {
    test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

    test('lists topics, formats and languages and links to the block from the top of the page', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const invite = page.locator('#invite');
      await expect(invite.getByRole('heading', { level: 2, name: s.title })).toBeVisible();
      await expect(invite.locator('[data-invite-details] dd').nth(0).locator('li')).toHaveCount(s.topics);
      await expect(invite.locator('[data-invite-details] dd').nth(1).locator('li')).toHaveText([...s.formats]);
      await expect(invite.locator('[data-invite-details] dd').nth(2).locator('li')).toHaveText([...s.languages]);
      // The page head links down to the block.
      await expect(page.locator('main a[href="#invite"]')).toContainText(s.title);
    });

    test('the mail button opens the visitor\'s mail app with a prefilled subject and nothing is sent', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const cta = page.locator('#invite').getByRole('link', { name: s.cta });
      await expect(cta).toBeVisible();
      const href = (await cta.getAttribute('href'))!;
      expect(href.startsWith(`mailto:${email}?`)).toBe(true);
      const url = new URL(href);
      expect(url.pathname).toBe(email);
      expect(url.searchParams.get('subject')).toBe(s.subject);
      expect(url.searchParams.get('body') ?? '').not.toBe('');
      // The address in the lede is a mailto link too.
      await expect(page.locator('#invite').locator(`a[href^="mailto:${email}"]`).first()).toHaveText(email);
      // A plain click is a navigation to mailto:, handled by the mail app; the page stays put.
      await expect(page.locator('#invite')).not.toContainText(/\bsent\b|отправлен/i);
    });

    test('the kit offers four bios of 50 and 100 words in both languages', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const kit = page.locator('[data-speaker-kit]');
      await expect(kit.getByRole('heading', { level: 3, name: s.kit })).toBeVisible();
      await expect(kit.locator('[data-bio-card]')).toHaveCount(4);
      for (const [index, card] of s.cards.entries()) {
        const element = kit.locator('[data-bio-card]').nth(index);
        await expect(element).toContainText(card.label);
        const bio = element.locator(`#${card.id}`);
        await expect(bio).toHaveAttribute('lang', card.lang);
        expect(wordCount((await bio.textContent())!)).toBe(card.words);
      }
    });

    test('each copy button puts its bio on the clipboard and announces it', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const status = page.locator('[data-kit-status]');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      await expect(status).toHaveAttribute('role', 'status');
      const buttons = page.locator('[data-copy-bio]');
      await expect(buttons).toHaveCount(4);
      for (const card of s.cards) {
        const button = page.getByRole('button', { name: card.copyName });
        await expect(button).toBeVisible();
        await expect(button).toContainText(s.copy);
        await button.click();
        const [words, language] = card.label.split(' · ');
        await expect(status).toHaveText(s.done(words, language));
        const expected = (await page.locator(`#${card.id}`).textContent())!.trim();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
        await expect(button).toBeFocused();
        // The button itself confirms the copy, so the result is visible next to the finger on a phone.
        await expect(button).toHaveText(s.copied);
      }
    });

    test('copy works from the keyboard', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const button = page.getByRole('button', { name: s.cards[0].copyName });
      await button.focus();
      await page.keyboard.press('Enter');
      const [words, language] = s.cards[0].label.split(' · ');
      await expect(page.locator('[data-kit-status]')).toHaveText(s.done(words, language));
    });

    test('copy falls back without the Clipboard API and reports a failure', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      });
      await page.goto(`/${locale}/speaking/`);
      const card = s.cards[1];
      const [words, language] = card.label.split(' · ');
      const status = page.locator('[data-kit-status]');
      await page.getByRole('button', { name: card.copyName }).click();
      await expect(status).toHaveText(s.done(words, language));

      await page.evaluate(() => {
        document.execCommand = () => false;
      });
      await page.getByRole('button', { name: card.copyName }).click();
      await expect(status).toHaveText(s.failed);
      const selected = await page.evaluate(() => String(window.getSelection()));
      expect(selected.trim()).toBe((await page.locator(`#${card.id}`).textContent())!.trim());
    });

    test('the photo link downloads the full-size JPEG', async ({ page }) => {
      await page.goto(`/${locale}/speaking/`);
      const link = page.locator('[data-speaker-kit]').getByRole('link', { name: s.download });
      await expect(link).toHaveAttribute('href', '/images/viktor-vedmich-speaker.jpg');
      await expect(link).toHaveAttribute('download', /\.jpg$/);
      const response = await page.request.get('/images/viktor-vedmich-speaker.jpg');
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/jpeg');
      const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
      expect(download.suggestedFilename()).toBe('viktor-vedmich-speaker.jpg');
    });

    test('the block fits a phone and the kit stays in one column', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(`/${locale}/speaking/`);
      await page.locator('#invite').scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const boxes = await page.locator('[data-bio-card]').evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().left));
      expect(new Set(boxes.map(Math.round)).size).toBe(1);
      // The download button wraps under the photo instead of squeezing it.
      const photo = (await page.locator('[data-speaker-kit] img').boundingBox())!;
      expect(photo.width).toBeGreaterThanOrEqual(90);
    });
  });
}

test('without JavaScript the bios, the mail button and the photo link still work and the copy buttons stay hidden', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en/speaking/');
  await expect(page.locator('#invite').getByRole('link', { name: 'Write about a talk' })).toBeVisible();
  await expect(page.locator('#bio-en-short')).toBeVisible();
  await expect(page.locator('#bio-ru-long')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download photo' })).toBeVisible();
  await expect(page.locator('[data-copy-bio]').first()).toBeHidden();
  await context.close();
});
