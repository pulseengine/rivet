import { Page, expect } from "@playwright/test";

/** Wait for HTMX to finish all pending requests. */
export async function waitForHtmx(page: Page, timeout = 10_000) {
  await page.waitForFunction(
    () => !document.querySelector(".htmx-request"),
    { timeout },
  );
}

/** Navigate via HTMX (click nav link) and wait for content swap. */
export async function htmxNavigate(page: Page, linkText: string) {
  await page.click(`a:has-text("${linkText}")`);
  await waitForHtmx(page);
}

/** Assert current URL path and optional query params. */
export async function assertUrl(
  page: Page,
  path: string,
  params?: Record<string, string>,
) {
  const url = new URL(page.url());
  expect(url.pathname).toBe(path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      expect(url.searchParams.get(key)).toBe(value);
    }
  }
}

/** Count visible rows in a <tbody>. */
export async function countTableRows(page: Page) {
  return page.locator("table tbody tr").count();
}
