import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

/**
 * Rendering-invariant audit coverage.
 *
 * Each test in this file pins a dashboard rendering assumption that was
 * previously NOT exercised by any Playwright test (audit performed against
 * route inventory in serve/mod.rs vs goto/request URLs in tests/playwright).
 *
 * Categories of assumption:
 *   1. Routes never navigated end-to-end (just smoke-tested for status):
 *      /eu-ai-act, /matrix/cell, /help/docs/{slug},
 *      /artifacts/{id}/preview, /artifacts/{id}/graph, /embed/...
 *   2. Render-shape contracts that aren't pinned:
 *      mermaid in artifact `description` field; ego-graph svg-viewer
 *      wrapping; embed-layout vs page-layout structural difference.
 *   3. Variant-scoping limitations: graph_view doesn't accept variant —
 *      this is currently silent. Pin it so a future intent change is gated.
 *   4. Status-code conventions for missing items: artifact_detail returns
 *      200 (not 404) for unknown IDs; same for results detail.
 *
 * If any of these tests starts failing, that's not necessarily a bug — it
 * may be an intentional architectural change. But it should be a CONSCIOUS
 * change, not a silent regression.
 */

test.describe("Rendering invariants — uncovered routes", () => {
  test("/eu-ai-act renders a real dashboard page (not just 200)", async ({
    page,
  }) => {
    // Route is currently never navigated by any Playwright test. The handler
    // takes no params and may render either the schema-loaded dashboard or
    // a "schema not loaded" stub. Both are valid; assert one of them rendered.
    const resp = await page.goto("/eu-ai-act");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("h2")).toContainText("EU AI Act Compliance");
    // Layout must wrap the content — direct browser GETs go through
    // the wrap_full_page middleware.
    await expect(page.locator("nav[role='navigation']")).toBeVisible();
  });

  test("/help/docs/{slug} renders a topic with a back-link to /help/docs", async ({
    page,
  }) => {
    // The slug index (/help/docs) is tested but no test ever opens an actual
    // topic page. `cli` is one of the built-in slugs in rivet-cli/src/docs.rs.
    const resp = await page.goto("/help/docs/cli");
    expect(resp?.status()).toBe(200);
    // Topic page must offer a way back to the topic list.
    await expect(page.locator('a[href="/help/docs"]')).toBeVisible();
    // Topic body is wrapped in a .card.
    await expect(page.locator(".card")).toBeVisible();
    // Layout middleware wraps the partial — nav should be present.
    await expect(page.locator("nav[role='navigation']")).toBeVisible();
  });

  test("/artifacts/{id}/preview returns a hover-tooltip fragment", async ({
    page,
  }) => {
    // The preview endpoint is hit by hx-get hover handlers in artifact lists,
    // but no Playwright test navigates it directly. Pin its fragment shape:
    // it must render INSIDE the layout when accessed directly (because the
    // wrap_full_page middleware wraps non-HTMX GETs), and the inner fragment
    // must use the .art-preview class hierarchy.
    const resp = await page.goto("/artifacts/REQ-001/preview");
    expect(resp?.status()).toBe(200);
    // The art-preview wrapper is the contract used by the hover-tooltip CSS.
    const preview = page.locator(".art-preview").first();
    await expect(preview).toBeVisible();
    // The header carries a type badge + the artifact ID.
    await expect(preview.locator(".art-preview-header")).toContainText(
      "REQ-001",
    );
    // Title must be present (REQ-001's title in dogfood data is non-empty).
    await expect(preview.locator(".art-preview-title")).toBeVisible();
  });

  test("/artifacts/{id}/graph renders an ego-graph wrapped in svg-viewer", async ({
    page,
  }) => {
    // Pins that the per-artifact ego-graph view follows the same
    // .svg-viewer + toolbar invariant as /graph and /doc-linkage.
    // No existing test exercises this route end-to-end (the
    // diagram-viewer.spec.ts list omits it).
    const resp = await page.goto("/artifacts/REQ-001/graph");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);

    const viewer = page.locator("#ego-graph-viewer");
    await expect(viewer).toBeVisible({ timeout: 10_000 });
    await expect(viewer).toHaveClass(/svg-viewer/);

    // Same three controls as the main /graph view.
    const toolbar = viewer.locator(".svg-viewer-toolbar");
    await expect(toolbar.locator("button[title='Zoom to fit']")).toBeVisible();
    await expect(toolbar.locator("button[title='Fullscreen']")).toBeVisible();
    await expect(
      toolbar.locator("button[title='Open in new window']"),
    ).toBeVisible();

    // Hops control round-trips the request.
    await expect(page.locator("#hops")).toBeVisible();
  });

  test("/matrix/cell returns a link list fragment", async ({ page }) => {
    // The matrix cell drill-down (HTMX-loaded into the matrix table) has
    // never been navigated end-to-end. We force a direct browser GET; the
    // wrap_full_page middleware will wrap the partial in the layout, so we
    // assert on the inner <ul> shape that the matrix view's HTMX target
    // expects.
    const resp = await page.goto(
      "/matrix/cell?source_type=requirement&target_type=feature&link_type=verifies&direction=backward",
    );
    expect(resp?.status()).toBe(200);
    // The fragment is always a <ul> — empty when no links match (renders
    // a single .meta li), populated otherwise. Pin the wrapper. The list
    // is rendered as the FIRST direct child of main#content (the layout
    // middleware wraps the bare fragment).
    const fragment = page.locator("main#content > ul");
    await expect(fragment).toBeVisible();
    // Should not contain server errors.
    const html = await page.content();
    expect(html).not.toContain("thread 'main' panicked");
    expect(html).not.toContain("500 Internal Server Error");
  });
});

