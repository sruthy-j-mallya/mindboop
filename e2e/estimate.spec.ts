import { expect, test } from "@playwright/test";

import { signupTokenFor } from "./helpers";

test("estimate an Inbox task, change it, then clear it", async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();

  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("Plan the week");
  await input.press("Enter");
  await page.getByRole("textbox", { name: "Plan the week" }).click();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Add estimate" }).click();
  await page.getByLabel("Minutes").fill("45");
  await page.getByRole("button", { name: "OK" }).click();

  await expect(page.getByRole("button", { name: "45 min" })).toBeVisible();
  await page.reload();

  await page.getByRole("button", { name: "45 min" }).click();
  await page.getByLabel("Hours").fill("1");
  await page.getByLabel("Minutes").fill("40");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("button", { name: "1 h 40 min" })).toBeVisible();

  await page.getByRole("button", { name: "1 h 40 min" }).click();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("button", { name: "Estimate" })).toBeHidden();
  // The list row stays to the title (and date), never the estimate.
  await expect(page.getByRole("list", { name: "Tasks" })).not.toContainText("min");
  await expect(page.getByRole("textbox", { name: "Plan the week" })).toHaveValue("Plan the week");
});
