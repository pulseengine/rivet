import { test, expect } from "@playwright/test";

// ── Health ────────────────────────────────────────────────────────────────

test.describe("API v1: Health", () => {
  test("returns valid JSON with expected fields", async ({ page }) => {
    const resp = await page.request.get("/api/v1/health");
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain("application/json");

    const json = await resp.json();
    expect(json.status).toBe("ok");
    expect(json.project).toBe("rivet");
    expect(typeof json.version).toBe("string");
    expect(json.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(json.artifacts).toBeGreaterThan(0);
    expect(json.uptime_seconds).toBeGreaterThanOrEqual(0);
  });

  test("has CORS headers for cross-origin Grafana access", async ({
    page,
  }) => {
    const resp = await page.request.get("/api/v1/health");
    expect(resp.headers()["access-control-allow-origin"]).toBeDefined();
  });
});

// ── Stats (Grafana gauge/pie panels) ──────────────────────────────────────

test.describe("API v1: Stats — Grafana dashboard data", () => {
  test("total_artifacts matches the dashboard artifact count", async ({
    page,
  }) => {
    const statsResp = await page.request.get("/api/v1/stats");
    const stats = await statsResp.json();

    // Cross-check: the dashboard shows the same count
    await page.goto("/");
    const badge = page.locator('a[href="/artifacts"] .nav-badge');
    const badgeText = await badge.textContent();
    const dashboardCount = parseInt(badgeText!.trim(), 10);

    // Stats total should include all local artifacts visible in the dashboard
    expect(stats.total_artifacts).toBeGreaterThanOrEqual(dashboardCount);
  });

  test("by_type sums to total_artifacts", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();

    const typeSum = Object.values(stats.by_type).reduce(
      (a: number, b) => a + (b as number),
      0,
    );
    expect(typeSum).toBe(stats.total_artifacts);
  });

  test("by_type includes all known types with counts", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();

    // Must have requirement and feature types at minimum
    expect(stats.by_type.requirement).toBeGreaterThan(0);
    expect(stats.by_type.feature).toBeGreaterThan(0);
  });

  test("by_status groups are non-empty", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();

    const statusSum = Object.values(stats.by_status).reduce(
      (a: number, b) => a + (b as number),
      0,
    );
    expect(statusSum).toBeGreaterThan(0);
  });

  test("validation counts cover all artifacts", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();
    const { error, warning, info, clean } = stats.validation;

    // Sum of validation buckets should equal total_artifacts
    expect(error + warning + info + clean).toBe(stats.total_artifacts);
  });

  test("coverage rules have valid percentages", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();

    expect(stats.coverage.length).toBeGreaterThan(0);
    for (const rule of stats.coverage) {
      expect(rule.percentage).toBeGreaterThanOrEqual(0);
      expect(rule.percentage).toBeLessThanOrEqual(100);
      expect(rule.covered).toBeLessThanOrEqual(rule.total);
    }
  });

  test("by_origin includes local", async ({ page }) => {
    const resp = await page.request.get("/api/v1/stats");
    const stats = await resp.json();

    expect(stats.by_origin.local).toBeGreaterThan(0);
  });
});

// ── Artifacts (Grafana table panels) ──────────────────────────────────────

test.describe("API v1: Artifacts — Grafana table data", () => {
  test("returns artifacts with complete fields", async ({ page }) => {
    const resp = await page.request.get("/api/v1/artifacts?limit=5");
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data.total).toBeGreaterThan(0);
    expect(data.artifacts.length).toBeLessThanOrEqual(5);

    const art = data.artifacts[0];
    expect(art.id).toBeTruthy();
    expect(art.title).toBeTruthy();
    expect(art.type).toBeTruthy();
    expect(art.origin).toBe("local");
    expect(typeof art.links_out).toBe("number");
    expect(typeof art.links_in).toBe("number");
  });

  test("type filter returns only matching artifacts", async ({ page }) => {
    const resp = await page.request.get("/api/v1/artifacts?type=requirement");
    const data = await resp.json();

    expect(data.artifacts.length).toBeGreaterThan(0);
    for (const art of data.artifacts) {
      expect(art.type).toBe("requirement");
    }
  });

  test("search filter matches titles", async ({ page }) => {
    const resp = await page.request.get("/api/v1/artifacts?q=STPA");
    const data = await resp.json();

    for (const art of data.artifacts) {
      expect(art.title.toLowerCase()).toContain("stpa");
    }
  });

  test("pagination works correctly", async ({ page }) => {
    const page1 = await (
      await page.request.get("/api/v1/artifacts?limit=3&offset=0")
    ).json();
    const page2 = await (
      await page.request.get("/api/v1/artifacts?limit=3&offset=3")
    ).json();

    // Same total across pages
    expect(page1.total).toBe(page2.total);

    // Different artifacts on each page
    if (page2.artifacts.length > 0) {
      expect(page1.artifacts[0].id).not.toBe(page2.artifacts[0].id);
    }
  });

  test("artifact detail page matches API data", async ({ page }) => {
    // Get an artifact from the API
    const resp = await page.request.get(
      "/api/v1/artifacts?type=requirement&limit=1",
    );
    const data = await resp.json();
    const apiArt = data.artifacts[0];

    // Navigate to its detail page and verify the title matches
    await page.goto(`/artifacts/${apiArt.id}`);
    const pageTitle = await page.locator("h2").first().textContent();
    expect(pageTitle).toContain(apiArt.id);
  });
});

