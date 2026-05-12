import { test, expect } from "@playwright/test";

// Regression coverage for the fenced-mermaid HTML-escaping bug (reported
// against v0.6.0 and v0.8.0): `render_markdown` passed the body of a
// ```mermaid fenced block through pulldown-cmark's `html::push_html`, which
// HTML-entity-escapes Text events — turning mermaid's core `-->` arrow into
// `--&gt;` (and class-diagram `<|--` into `&lt;|--`). mermaid.js then failed
// with "Syntax error in text" and the diagram never rendered.
//
// ARCH-CORE-001 in artifacts/architecture.yaml has a real ```mermaid
// `flowchart LR` with `-->` arrows in its description, so it doubles as the
// end-to-end fixture.

test.describe("Mermaid diagram rendering", () => {
  test("fenced mermaid body is emitted verbatim — arrows not HTML-escaped", async ({
    request,
  }) => {
    // Raw HTML response: no JS runs, so mermaid.js hasn't transformed the
    // <pre> yet — we see exactly what render_markdown produced.
    const res = await request.get("/artifacts/ARCH-CORE-001");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<pre class="mermaid">');
    // The flowchart arrow must survive verbatim.
    expect(html).toContain("Config --> Store");
    // ...and must NOT be entity-escaped anywhere in the page.
    expect(html).not.toContain("--&gt;");
  });

  test("mermaid.js renders the diagram to SVG with no syntax error", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-CORE-001");

    // mermaid (startOnLoad) parses the .mermaid element's text and replaces
    // it with an inline <svg>. mermaid SVGs carry an aria-roledescription
    // like "flowchart-v2"; matching either that or `.mermaid svg` is robust
    // across the wrapper shape mermaid uses.
    const rendered = page
      .locator(".mermaid svg, svg[aria-roledescription]")
      .first();
    await expect(rendered).toBeVisible({ timeout: 15_000 });

    // On a parse failure mermaid injects a visible "Syntax error in text"
    // box instead of the diagram — assert that never happens.
    await expect(page.locator("body")).not.toContainText("Syntax error");
  });
});
