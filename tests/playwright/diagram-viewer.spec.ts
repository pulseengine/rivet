import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

/**
 * Diagram-viewer parity test.
 *
 * Pins the architectural invariant that every dashboard view rendering a
 * diagram (mermaid, link graph, doc-linkage, schema linkage) wraps it in
 * the shared `.svg-viewer` container with toolbar (zoom-fit, fullscreen,
 * popout). Catches the v0.4.1 drift where mermaid-only views had the
 * toolbar but schema/artifact diagrams did not.
 */
const VIEWER_PAGES = [
  // Top-level link graph — always has toolbar.
  // ?limit=2000 bypasses the default 200-node budget (added in 2fafe1a)
  // so the dogfood dataset (~742 artifacts) renders the actual SVG
  // instead of the "graph above node budget" placeholder. 2000 is
  // MAX_NODE_BUDGET in render/graph.rs.
  { name: "graph", url: "/graph?limit=2000" },
  // Doc linkage view.
  { name: "doc-linkage", url: "/doc-linkage" },
  // Help / schema page renders the schema-linkage mermaid diagram.
  { name: "schema-linkage", url: "/help/schema" },
];

for (const page of VIEWER_PAGES) {
  test(`${page.name}: viewer toolbar present`, async ({ page: p }) => {
    await p.goto(page.url);
    await waitForHtmx(p);
    const viewer = p.locator(".svg-viewer").first();
    await expect(viewer).toBeVisible({ timeout: 5_000 });
    const toolbar = viewer.locator(".svg-viewer-toolbar");
    await expect(toolbar).toBeVisible();
    // Each toolbar must offer the same three controls.
    await expect(
      toolbar.locator("button[title='Zoom to fit']"),
    ).toBeVisible();
    await expect(
      toolbar.locator("button[title='Fullscreen']"),
    ).toBeVisible();
    await expect(
      toolbar.locator("button[title='Open in new window']"),
    ).toBeVisible();
  });

  test(`${page.name}: fullscreen toggles class`, async ({ page: p }) => {
    await p.goto(page.url);
    await waitForHtmx(p);
    const viewer = p.locator(".svg-viewer").first();
    await expect(viewer).toBeVisible();
    await viewer.locator("button[title='Fullscreen']").click();
    await expect(viewer).toHaveClass(/fullscreen/);
  });
}