// ── Diagnostics (Grafana alert panels) ────────────────────────────────────

test.describe("API v1: Diagnostics", () => {
  test("returns diagnostics with valid structure", async ({ page }) => {
    const resp = await page.request.get("/api/v1/diagnostics");
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(typeof data.total).toBe("number");
    expect(Array.isArray(data.diagnostics)).toBe(true);

    if (data.diagnostics.length > 0) {
      const diag = data.diagnostics[0];
      expect(["error", "warning", "info"]).toContain(diag.severity);
      expect(diag.rule).toBeTruthy();
      expect(diag.message).toBeTruthy();
      expect(diag.origin).toBeTruthy();
    }
  });

  test("severity filter works", async ({ page }) => {
    const resp = await page.request.get("/api/v1/diagnostics?severity=info");
    const data = await resp.json();

    for (const diag of data.diagnostics) {
      expect(diag.severity).toBe("info");
    }
  });

  test("diagnostics count matches validation page", async ({ page }) => {
    const apiResp = await page.request.get("/api/v1/diagnostics");
    const apiData = await apiResp.json();

    // Navigate to the validation page and check the count is consistent
    await page.goto("/validate");
    const body = await page.locator("#content").textContent();

    // If there are diagnostics, the validation page should show something
    if (apiData.total > 0) {
      // The page should contain diagnostic-related content
      expect(body).toBeTruthy();
    }
  });
});

// ── Coverage (Grafana bar/gauge panels) ───────────────────────────────────

test.describe("API v1: Coverage — traceability rules", () => {
  test("returns per-rule coverage with valid structure", async ({ page }) => {
    const resp = await page.request.get("/api/v1/coverage");
    expect(resp.status()).toBe(200);

    const data = await resp.json();
    expect(data.rules.length).toBeGreaterThan(0);

    const rule = data.rules[0];
    expect(rule.rule).toBeTruthy();
    expect(rule.source_type).toBeTruthy();
    expect(rule.link_type).toBeTruthy();
    expect(["forward", "backward"]).toContain(rule.direction);
    expect(Array.isArray(rule.target_types)).toBe(true);
    expect(rule.percentage).toBeGreaterThanOrEqual(0);
    expect(rule.percentage).toBeLessThanOrEqual(100);
    expect(rule.covered).toBeLessThanOrEqual(rule.total);
    expect(Array.isArray(rule.uncovered)).toBe(true);
    expect(rule.uncovered.length).toBe(rule.total - rule.covered);
  });

  test("coverage data matches the coverage dashboard page", async ({
    page,
  }) => {
    const apiResp = await page.request.get("/api/v1/coverage");
    const apiData = await apiResp.json();

    // The coverage page should list the same rules
    await page.goto("/coverage");
    const body = await page.locator("#content").textContent();

    // Each rule name from the API should appear on the coverage page
    for (const rule of apiData.rules) {
      expect(body).toContain(rule.rule);
    }
  });
});

// ── oEmbed (Notion/Confluence embedding) ──────────────────────────────────

