import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Dutch negotiation", () => {
  // `locale` sets the browser's Accept-Language from context creation, unlike an imperative
  // page.setExtraHTTPHeaders() call, which Chromium does not reliably apply to the very first
  // navigation request of a fresh context. The quality-value negotiation logic itself (multiple
  // competing languages, explicit fallback) is unit-tested in packages/localization/tests.
  test.use({ locale: "nl-BE" });

  test("negotiates Dutch without silently rendering French", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/nl$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Trajecten, teams en projecten"
    );
  });
});

test("preserves an equivalent page when switching language", async ({ page }) => {
  await page.goto("/fr");
  await page.getByRole("link", { name: "Nederlands" }).click();

  await expect(page).toHaveURL(/\/nl$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
});

test("navigates from the primary nav to a business-domain placeholder page", async ({ page }) => {
  await page.goto("/fr");
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Soins à domicile" })
    .click();

  await expect(page).toHaveURL(/\/fr\/home-care$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Soins à domicile");
  await expect(page.getByText("Les modalités, disponibilités")).toBeVisible();
});

test("has no automatically detectable violations on a business-domain placeholder page", async ({
  page
}) => {
  await page.goto("/fr/home-care");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
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
