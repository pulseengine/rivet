import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  // 60s per-test timeout: /graph with the dogfood dataset (742 nodes, 1477
  // edges) takes ~25-30s for synchronous layout + SVG generation in
  // render_graph_view, leaving <5s for the .toBeVisible() assertion under
  // the previous 30s budget. CI runner load makes this tighter still.
  timeout: 60_000,
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