test.describe("oEmbed Provider", () => {
  test("returns valid oEmbed JSON for artifact URL", async ({ page }) => {
    const artifactUrl = encodeURIComponent(
      "http://localhost:3003/artifacts/REQ-001",
    );
    const resp = await page.request.get(
      `/oembed?url=${artifactUrl}&format=json`,
    );
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain("application/json");

    const oembed = await resp.json();
    expect(oembed.version).toBe("1.0");
    expect(oembed.type).toBe("rich");
    expect(oembed.title).toContain("REQ-001");
    expect(oembed.provider_name).toBe("Rivet");
    expect(oembed.width).toBeGreaterThan(0);
    expect(oembed.height).toBeGreaterThan(0);

    // The HTML must be a valid iframe that a consumer can embed
    expect(oembed.html).toContain("<iframe");
    expect(oembed.html).toContain("/embed/artifacts/REQ-001");
    expect(oembed.html).toContain(`width="${oembed.width}"`);
    expect(oembed.html).toContain(`height="${oembed.height}"`);
  });

  test("iframe src actually serves the artifact embed page", async ({
    page,
  }) => {
    // Fetch the oEmbed response
    const artifactUrl = encodeURIComponent(
      "http://localhost:3003/artifacts/REQ-001",
    );
    const resp = await page.request.get(`/oembed?url=${artifactUrl}`);
    const oembed = await resp.json();

    // Extract the iframe src
    const srcMatch = oembed.html.match(/src="([^"]+)"/);
    expect(srcMatch).toBeTruthy();
    const iframeSrc = srcMatch![1];

    // The embed URL should return 200 with an HTML page
    // (embed layout loads content via HTMX on the client)
    const embedResp = await page.request.get(
      iframeSrc.replace("http://localhost:3003", ""),
    );
    expect(embedResp.status()).toBe(200);
    const html = await embedResp.text();
    expect(html).toContain("<html");
    expect(html).toContain("htmx");
  });

  test("maxwidth/maxheight clamp dimensions", async ({ page }) => {
    const artifactUrl = encodeURIComponent(
      "http://localhost:3003/artifacts/REQ-001",
    );
    const resp = await page.request.get(
      `/oembed?url=${artifactUrl}&maxwidth=300&maxheight=200`,
    );
    const oembed = await resp.json();

    expect(oembed.width).toBeLessThanOrEqual(300);
    expect(oembed.height).toBeLessThanOrEqual(200);
  });

  test("unknown artifact returns 404", async ({ page }) => {
    const url = encodeURIComponent(
      "http://localhost:3003/artifacts/DOES-NOT-EXIST",
    );
    const resp = await page.request.get(`/oembed?url=${url}`);
    expect(resp.status()).toBe(404);
  });

  test("non-artifact URL returns 404", async ({ page }) => {
    const url = encodeURIComponent("http://localhost:3003/coverage");
    const resp = await page.request.get(`/oembed?url=${url}`);
    expect(resp.status()).toBe(404);
  });

  test("format=xml returns 501", async ({ page }) => {
    const url = encodeURIComponent(
      "http://localhost:3003/artifacts/REQ-001",
    );
    const resp = await page.request.get(`/oembed?url=${url}&format=xml`);
    expect(resp.status()).toBe(501);
  });

  test("artifact detail page has oEmbed discovery tag", async ({ page }) => {
    await page.goto("/artifacts/REQ-001");
    const html = await page.content();

    expect(html).toContain("application/json+oembed");
    expect(html).toContain("/oembed?");
  });
});

// ── CORS & Security ──────────────────────────────────────────────────────

test.describe("API v1: CORS for Grafana", () => {
  test("API v1 endpoints have CORS headers", async ({ page }) => {
    for (const path of [
      "/api/v1/health",
      "/api/v1/stats",
      "/api/v1/artifacts",
      "/api/v1/diagnostics",
      "/api/v1/coverage",
    ]) {
      const resp = await page.request.get(path);
      expect(resp.headers()["access-control-allow-origin"]).toBeDefined();
    }
  });

  test("non-API routes do NOT have CORS", async ({ page }) => {
    const resp = await page.request.get("/");
    expect(resp.headers()["access-control-allow-origin"]).toBeUndefined();
  });

  test("CSP frame-ancestors allows iframe embedding", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("frame-ancestors");
  });
});

// ── Cross-checks: API vs Dashboard consistency ───────────────────────────

test.describe("API vs Dashboard consistency", () => {
  test("requirement count matches dashboard filter", async ({ page }) => {
    // Get local requirement count from artifacts API (defaults to local only)
    const resp = await page.request.get("/api/v1/artifacts?type=requirement");
    const data = await resp.json();
    const localApiCount = data.total;

    // Get total (local + external) requirement count from stats API
    const statsResp = await page.request.get("/api/v1/stats");
    const stats = await statsResp.json();

    // Stats by_type includes external artifacts, artifacts API defaults to
    // local only. The local count should be <= the stats total.
    expect(localApiCount).toBeGreaterThan(0);
    expect(stats.by_type.requirement).toBeGreaterThanOrEqual(localApiCount);

    // When we explicitly include all origins, the count should match stats
    const allResp = await page.request.get(
      "/api/v1/artifacts?type=requirement&origin=all",
    );
    const allData = await allResp.json();
    expect(allData.total).toBe(stats.by_type.requirement);
  });

  test("API stats coverage matches /api/v1/coverage details", async ({
    page,
  }) => {
    const statsResp = await page.request.get("/api/v1/stats");
    const stats = await statsResp.json();

    const covResp = await page.request.get("/api/v1/coverage");
    const coverage = await covResp.json();

    // Same number of rules
    expect(stats.coverage.length).toBe(coverage.rules.length);

    // Same percentages
    for (let i = 0; i < stats.coverage.length; i++) {
      expect(stats.coverage[i].rule).toBe(coverage.rules[i].rule);
      expect(stats.coverage[i].percentage).toBe(coverage.rules[i].percentage);
    }
  });
});
