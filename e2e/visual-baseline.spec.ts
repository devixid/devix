import { test, expect } from "@playwright/test";

const routes = [
  { name: "homepage", path: "/" },
  { name: "projects", path: "/projects" },
  { name: "estimator-step-1", path: "/estimator" },
] as const;

for (const route of routes) {
  test(`visual baseline: ${route.name}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    });
  });
}
