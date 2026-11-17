// @ts-check
import { test, expect } from "@playwright/test";

/**
 * Viewport configurations for responsive visual regression testing.
 * Each viewport size represents a target device/form factor.
 */
const VIEWPORTS = [
  { name: "375px", width: 375, height: 667, label: "iPhone SE (1st gen)" },
  { name: "430px", width: 430, height: 932, label: "iPhone 15 Pro Max" },
  { name: "768px", width: 768, height: 1024, label: "iPad Mini" },
  { name: "1024px", width: 1024, height: 1366, label: "iPad (standard)" },
  { name: "1366px", width: 1366, height: 768, label: "Laptop (typical)" },
];

/**
 * Wait for the game to initialize and render.
 * The game shows a "Start Game" button when the initial state is ready.
 */
async function waitForGame(page) {
  // Wait for the start button or any game content to appear
  await page.waitForSelector("#start-game-button, #game-content", {
    state: "visible",
    timeout: 30_000,
  });

  // Wait a bit more for any animations or async loading to settle
  await page.waitForTimeout(500);
}

/**
 * Capture a baseline or comparison screenshot of the game at a specific viewport.
 */
async function captureGameScreenshot(page, viewport, projectName) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  // Wait for the page to settle after viewport change
  await page.waitForTimeout(300);

  // Take the screenshot — Playwright's toHaveScreenshot handles comparison
  await expect(page).toHaveScreenshot(`${viewport.name}-game.png`, {
    fullPage: false,
    maxDiffPixelRatio: 0.05, // Allow 5% difference for font anti-aliasing in headless Chrome
  });
}

// Test each viewport size
for (const viewport of VIEWPORTS) {
  test(`responsive layout - ${viewport.label} (${viewport.width}x${viewport.height})`, async ({ page }) => {
    // Navigate to the game
    await page.goto("/");

    // Wait for the game to be ready
    await waitForGame(page);

    // Capture the screenshot
    await captureGameScreenshot(page, viewport, "responsive");
  });
}
