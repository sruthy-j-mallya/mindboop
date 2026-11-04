import { expect, test } from "@playwright/test";

import { signupTokenFor } from "./helpers";

test("keep the sidebar state across reloads", async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  const sidebar = page.locator('[data-slot="sidebar"]');
  const toggle = page.getByRole("button", { name: "Toggle Sidebar" });
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");

  await toggle.click();
  await expect(sidebar).toHaveAttribute("data-state", "expanded");

  await page.reload();
  await expect(sidebar).toHaveAttribute("data-state", "expanded");

  await toggle.click();
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");

  await page.reload();
  await expect(sidebar).toHaveAttribute("data-state", "collapsed");
});
