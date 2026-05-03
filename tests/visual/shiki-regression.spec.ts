import { test, expect } from '@playwright/test';

/**
 * Phase 2 — Shiki + code-block regression gate (D-08, D-08b).
 *
 * Captures .prose-scoped screenshots on all 4 existing blog posts × 2 locales = 8 screenshots.
 * Baseline captured BEFORE any Shiki config change (Plan 02-01, Task 3).
 * Must pass on current main, re-capture after Plan 02-03 (badge wraps <pre>), and
 * again after Plan 02-04 (Deep Signal CSS overrides applied).
 *
 * Only 2 of 4 posts have code fences today (mcp-servers, karpenter-right-sizing);
 * the other 2 (hello-world, why-i-write-kubernetes-manifests-by-hand) serve as
 * regression anchors catching CSS leakage onto the wider .prose scope
 * (Pitfall 11, per RESEARCH.md §Q4).
 *
 * maxDiffPixels: 150 + maxDiffPixelRatio: 0.002 mirrors pod-lifecycle-parity.spec.ts.
 */

const posts = [
  'hello-world',
  '2026-02-10-why-i-write-kubernetes-manifests-by-hand',
  '2026-03-02-mcp-servers-plainly-explained',
  '2026-03-20-karpenter-right-sizing',
] as const;

const locales = ['en', 'ru'] as const;

test.describe('Shiki + code-block regression — .prose parity on 4 posts × 2 locales', () => {
  for (const locale of locales) {
    for (const slug of posts) {
      test(`${locale}/${slug} — .prose matches baseline`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(`/${locale}/blog/${slug}`);

        const prose = page.locator('article .prose').first();
        await prose.waitFor({ state: 'visible' });

        // WOFF2 settle — Inter/Space Grotesk/JetBrains Mono load async.
        await page.waitForTimeout(300);

        await expect(prose).toHaveScreenshot(`shiki-regression-${slug}-${locale}.png`, {
          maxDiffPixels: 150,
          maxDiffPixelRatio: 0.002,
          animations: 'disabled',
        });
      });
    }
  }
});
