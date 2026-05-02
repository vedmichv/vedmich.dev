import { test, expect } from '@playwright/test';

/**
 * Phase 1 — PodLifecycleAnimation refactor pixel-parity gate.
 *
 * Baseline captured from PRE-refactor component (Wave 0, before primitives exist).
 * This test must PASS on the pre-refactor build (baseline matches itself) AND must
 * PASS again on the post-refactor build (primitive-based component renders identically).
 *
 * Why reducedMotion: the SMIL <animateMotion> packets cycle every ~5s; a
 * mid-animation screenshot is time-dependent. reducedMotion: 'reduce' hides the
 * packets (display: none per @media query) and freezes nodes at opacity 1, wires
 * at opacity 0.55 — deterministic across runs. This is D-18's WCAG-compliant state.
 *
 * maxDiffPixels: 150 + maxDiffPixelRatio: 0.002 chosen per RESEARCH.md §D-19 to
 * tolerate font-rendering variance between macOS and Ubuntu CI runners (~30-50 px).
 */
test.describe('PodLifecycleAnimation refactor — pixel parity', () => {
  test('reduced-motion frozen state matches baseline', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/blog/2026-03-20-karpenter-right-sizing');

    // Figure is currently .pod-lifecycle (pre-refactor) or .vv-stage (post-refactor)
    const figure = page.locator('figure.pod-lifecycle, figure.vv-stage').first();
    await figure.waitFor({ state: 'visible' });

    // 300ms settle for font loading — Inter/Space Grotesk/JetBrains Mono are WOFF2
    await page.waitForTimeout(300);

    await expect(figure).toHaveScreenshot('pod-lifecycle-frozen.png', {
      maxDiffPixels: 150,
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    });
  });
});
