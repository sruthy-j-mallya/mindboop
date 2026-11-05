import { expect, test } from "@playwright/test";

import { signupTokenFor } from "./helpers";

test("navigate from the sidebar and keep the chosen theme across reloads", async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);

  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("switch", { name: "Dark mode" }).click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(page.getByRole("switch", { name: "Dark mode" })).toBeChecked();

  await page.getByRole("link", { name: "Quick start" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
});
