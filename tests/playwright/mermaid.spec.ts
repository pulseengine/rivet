import { test, expect } from "@playwright/test";

// Regression coverage for the fenced-mermaid HTML-escaping bug (reported
// against v0.6.0 and v0.8.0): `render_markdown` passed the body of a
// ```mermaid fenced block through pulldown-cmark's `html::push_html`, which
// HTML-entity-escapes Text events — turning mermaid's core `-->` arrow into
// `--&gt;` (and class-diagram `<|--` into `&lt;|--`). mermaid.js then failed
// with "Syntax error in text" and the diagram never rendered.
//
// ARCH-CORE-001 in artifacts/architecture.yaml carries two real ```mermaid
// blocks in its description — a `flowchart LR` (uses `-->`) and a
// `stateDiagram-v2` (uses `[*] -->`, the exact shape from the bug report) —
// so it doubles as the end-to-end fixture across diagram types.

test.describe("Mermaid diagram rendering", () => {
  test("fenced mermaid bodies are emitted verbatim — arrows not HTML-escaped", async ({
    request,
  }) => {
    // Raw HTML response: no JS runs, so mermaid.js hasn't transformed the
    // <pre> elements yet — we see exactly what render_markdown produced.
    const res = await request.get("/artifacts/ARCH-CORE-001");
    expect(res.status()).toBe(200);
    const html = await res.text();

    // Two <pre class="mermaid"> blocks (flowchart + state diagram).
    const preCount = (html.match(/<pre class="mermaid">/g) ?? []).length;
    expect(preCount).toBeGreaterThanOrEqual(2);

    // Escaping-sensitive tokens must survive verbatim in both diagrams.
    expect(html).toContain("Config --> Store"); // flowchart arrow
    expect(html).toContain("[*] --> Loading"); // stateDiagram start-state arrow
    expect(html).toContain("Validating --> Serving : graph built");

    // ...and nothing in the page may be entity-escaped.
    expect(html).not.toContain("--&gt;");
    expect(html).not.toContain("&lt;|");
  });

  test("mermaid.js renders both diagrams to SVG with no syntax error", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-CORE-001");

    // mermaid (startOnLoad) parses each .mermaid element's text and replaces
    // it with an inline <svg>. mermaid SVGs carry an aria-roledescription
    // like "flowchart-v2" / "stateDiagram"; matching that or `.mermaid svg`
    // is robust across the wrapper shape mermaid uses.
    const rendered = page.locator(".mermaid svg, svg[aria-roledescription]");
    await expect(rendered.first()).toBeVisible({ timeout: 15_000 });
    // Both ```mermaid blocks should have rendered.
    await expect(rendered).toHaveCount(2, { timeout: 15_000 });

    // On a parse failure mermaid injects a visible "Syntax error in text"
    // box instead of the diagram — assert that never happens for either.
    await expect(page.locator("body")).not.toContainText("Syntax error");
  });
});
