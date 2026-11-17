// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for responsive visual regression testing.
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/responsive",
  testMatch: "**/*.test.js",

  // Fail the build on CI if CI env var is set
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  timeout: 60_000,

  // Reporter: human-friendly on CI, dot locally
  reporter: process.env.CI ? "github" : "list",

  use: {
    // Take screenshots after each test
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",

    // Base URL for tests
    baseURL: "http://localhost:8888",
  },

  // Use Chromium headless in CI
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start http-server to serve the built game before tests
  webServer: {
    command: "npx http-server dist -p 8888 -s",
    port: 8888,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
  },
});