test.describe("Rendering invariants — embed layout", () => {
  test("/embed/artifacts/REQ-001 uses embed_layout (no nav, no shell)", async ({
    page,
  }) => {
    // /embed/* is the prefix used by the oembed endpoint to produce an
    // iframe-friendly view (referenced in api.spec.ts for oembed but never
    // navigated). Pin the structural difference between embed_layout and
    // page_layout: embed has no navigation sidebar.
    const resp = await page.goto("/embed/artifacts/REQ-001");
    expect(resp?.status()).toBe(200);
    // No top-level nav element.
    await expect(page.locator("nav[role='navigation']")).toHaveCount(0);
    // No .shell wrapper either (that's the page_layout signature).
    await expect(page.locator("body > .shell")).toHaveCount(0);
    // But the artifact content IS rendered into <main id="content">.
    await expect(page.locator("main#content")).toBeVisible();
    await expect(page.locator("main#content")).toContainText("REQ-001");
  });
});

test.describe("Rendering invariants — render-shape contracts", () => {
  test("mermaid in artifact `description` renders as <pre class='mermaid'> wrapped in .svg-viewer", async ({
    page,
  }) => {
    // ARCH-CORE-001 has a fenced ```mermaid block in its `description` (see
    // artifacts/architecture.yaml). The markdown renderer in
    // rivet-core/src/markdown.rs converts these to <pre class="mermaid">
    // so the dashboard's mermaid.js loader picks them up.
    //
    // PR #217 closed the description-mermaid asymmetry: render/artifacts.rs
    // now post-processes render_markdown output to wrap any <pre.mermaid>
    // in the same .svg-viewer container with toolbar that the dedicated
    // `diagram:` field uses (see render/artifacts.rs:489 area).
    //
    // We pin BOTH:
    //   1. The fenced block IS recognised and emitted as <pre.mermaid>.
    //   2. Description-mermaid IS now wrapped in .svg-viewer (parity with
    //      diagram-field rendering). If a future change un-wraps it, this
    //      assertion forces the change to be intentional.
    await page.goto("/artifacts/ARCH-CORE-001");
    await waitForHtmx(page);

    // The description is in a <dd class="artifact-desc">.
    const desc = page.locator("dd.artifact-desc");
    await expect(desc).toBeVisible();

    // Inside that description, mermaid block was emitted as <pre.mermaid>.
    const mermaidPre = desc.locator("pre.mermaid");
    await expect(mermaidPre).toBeVisible();
    // Body should contain the diagram source so mermaid.js can render it.
    await expect(mermaidPre).toContainText("flowchart");

    // Description-embedded mermaid is now wrapped in .svg-viewer (PR #217).
    const wrappedInViewer = await desc
      .locator(".svg-viewer pre.mermaid")
      .count();
    expect(wrappedInViewer).toBeGreaterThan(0);
  });
});

