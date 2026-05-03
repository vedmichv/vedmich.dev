// Playwright capture script for Phase 3 Plan 04 baseline screenshots.
// Captures 7 homepage sections (hero, about, podcasts, speaking, book, presentations, blog)
// at 2 viewports (1440×900 desktop, 375×812 mobile) = 14 PNGs.
// Each screenshot is element-scoped to `section#<id>` so framing is tight.
// Run: node .planning/phases/03-ui-polish/capture-baselines.mjs
//
// Usage:
//   node capture-baselines.mjs                -> baselines/
//   node capture-baselines.mjs after          -> after/
//   node capture-baselines.mjs after hero 1440 -> single file to after/

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://vedmich.dev/en/';
const SECTIONS = ['hero', 'about', 'podcasts', 'speaking', 'book', 'presentations', 'blog'];
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '375', width: 375, height: 812 },
];

const outDirArg = process.argv[2] || 'baselines';
const sectionFilter = process.argv[3] || null;
const viewportFilter = process.argv[4] || null;

const outDir = resolve(__dirname, outDirArg);

async function main() {
  console.log(`Launching chromium (headless)...`);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      if (viewportFilter && vp.name !== viewportFilter) continue;
      console.log(`\n== Viewport ${vp.name}×${vp.height} ==`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();

      // Hop to the page + wait for fonts + first paint.
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts?.ready);
      // Give IntersectionObserver a moment.
      await page.waitForTimeout(500);

      for (const sectionId of SECTIONS) {
        if (sectionFilter && sectionId !== sectionFilter) continue;

        const outFile = resolve(outDir, `${sectionId}-${vp.name}.png`);
        const selector = `section#${sectionId}`;

        // Scroll target into view, then wait for settling.
        await page.evaluate((id) => {
          const el = document.querySelector(`section#${id}`);
          if (!el) return false;
          el.scrollIntoView({ behavior: 'instant', block: 'start' });
          return true;
        }, sectionId);
        await page.waitForTimeout(1200); // let stagger cascade + 600ms fadeInUp settle

        // Force-unhide any .animate-on-scroll inside the section in case IntersectionObserver
        // didn't fire (e.g. if threshold 0.1 isn't met at the chosen scroll position) —
        // we want the final state, not the pre-animation state.
        await page.evaluate((id) => {
          const sec = document.querySelector(`section#${id}`);
          if (!sec) return;
          sec.querySelectorAll('.animate-on-scroll').forEach((el) => {
            el.classList.add('is-visible');
          });
        }, sectionId);
        await page.waitForTimeout(700); // post-add cascade + fade

        const locator = page.locator(selector);
        const count = await locator.count();
        if (count === 0) {
          console.warn(`  [skip] ${sectionId}-${vp.name}: no matching element`);
          continue;
        }
        await locator.first().screenshot({ path: outFile, animations: 'disabled' });
        const fs = await import('node:fs');
        const { size } = fs.statSync(outFile);
        console.log(`  ✓ ${sectionId}-${vp.name}.png (${Math.round(size / 1024)} KB)`);
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`\nDone. Output in: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
