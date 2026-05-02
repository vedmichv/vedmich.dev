import { defineConfig } from '@playwright/test';

/**
 * Playwright config for vedmich.dev visual + DOM regression tests.
 * - reducedMotion: 'reduce' globally → deterministic frozen state for SMIL packets,
 *   eliminating time-dependent flakiness in pod-lifecycle-parity.spec.ts.
 * - webServer: boots `npm run dev` on :4321 for local runs; re-uses an existing dev
 *   server when one is already running (CI never reuses).
 * - snapshotDir: colocated with the spec as `tests/visual/__snapshots__/<spec-name>/`.
 */
export default defineConfig({
  testDir: './tests',
  retries: 2,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:4321',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
