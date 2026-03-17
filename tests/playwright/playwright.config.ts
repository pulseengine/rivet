import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // serial — single server instance
  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "cargo run --release -- serve --port 3003",
    port: 3003,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    cwd: "../..",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
