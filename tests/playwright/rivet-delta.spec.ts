import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Pipeline test for `.github/workflows/rivet-delta.yml` output.
 *
 * Invokes `scripts/diff-to-markdown.mjs` with fixture diff + impact JSON,
 * renders the resulting markdown in a real browser, and asserts that every
 * piece the reviewer is supposed to see — counts, changed IDs, the mermaid
 * diagram, the collapsible impact list, the workflow-artifact link — is
 * actually visible and clickable. This pins the "what we ship back to the
 * PR is usable" contract that the user called out.
 */
const REPO_ROOT = join(__dirname, "..", "..");

/** Minimal HTML shell that renders a markdown body via `marked` + `mermaid`. */
function harness(bodyHtml: string, mermaidSource: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>rivet-delta preview</title>
  <style>
    body { font: 14px/1.5 -apple-system, sans-serif; margin: 2rem; max-width: 960px; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; }
    details { margin: .5rem 0; }
    summary { cursor: pointer; font-weight: 600; }
    .mermaid-diagram { border: 1px solid #eee; padding: 1rem; margin: 1rem 0; }
  </style>
</head>
<body>
  <article id="body">${bodyHtml}</article>
  ${
    mermaidSource
      ? `<div class="mermaid-diagram" id="diagram" data-source="${encodeURIComponent(mermaidSource)}"></div>`
      : ""
  }
</body>
</html>`;
}

/** Very light markdown → HTML: enough for the checks below. We intentionally
 * avoid pulling in a full markdown library to keep the test self-contained.
 */
function mdToHtml(md: string): string {
  let html = md;
  // Fenced blocks (keep as <pre><code>).
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre><code class="language-${lang || "text"}">${escape(code.trim())}</code></pre>`,
  );
  // Headings.
  html = html.replace(/^(#{1,6}) (.+)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text.trim()}</h${level}>`;
  });
  // Tables — leave source rows and join with <br/>; the tests only check for
  // substrings, so a faithful table render isn't required here.
  // Inline code.
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold.
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Images (must come before links — `![alt](url)` would otherwise be
  // partly consumed by the link regex as `[alt](url)`).
  html = html.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2">',
  );
  // Links.
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );
  // Paragraphs from double-newlines.
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (/^<(h\d|table|pre|details|ul|ol|blockquote)/.test(block.trim())) {
        return block;
      }
      return `<p>${block.trim()}</p>`;
    })
    .join("\n");
  return html;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Extract the mermaid source from a rendered markdown body so we can
 * separately verify the diagram parses with the real mermaid.js parser.
 */
function extractMermaid(md: string): string {
  const m = md.match(/```mermaid\n([\s\S]*?)```/);
  return m ? m[1].trim() : "";
}

function runDiffToMarkdown(
  diff: unknown,
  impact: unknown,
  opts: {
    pr?: string;
    run?: string;
    repo?: string;
    mmdOut?: string;
    svgUrl?: string;
  } = {},
): string {
  const dir = mkdtempSync(join(tmpdir(), "rivet-delta-test-"));
  const diffPath = join(dir, "diff.json");
  const impactPath = join(dir, "impact.json");
  writeFileSync(diffPath, JSON.stringify(diff));
  writeFileSync(impactPath, JSON.stringify(impact));
  const args = [
    "scripts/diff-to-markdown.mjs",
    "--diff",
    diffPath,
    "--impact",
    impactPath,
    "--pr",
    opts.pr ?? "42",
    "--run",
    opts.run ?? "101",
    "--repo",
    opts.repo ?? "pulseengine/rivet",
  ];
  if (opts.mmdOut) args.push("--mmd-out", opts.mmdOut);
  if (opts.svgUrl) args.push("--svg-url", opts.svgUrl);
  return execFileSync("node", args, { cwd: REPO_ROOT, encoding: "utf8" });
}

