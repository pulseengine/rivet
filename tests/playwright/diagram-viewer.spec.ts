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
  // Use a *focused* subgraph (REQ-001 + depth-1 neighbours) rather than the
  // full graph: this test pins the `.svg-viewer` toolbar invariant, not graph
  // size. The dogfood dataset outgrew the old `?limit=2000` full render — at
  // ~871 artifacts that page is heavy enough that `goto` + settle exceeded the
  // timeout, so the toolbar/fullscreen checks failed. A bounded focused graph
  // renders the same `.svg-viewer` wrapper quickly and deterministically.
  // (`limit=2000` kept so the focused subgraph is never budget-clipped.)
  { name: "graph", url: "/graph?focus=REQ-001&depth=1&limit=2000" },
  // Doc linkage view.
  { name: "doc-linkage", url: "/doc-linkage" },
  // /help renders the schema-linkage mermaid diagram (a Schema Linkage
  // card showing artifact-type relationships in the dashboard's design
  // language). The diagram lives on the help index, not /help/schema —
  // /help/schema is the type-list table.
  { name: "schema-linkage", url: "/help" },
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
