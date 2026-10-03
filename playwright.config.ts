import { defineConfig } from '@playwright/test';

// Test production output. Never import node:test unit files or silently attach
// to a different worktree's dev server. Override the URL only deliberately.
const port = process.env.PLAYWRIGHT_PORT || '4323';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  retries: 2,
  fullyParallel: false,
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
