import { expect, type Page, test } from "@playwright/test";

import { addSteps, signupTokenFor } from "./helpers";

const signUp = async (page: Page) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
};

test("add tasks to the Inbox, open one, and complete it", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Inbox" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();

  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("Water the plants");
  await input.press("Enter");
  await input.fill("Renew passport");
  await input.press("Enter");

  const tasks = page.getByRole("list", { name: "Tasks" }).getByRole("link");
  await expect(tasks).toHaveText(["Water the plants", "Renew passport"]);

  await page.getByRole("link", { name: "Renew passport" }).click();
  await expect(page.getByRole("heading", { name: "Renew passport" })).toBeVisible();
  await addSteps(page, ["Book an appointment"]);
  await expect(page.getByRole("list", { name: "Steps" })).toHaveText("Book an appointment");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Renew passport" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Steps" })).toHaveText("Book an appointment");

  await page.getByRole("checkbox", { name: "Complete Renew passport" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(tasks).toHaveText(["Water the plants"]);

  await page.getByRole("checkbox", { name: "Complete Water the plants" }).click();
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();
});
