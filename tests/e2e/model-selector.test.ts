import { expect, test } from "@playwright/test";

const MODEL_BUTTON_REGEX = /Cursor/i;

test.describe("Model Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays a model button", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await expect(modelButton).toBeVisible();
  });

  test("opens model selector popover on click", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await modelButton.click();

    await expect(page.getByPlaceholder("Search models...")).toBeVisible();
  });

  test("can search for models", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await modelButton.click();

    const searchInput = page.getByPlaceholder("Search models...");
    await searchInput.fill("Composer 2 Fast");

    await expect(page.getByText("Composer 2 Fast").first()).toBeVisible();
  });

  test("can close model selector by clicking outside", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await modelButton.click();

    await expect(page.getByPlaceholder("Search models...")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByPlaceholder("Search models...")).not.toBeVisible();
  });

  test("shows model provider groups", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await modelButton.click();

    await expect(
      page.getByRole("option", { name: /Cursor Composer 2/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: /Cursor Auto/i }).first()
    ).toBeVisible();
  });

  test("can select a different model", async ({ page }) => {
    const modelButton = page
      .locator("button")
      .filter({ hasText: MODEL_BUTTON_REGEX })
      .first();
    await modelButton.click();

    await page.getByText("Cursor Composer 2 Fast").first().click();

    await expect(page.getByPlaceholder("Search models...")).not.toBeVisible();

    await expect(
      page
        .locator("button")
        .filter({ hasText: "Cursor Composer 2 Fast" })
        .first()
    ).toBeVisible();
  });
});
