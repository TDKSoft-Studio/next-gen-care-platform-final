import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("negotiates Dutch without silently rendering French", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "Accept-Language": "nl-BE,nl;q=0.9,fr;q=0.7" });
  await page.goto("/");

  await expect(page).toHaveURL(/\/nl$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ontdek de domeinen");
});

test("preserves an equivalent page when switching language", async ({ page }) => {
  await page.goto("/fr/soins-a-domicile");
  await page.getByRole("link", { name: "Nederlands" }).click();

  await expect(page).toHaveURL(/\/nl\/thuiszorg$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thuiszorg");
});

test("exposes the five public domain presentations without a form", async ({ page }) => {
  await page.goto("/fr");
  const domains = page.locator("#domains");
  await expect(domains.getByRole("link")).toHaveCount(5);
  await expect(page.locator("form")).toHaveCount(0);
});

test("supports a keyboard skip link", async ({ page }) => {
  await page.goto("/fr");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Aller au contenu principal" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/fr");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
