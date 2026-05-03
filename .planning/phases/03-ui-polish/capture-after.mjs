// One-off capture script for Phase 3 Plan 04 "after" screenshots.
// Points at http://localhost:4321/en/ (local Astro preview) instead of live vedmich.dev,
// since fixes haven't been pushed + deployed yet.
//
// Usage:
//   node .planning/phases/03-ui-polish/capture-after.mjs <section> <viewport>
// Examples:
//   node .planning/phases/03-ui-polish/capture-after.mjs about 1440
//   node .planning/phases/03-ui-polish/capture-after.mjs podcasts 375
//
// Saves to .planning/phases/03-ui-polish/after/{section}-{viewport}.png

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, 'after');

const BASE_URL = 'http://localhost:4321/en/';

const VIEWPORTS = {
  1440: { width: 1440, height: 900 },
  375: { width: 375, height: 812 },
};

const section = process.argv[2];
const viewport = process.argv[3];

if (!section || !viewport || !VIEWPORTS[viewport]) {
  console.error('Usage: node capture-after.mjs <section> <1440|375>');
  console.error('Valid sections: hero, about, podcasts, speaking, book, presentations, blog');
  process.exit(1);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: VIEWPORTS[viewport],
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(500);

    await page.evaluate((id) => {
      const el = document.querySelector(`section#${id}`);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      return true;
    }, section);
    await page.waitForTimeout(1200);

    await page.evaluate((id) => {
      const sec = document.querySelector(`section#${id}`);
      if (!sec) return;
      sec.querySelectorAll('.animate-on-scroll').forEach((el) => {
        el.classList.add('is-visible');
      });
    }, section);
    await page.waitForTimeout(700);

    const outFile = resolve(outDir, `${section}-${viewport}.png`);
    await page.locator(`section#${section}`).first().screenshot({
      path: outFile,
      animations: 'disabled',
    });
    const fs = await import('node:fs');
    console.log(`✓ ${outFile} (${Math.round(fs.statSync(outFile).size / 1024)} KB)`);

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