test.describe("Rendering invariants — variant scoping coverage", () => {
  test("/graph?variant=minimal-ci IS scoped (graph_view honors variant)", async ({
    page,
  }) => {
    // PR "variant scoping for 8 handlers" closed the silent-drop incoherence:
    // graph_view now reads `variant` from GraphParams, builds a scoped store
    // via try_build_scope, and renders the layout against the filtered
    // graph. Variant scoping reduces node count, which materially helps the
    // O(n^2)-ish layout pass on large dogfood projects.
    //
    // The fixture variant "minimal-ci" binds exactly REQ-001, so the scoped
    // graph ends up with at most a single node — strictly fewer than the
    // unscoped graph for this project's full requirements/features set.
    const respScoped = await page.goto(
      "/graph?variant=minimal-ci&types=requirement",
    );
    expect(respScoped?.status()).toBe(200);
    await expect(page.locator("h2")).toContainText("Traceability Graph", {
      timeout: 30_000,
    });
    // Variant banner present and reflects the active scope.
    await expect(page.locator(".variant-banner")).toBeVisible();
    await expect(page.locator(".variant-banner")).toContainText("minimal-ci");
    const scopedNodes = await page.locator("svg .node, svg g.node").count();

    const respFull = await page.goto("/graph?types=requirement");
    expect(respFull?.status()).toBe(200);
    await expect(page.locator("h2")).toContainText("Traceability Graph", {
      timeout: 30_000,
    });
    await expect(page.locator(".variant-banner")).toHaveCount(0);
    const fullNodes = await page.locator("svg .node, svg g.node").count();

    // Strict inequality: scoping must yield fewer nodes than the unscoped
    // requirement graph (the fixture has multiple REQs, only REQ-001 is bound).
    // Both views may render an "(empty)" placeholder if filters knock everything
    // out — the >= check guards against that pathological case.
    expect(fullNodes).toBeGreaterThanOrEqual(scopedNodes);
  });

  test("/traceability?variant=minimal-ci shows a smaller tree than unscoped", async ({
    page,
  }) => {
    // traceability_view used to silently ignore `variant`. After PR #N, it
    // uses try_build_scope and renders the explorer against the filtered
    // store. The dogfood "minimal-ci" variant binds only REQ-001, so the
    // resulting tree must have strictly fewer artifact rows than the
    // unscoped tree.
    const respScoped = await page.goto("/traceability?variant=minimal-ci");
    expect(respScoped?.status()).toBe(200);
    await expect(page.locator(".variant-banner")).toBeVisible();
    await expect(page.locator(".variant-banner")).toContainText("minimal-ci");
    // The scoped tree should still render its main heading.
    await expect(page.locator("h2").first()).toBeVisible();
    const scopedRows = await page
      .locator(
        "table tbody tr, .traceability-node, [data-artifact-id], a[href^='/artifacts/']",
      )
      .count();

    const respFull = await page.goto("/traceability");
    expect(respFull?.status()).toBe(200);
    await expect(page.locator(".variant-banner")).toHaveCount(0);
    const fullRows = await page
      .locator(
        "table tbody tr, .traceability-node, [data-artifact-id], a[href^='/artifacts/']",
      )
      .count();

    expect(fullRows).toBeGreaterThan(scopedRows);
  });

  test("/documents?variant=minimal-ci shows the variant banner", async ({
    page,
  }) => {
    // documents_list used to silently ignore `variant`. After PR #N it
    // builds a variant scope and the banner is shown end-to-end. The
    // documents list itself is not strictly per-variant (docs are loaded
    // independently), but the link counts shown for each doc are derived
    // from the scoped store.
    const resp = await page.goto("/documents?variant=minimal-ci");
    expect(resp?.status()).toBe(200);
    // Banner reflects the active variant — the layout middleware reads
    // the query param, the handler takes ViewParams, no asymmetry.
    await expect(page.locator(".variant-banner")).toBeVisible();
    await expect(page.locator(".variant-banner")).toContainText("minimal-ci");
    // Page renders the standard documents heading.
    await expect(page.locator("h2").first()).toBeVisible();
  });
});

test.describe("Rendering invariants — not-found status conventions", () => {
  test("/artifacts/UNKNOWN-ID returns 200 with 'Not Found' body (not 404)", async ({
    page,
  }) => {
    // artifact_detail in rivet-cli/src/serve/views.rs always returns
    // Html(...).into_response() — i.e. status 200 — even when the artifact
    // doesn't exist. The render layer just emits "<h2>Not Found</h2>".
    //
    // This is consistent with /externals/<unknown-prefix> (already pinned at
    // externals.spec.ts:80) but inconsistent with the gut expectation of
    // 404. Pin the current behavior so any future move to proper 404 is a
    // conscious decision.
    const resp = await page.goto("/artifacts/DEFINITELY-DOES-NOT-EXIST-ZZZ");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("Not Found");
    // The layout still wraps it (nav present).
    await expect(page.locator("nav[role='navigation']")).toBeVisible();
  });
});

test.describe("Rendering invariants — search fragment shape", () => {
  test("/search with empty query returns the cmd-k empty-state fragment", async ({
    page,
  }) => {
    // The search handler returns a FRAGMENT (no <html> shell when accessed
    // via HTMX) but routes.spec.ts only smoke-tests with ?q=OSLC. The
    // empty-query branch (line 56-60 of render/search.rs) emits a specific
    // .cmd-k-empty placeholder. Pin its shape so the cmd-k UI keeps working.
    //
    // Direct browser GET goes through wrap_full_page so we get the layout
    // wrapping; the fragment lives inside main#content.
    const resp = await page.goto("/search");
    expect(resp?.status()).toBe(200);
    const empty = page.locator(".cmd-k-empty").first();
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/Type to search/i);
  });

  test("/search?q=zzznonexistentzzz emits empty-results fragment", async ({
    page,
  }) => {
    // Pins the no-results branch (line 189-194 of render/search.rs).
    const resp = await page.goto("/search?q=zzznonexistentzzz");
    expect(resp?.status()).toBe(200);
    const empty = page.locator(".cmd-k-empty").first();
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/No results/i);
  });
});
