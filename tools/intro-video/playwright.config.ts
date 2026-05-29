import { defineConfig } from "@playwright/test";

/**
 * Standalone Playwright config for the intro-video capture.
 * Separate from tests/playwright/playwright.config.ts so the capture is never
 * run as part of the regression suite (it produces an artifact, not an
 * assertion) and so it can record video at a fixed 1280x720 framing.
 *
 * Outputs land in ./out/ (gitignored). The .webm Playwright writes is picked
 * up by generate.sh and remuxed.
 */
export default defineConfig({
  testDir: ".",
  testMatch: "capture.spec.ts",
  timeout: 120_000,
  retries: 0,
  workers: 1,
  outputDir: "./out/pw",
  use: {
    baseURL: "http://localhost:3003",
    viewport: { width: 1280, height: 720 },
    video: {
      mode: "on",
      size: { width: 1280, height: 720 },
    },
  },
  webServer: {
    command: "cargo run --release -- serve --port 3003",
    port: 3003,
    timeout: 180_000,
    reuseExistingServer: true,
    cwd: "../..",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
