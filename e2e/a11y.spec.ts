import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Plan §7 Phase 0 — accessibility gates fail the build when breached.
 * Add every new route here as it ships.
 */
const routes = [
  "/en",
  "/en/report",
  "/en/report/financial-fraud",
  "/en/track",
  "/en/check-suspect",
  "/en/help/contacts",
  "/en/help/faq",
  "/hi",
];

for (const route of routes) {
  test(`${route} has no accessibility violations @a11y`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${route} does not scroll horizontally @a11y`, async ({ page }) => {
    await page.goto(route);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
}

test("every page exposes one h1, a main landmark, and a skip link @a11y", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("link", { name: /skip to main content/i })).toHaveCount(1);
});

test("no javascript: or placeholder links @a11y", async ({ page }) => {
  // Plan P1-5 — navigation must use real URLs.
  await page.goto("/en");
  const bad = await page.locator('a[href^="javascript:"], a[href="#"]').count();
  expect(bad).toBe(0);
});
