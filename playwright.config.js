// Playwright E2E config. Run: npx playwright test
// Start backend (npm start) and frontend (cd frontend && npm run dev) first, or set baseURL.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || (process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173'),
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.CI
    ? [
        { command: 'node index.js', url: 'http://localhost:3001', reuseExistingServer: false, timeout: 60000 },
        { command: 'npm run build && npm run preview', cwd: 'frontend', url: 'http://localhost:4173', reuseExistingServer: false, timeout: 120000 },
      ]
    : undefined,
});
