/**
 * Tests for `rivet export --format html` output.
 *
 * These tests run the export command, then verify the generated static
 * HTML files exist and contain expected content. They do NOT use the
 * live server — they read files from disk directly.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";

// Project root is two levels up from tests/playwright/
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const EXPORT_DIR = path.join(PROJECT_ROOT, "dist-playwright-test");

test.describe("HTML Export", () => {
  // Run export once before all tests in this suite
  test.beforeAll(async () => {
    // Clean up any previous export
    if (fs.existsSync(EXPORT_DIR)) {
      fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
    }

    const result = child_process.spawnSync(
      "cargo",
      [
        "run",
        "--release",
        "--",
        "export",
        "--format",
        "html",
        "--output",
        EXPORT_DIR,
      ],
      {
        cwd: PROJECT_ROOT,
        timeout: 120_000,
        encoding: "utf8",
      },
    );

    if (result.status !== 0) {
      throw new Error(
        `Export failed (exit ${result.status}):\n${result.stderr}`,
      );
    }
  });

  test.afterAll(async () => {
    // Clean up after tests
    if (fs.existsSync(EXPORT_DIR)) {
      fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
    }
  });

  // ── File existence ──────────────────────────────────────────────────

  test("index.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "index.html"))).toBe(true);
  });

  test("artifacts/index.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "artifacts", "index.html")),
    ).toBe(true);
  });

  test("validate/index.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "validate", "index.html")),
    ).toBe(true);
  });

  test("documents/index.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "documents", "index.html")),
    ).toBe(true);
  });

  test("matrix/index.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "matrix", "index.html"))).toBe(
      true,
    );
  });

  test("coverage/index.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "coverage", "index.html")),
    ).toBe(true);
  });

  test("graph/index.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "graph", "index.html"))).toBe(
      true,
    );
  });

  test("help/index.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "help", "index.html"))).toBe(
      true,
    );
  });

  test("help/schema/index.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "help", "schema", "index.html")),
    ).toBe(true);
  });

  test("help/links.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "help", "links.html"))).toBe(
      true,
    );
  });

  test("help/rules.html exists", async () => {
    expect(fs.existsSync(path.join(EXPORT_DIR, "help", "rules.html"))).toBe(
      true,
    );
  });

  // ── Content checks ──────────────────────────────────────────────────

  test("index.html contains HTML boilerplate", async () => {
    const html = fs.readFileSync(path.join(EXPORT_DIR, "index.html"), "utf8");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
    expect(html).not.toContain("thread 'main' panicked");
    expect(html).not.toContain("500 Internal Server Error");
  });

  test("index.html has project title", async () => {
    const html = fs.readFileSync(path.join(EXPORT_DIR, "index.html"), "utf8");
    // Title format: "{Page} — {project_name} — Rivet"
    expect(html).toContain("Rivet");
    expect(html).toContain("<title>");
  });

  test("artifacts/index.html lists artifacts", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "artifacts", "index.html"),
      "utf8",
    );
    expect(html).toContain("Artifacts");
    // Should contain a table with artifact rows (paginated, so just check structure)
    expect(html).toContain("<table");
    expect(html).toContain("<tbody");
    // Should contain at least one artifact link pattern (root-relative hrefs)
    expect(html).toMatch(/href="\/artifacts\/[A-Z]/);
  });

  test("coverage/index.html contains coverage content", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "coverage", "index.html"),
      "utf8",
    );
    expect(html).toContain("Coverage");
    // Should not be a blank page
    expect(html.length).toBeGreaterThan(1000);
  });

  test("help/index.html contains help overview content", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "help", "index.html"),
      "utf8",
    );
    expect(html).toContain("Help");
    expect(html).toContain("Schema Types");
  });

  test("help/links.html contains link types", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "help", "links.html"),
      "utf8",
    );
    expect(html).toContain("Link Types");
    expect(html).toContain("verifies");
  });

  test("validate/index.html contains validation content", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "validate", "index.html"),
      "utf8",
    );
    expect(html).toContain("Validation");
    expect(html.length).toBeGreaterThan(1000);
  });

  // ── Per-artifact detail pages ────────────────────────────────────────

  test("REQ-001 artifact detail page exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "artifacts", "REQ-001.html")),
    ).toBe(true);
  });

  test("REQ-001 artifact detail page has artifact content", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "artifacts", "REQ-001.html"),
      "utf8",
    );
    expect(html).toContain("REQ-001");
    expect(html).not.toContain("thread 'main' panicked");
  });

  test("multiple artifact detail pages are generated", async () => {
    const artifactsDir = path.join(EXPORT_DIR, "artifacts");
    const htmlFiles = fs
      .readdirSync(artifactsDir)
      .filter((f) => f.endsWith(".html") && f !== "index.html");
    // Should have at least as many files as known artifact prefixes suggest
    expect(htmlFiles.length).toBeGreaterThan(50);
  });

  // ── Per-schema-type help pages ────────────────────────────────────────

  test("help/schema/requirement.html exists", async () => {
    expect(
      fs.existsSync(path.join(EXPORT_DIR, "help", "schema", "requirement.html")),
    ).toBe(true);
  });

  test("help/schema/requirement.html contains type info", async () => {
    const html = fs.readFileSync(
      path.join(EXPORT_DIR, "help", "schema", "requirement.html"),
      "utf8",
    );
    expect(html).toContain("requirement");
    // Should have the back-link to schema list
    expect(html).toContain("schema");
  });

  // ── No server errors in any page ─────────────────────────────────────

  test("no exported page contains a server panic", async () => {
    const panicPattern = "thread 'main' panicked";
    const walk = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          files.push(...walk(full));
        } else if (e.name.endsWith(".html")) {
          files.push(full);
        }
      }
      return files;
    };
    const allFiles = walk(EXPORT_DIR);
    expect(allFiles.length).toBeGreaterThan(10);
    for (const f of allFiles) {
      const content = fs.readFileSync(f, "utf8");
      expect(content, `Panic found in ${f}`).not.toContain(panicPattern);
    }
  });
});
