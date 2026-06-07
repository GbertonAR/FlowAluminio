/**
 * @system     FlowAluminio
 * @module     playwright.config.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Configuración Playwright E2E — apunta a dev local
 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:        './e2e',
  timeout:        60_000,
  retries:        1,
  workers:        1,
  reporter:       'list',
  use: {
    baseURL:       'http://localhost:3000',
    headless:      true,
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    locale:        'es-AR',
    actionTimeout: 15_000,
  },
  projects: [
    {
      name:  'chromium',
      use:   { ...devices['Desktop Chrome'] },
    },
  ],
})
