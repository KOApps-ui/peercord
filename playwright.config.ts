import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '.qa',
  testMatch: ['channel.spec.ts', 'explore.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5181',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev --host 0.0.0.0 --port 5181',
    url: 'http://localhost:5181',
    reuseExistingServer: true,
    timeout: 120000,
  },
})