test.describe("rivet-delta PR-comment output", () => {
  test("shipping summary is present when artifacts change", async ({
    page,
  }) => {
    const diff = {
      added: ["REQ-NEW-1"],
      removed: ["OLD-1"],
      modified: [
        {
          id: "REQ-1",
          status_changed: [null, "approved"],
          title_changed: null,
          description_changed: false,
          tags_added: ["stpa"],
          tags_removed: [],
          links_added: [{ link_type: "verifies", target: "REQ-2" }],
          links_removed: [],
        },
      ],
      summary: "1 added, 1 removed, 1 modified",
    };
    const impact = {
      impacted: [
        {
          id: "TEST-1",
          title: "T",
          depth: 1,
          reason: ["verifies REQ-1"],
        },
      ],
    };
    const md = runDiffToMarkdown(diff, impact);

    // Structural asserts on the markdown source before even rendering.
    expect(md).toContain("<!-- rivet-delta-bot -->");
    expect(md).toContain("## 📐 Rivet artifact delta");
    expect(md).toMatch(/\| Added \| 1 \|/);
    expect(md).toMatch(/\| Removed \| 1 \|/);
    expect(md).toMatch(/\| Modified \| 1 \|/);
    expect(md).toContain("```mermaid");
    expect(md).toContain("REQ-NEW-1");
    expect(md).toContain("OLD-1");
    expect(md).toContain("rivet-delta-pr-42");
    expect(md).toContain("actions/runs/101");

    // Render and check visibility in the browser.
    const mermaidSrc = extractMermaid(md);
    await page.setContent(harness(mdToHtml(md), mermaidSrc));

    await expect(
      page.locator("h2", { hasText: "Rivet artifact delta" }),
    ).toBeVisible();
    await expect(
      page
        .locator("code:not(.language-mermaid)", { hasText: "REQ-NEW-1" })
        .first(),
    ).toBeVisible();
    await expect(
      page.locator("details summary", { hasText: "Modified" }),
    ).toBeVisible();

    // The workflow-artifact link must be clickable and point at the
    // right GitHub URL.
    const link = page.locator("a", { hasText: "download from the workflow" });
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/pulseengine/rivet/actions/runs/101",
    );

    // Expand the "Modified" details block and verify the status
    // transition shows up.
    await page.locator("details summary", { hasText: "Modified" }).click();
    await expect(page.locator("article")).toContainText("approved");
  });

  test("empty diff emits the no-change sentinel, not a blank comment", async ({
    page,
  }) => {
    const diff = { added: [], removed: [], modified: [], summary: "0/0/0" };
    const impact = { impacted: [] };
    const md = runDiffToMarkdown(diff, impact);

    expect(md).toContain("<!-- rivet-delta-bot -->");
    expect(md).toContain("No artifact changes in this PR");
    // Must NOT include a mermaid block when there's nothing to show.
    expect(md).not.toContain("```mermaid");

    await page.setContent(harness(mdToHtml(md), ""));
    await expect(page.locator("article")).toContainText(
      "No artifact changes in this PR",
    );
  });

  test("malformed diff JSON produces a warning, not a crash", async ({
    page,
  }) => {
    // Simulate the workflow's `continue-on-error` path where diff.json
    // doesn't exist or is invalid — the script must produce the warning
    // sentinel instead of throwing.
    const dir = mkdtempSync(join(tmpdir(), "rivet-delta-test-"));
    const diffPath = join(dir, "diff.json");
    writeFileSync(diffPath, "{not-json-at-all");
    const md = execFileSync(
      "node",
      [
        "scripts/diff-to-markdown.mjs",
        "--diff",
        diffPath,
        "--pr",
        "99",
        "--run",
        "1",
        "--repo",
        "pulseengine/rivet",
      ],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );

    expect(md).toContain("<!-- rivet-delta-bot -->");
    expect(md).toContain("Diff could not be computed");

    await page.setContent(harness(mdToHtml(md), ""));
    await expect(page.locator("article")).toContainText(
      "Diff could not be computed",
    );
  });

  test("mermaid source parses with the bundled mermaid parser", async ({
    page,
  }) => {
    // Run the real mermaid parser against the script's diagram. If the
    // script ever emits bad mermaid syntax (broken edge format,
    // unescaped quotes in labels), this test catches it in CI before a
    // reviewer sees a broken diagram on a PR.
    const diff = {
      added: Array.from({ length: 5 }, (_, i) => `A-${i}`),
      removed: Array.from({ length: 3 }, (_, i) => `R-${i}`),
      modified: Array.from({ length: 2 }, (_, i) => ({
        id: `M-${i}`,
        status_changed: [null, "done"],
        title_changed: null,
        description_changed: false,
        tags_added: [],
        tags_removed: [],
        links_added: [{ link_type: "depends-on", target: `T-${i}` }],
        links_removed: [],
      })),
      summary: "5 added, 3 removed, 2 modified",
    };
    const md = runDiffToMarkdown(diff, { impacted: [] });
    const mermaidSrc = extractMermaid(md);
    expect(mermaidSrc.length).toBeGreaterThan(0);

    // Use the project's bundled mermaid (served by `rivet serve` at
    // /assets/mermaid.js) so the parser version matches production.
    // Navigate first so <script src="/assets/mermaid.js"> resolves
    // against the dev server instead of about:blank.
    await page.goto("/");
    await page.setContent(`
      <!doctype html><html><body>
        <pre class="mermaid">${mermaidSrc
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")}</pre>
        <script src="/assets/mermaid.js"></script>
        <script>
          window.mermaid.initialize({ startOnLoad: false });
          window.__parsed = false;
          window.mermaid
            .parse(${JSON.stringify(mermaidSrc)})
            .then(() => { window.__parsed = true; })
            .catch((e) => { window.__parseError = String(e); });
        </script>
      </body></html>`);

    // Wait for either success or failure.
    await page.waitForFunction(
      () => "__parsed" in window || "__parseError" in window,
      { timeout: 5_000 },
    );
    const parsed = await page.evaluate(() => (window as any).__parsed);
    const err = await page.evaluate(() => (window as any).__parseError);
    expect(err, `mermaid parse error: ${err}`).toBeUndefined();
    expect(parsed).toBe(true);
  });

  test("mermaid graph caps at 30 nodes with overflow marker", async ({
    page,
  }) => {
    const diff = {
      added: Array.from({ length: 50 }, (_, i) => `A-${i}`),
      removed: [],
      modified: [],
      summary: "50 added",
    };
    const md = runDiffToMarkdown(diff, { impacted: [] });
    const mermaid = extractMermaid(md);
    // The overflow sentinel node must appear when truncation kicks in.
    expect(mermaid).toContain("overflow");
    expect(mermaid).toContain("+20 more");
  });

  test("artifact IDs with markdown metacharacters are escaped, not interpreted", async ({
    page,
  }) => {
    // Regression guard: a deliberately hostile artifact ID must not break
    // out of the comment structure (no surprise bold, no broken table).
    const diff = {
      added: ["REQ-*evil*"],
      removed: [],
      modified: [
        {
          id: "REQ-|pipe|",
          status_changed: null,
          title_changed: null,
          description_changed: true,
          tags_added: [],
          tags_removed: [],
          links_added: [],
          links_removed: [],
        },
      ],
      summary: "hostile",
    };
    const md = runDiffToMarkdown(diff, { impacted: [] });
    // The `*` must be escaped in the backtick-free positions. Inside a
    // code span (backticks) the `*` is already literal, but it must not
    // appear raw anywhere else.
    expect(md).toMatch(/\\\*evil\\\*|`REQ-\*evil\*`/);
    // The pipe in the modified row must be escaped so the table stays
    // structurally sound.
    expect(md).toContain("REQ-\\|pipe\\|");
  });

  // v0.4.3: the second-pass --svg-url invocation must emit an <img>
  // reference above the mermaid block so the diagram renders in email
  // notifications and the GitHub mobile app (both show ```mermaid
  // fenced blocks as raw source otherwise). The interactive mermaid
  // block stays available in a collapsed <details> for GitHub web.
  test("svg-url flag injects image above the mermaid block", async ({
    page,
  }) => {
    const diff = {
      added: ["REQ-X"],
      removed: [],
      modified: [],
      summary: "1 added",
    };
    const svgUrl =
      "https://raw.githubusercontent.com/pulseengine/rivet/rivet-delta-renders/pr-42/run-101/diagram.svg";
    const md = runDiffToMarkdown(diff, { impacted: [] }, { svgUrl });

    // Image must appear BEFORE the mermaid block — email clients that
    // strip the mermaid source as plain text still show the image.
    const imgIndex = md.indexOf(`![Rivet artifact delta graph](${svgUrl})`);
    const mermaidIndex = md.indexOf("```mermaid");
    expect(imgIndex).toBeGreaterThan(-1);
    expect(mermaidIndex).toBeGreaterThan(imgIndex);

    // Mermaid must now be inside a <details> so it collapses on the web
    // UI and doesn't duplicate the image visually.
    expect(md).toContain("<details><summary>Interactive graph (mermaid source)");

    // Render and verify the image tag is present in the DOM.
    await page.setContent(`<html><body>${mdToHtml(md)}</body></html>`);
    const img = page.locator("img[alt='Rivet artifact delta graph']");
    await expect(img).toHaveAttribute("src", svgUrl);
  });

  test("classification priority: added wins over modified when duplicated", async () => {
    // Regression: v0.4.2 PR #192 delta showed a newly-added artifact
    // (REQ-060) as "modified" yellow because the mermaid node map was
    // built with modified last, overwriting the added entry. Fix: build
    // modified first, then added/removed last so terminal classes win.
    const diff = {
      added: ["NEW-1"],
      removed: ["OLD-1"],
      // Deliberately duplicate NEW-1 in modified to simulate any upstream
      // pipeline oddity that puts the same ID in two lists.
      modified: [
        {
          id: "NEW-1",
          status_changed: null,
          title_changed: null,
          description_changed: true,
          tags_added: [],
          tags_removed: [],
          links_added: [],
          links_removed: [],
        },
      ],
      summary: "duplicate",
    };
    const md = runDiffToMarkdown(diff, { impacted: [] });
    const mermaid = extractMermaid(md);
    // NEW-1 must be coloured as "added" (terminal), not "modified".
    expect(mermaid).toMatch(/NEW_1\["NEW-1"\]:::added/);
  });

  test("mmd-out flag writes the mermaid source to a file", async () => {
    const diff = {
      added: ["REQ-Y"],
      removed: [],
      modified: [],
      summary: "1 added",
    };
    const dir = mkdtempSync(join(tmpdir(), "rivet-delta-mmdout-"));
    const mmdOut = join(dir, "diagram.mmd");
    runDiffToMarkdown(diff, { impacted: [] }, { mmdOut });

    // The file must exist and contain raw mermaid source (no fences).
    const body = readFileSync(mmdOut, "utf8");
    expect(body.trim().startsWith("graph LR")).toBe(true);
    expect(body).not.toContain("```");
    expect(body).toContain("REQ_Y");
  });
});
