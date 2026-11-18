import { expect, type Page, test } from "@playwright/test";

import { signupTokenFor } from "./helpers";

const choose = async (page: Page, field: string, option: string) => {
  await page.getByRole("combobox", { name: field }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

test("navigate from the sidebar and keep the chosen theme and sounds on the account", async ({ page }) => {
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
  const theme = page.getByRole("combobox", { name: "Theme" });
  const completionSound = page.getByRole("combobox", { name: "Task completed" });
  const breakAlarmSound = page.getByRole("combobox", { name: "Break over" });

  await expect(theme).toHaveText("Match my device");
  await expect(html).not.toHaveClass(/dark/);
  await expect(completionSound).toHaveText("Rising tick-tick");
  await expect(breakAlarmSound).toHaveText("Classic beep");

  await choose(page, "Theme", "Dark");
  await expect(html).toHaveClass(/dark/);
  await choose(page, "Task completed", "Bell");
  await choose(page, "Break over", "Marimba");

  // Nothing is kept in the browser: the account remembers.
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(html).toHaveClass(/dark/);
  await expect(theme).toHaveText("Dark");
  await expect(completionSound).toHaveText("Bell");
  await expect(breakAlarmSound).toHaveText("Marimba");

  await page.getByRole("link", { name: "Quick start" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
});
