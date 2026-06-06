/**
 * rivet intro-video capture spec.
 *
 * Drives the storyboard.json scenes against a running `rivet serve` instance
 * and records ONE continuous video via Playwright's built-in recordVideo.
 *
 * Why Playwright recordVideo (not ffmpeg x11grab / screen recorder):
 *   - Deterministic & headless: same output on a laptop and in CI, no display.
 *   - No extra binary beyond the browser Playwright already manages.
 *   - The viewport is fixed (1280x720) so framing never depends on the host.
 *
 * Why the CLI help is an in-browser HTML panel (not a real terminal recorder
 * like asciinema/ttyrec/vhs):
 *   - It stays in the SAME video stream, so there is one timeline to sync the
 *     narration against — no second capture tool, no second mux step.
 *   - It is deterministic: the help text is pinned in this file, so the frame
 *     does not reflow when a future `--help` adds a command (the spec would be
 *     updated deliberately, same as any other rivet Playwright test).
 *   - Trade-off: it is a faithful *render* of `rivet --help`, not a live PTY.
 *     If you want a real recorded terminal later, swap show_cli_help() for an
 *     <img>/<video> of an asciinema cast — the scene contract is unchanged.
 *
 * This file lives OUTSIDE tests/playwright on purpose: it is not part of the
 * regression suite (it produces an artifact, it does not assert behaviour) and
 * has its own playwright.config.ts in this directory.
 */
import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Scene = {
  id: string;
  action: string;
  hold_ms: number;
  narration: string;
};
type Storyboard = {
  meta: { base_url: string; viewport: { width: number; height: number } };
  scenes: Scene[];
};

// generate.sh writes a timing-fitted storyboard (hold_ms widened to each
// narration clip's real duration) to out/storyboard.timed.json and points us
// at it via $STORYBOARD, so the capture pacing matches the narration exactly.
// Falls back to the authored storyboard.json for a standalone `playwright test`.
const storyboardPath = process.env.STORYBOARD || join(__dirname, "storyboard.json");
const storyboard: Storyboard = JSON.parse(readFileSync(storyboardPath, "utf8"));

const BRAND_BG = "#0d1117";
const BRAND_FG = "#e6edf3";
const ACCENT = "#58a6ff";

/** Render a full-viewport branded HTML card (title / outro). */
async function card(
  page: import("@playwright/test").Page,
  heading: string,
  sub: string,
) {
  await page.setContent(`
    <html><body style="margin:0;height:100vh;display:flex;flex-direction:column;
      align-items:center;justify-content:center;background:${BRAND_BG};
      color:${BRAND_FG};font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      <div style="font-size:64px;font-weight:700;letter-spacing:-1px;">${heading}</div>
      <div style="font-size:28px;margin-top:16px;color:${ACCENT};">${sub}</div>
    </body></html>`);
}

/** Render a terminal-styled panel showing pinned `rivet --help` output. */
async function cliPanel(page: import("@playwright/test").Page) {
  // Pinned excerpt of `rivet --help` — update deliberately if the CLI changes.
  const help = [
    "$ rivet --help",
    "SDLC artifact traceability and validation",
    "",
    "Usage: rivet [OPTIONS] <COMMAND>",
    "",
    "Commands:",
    "  validate   Validate artifacts against schemas",
    "  coverage   Show traceability coverage report",
    "  list       List artifacts, optionally filtered by type",
    "  link       Add a link between two artifacts",
    "  audit      Audit AI-authored commits against ai-session artifacts",
    "  serve      Start the HTMX-powered dashboard server",
    "  ...        (run `rivet --help` for the full command list)",
  ].join("\n");
  await page.setContent(`
    <html><body style="margin:0;height:100vh;background:${BRAND_BG};
      display:flex;align-items:center;justify-content:center;">
      <pre style="background:#161b22;color:${BRAND_FG};padding:32px 40px;
        border-radius:10px;font-family:SF Mono,Menlo,Consolas,monospace;
        font-size:22px;line-height:1.45;box-shadow:0 8px 40px #0008;">${help
          .replace(/</g, "&lt;")
          .replace(
            /^\$ rivet --help$/m,
            `<span style="color:${ACCENT}">$ rivet --help</span>`,
          )}</pre>
    </body></html>`);
}

test("rivet intro video capture", async ({ page }) => {
  test.setTimeout(120_000);
  const { base_url } = storyboard.meta;
  // Record the dashboard in presentation mode (REQ-207 / #482): hides the
  // branch / "N uncommitted" / path / Reload+Print chrome so the published
  // video has clean frames regardless of the recording machine's git state.
  const CLEAN = "?presentation=1";

  for (const scene of storyboard.scenes) {
    switch (scene.action) {
      case "title_card":
        await card(page, "rivet", "bind traceability to your code");
        break;
      case "show_cli_help":
        await cliPanel(page);
        break;
      case "open_dashboard":
        await page.goto(`${base_url}/${CLEAN}`);
        await page.waitForLoadState("networkidle").catch(() => {});
        break;
      case "browse_artifacts":
        await page.goto(`${base_url}/artifacts${CLEAN}`);
        await page.locator("table").first().waitFor().catch(() => {});
        // Gentle scroll to show the list is long / real.
        await page.mouse.wheel(0, 400);
        break;
      case "open_artifact":
        await page.goto(`${base_url}/artifacts/REQ-001${CLEAN}`);
        await page.waitForLoadState("networkidle").catch(() => {});
        break;
      case "show_coverage":
        await page.goto(`${base_url}/coverage${CLEAN}`);
        await page.waitForLoadState("networkidle").catch(() => {});
        break;
      case "outro_card":
        await card(page, "rivet", "pulseengine.eu · open source · Rust");
        break;
      default:
        throw new Error(`unknown scene action: ${scene.action}`);
    }
    // Hold the scene on screen for its narration window.
    await page.waitForTimeout(scene.hold_ms);
  }
});
