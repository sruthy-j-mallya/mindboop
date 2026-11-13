import { expect, test } from "@playwright/test";
import { addDays, format } from "date-fns";

import { signupTokenFor } from "./helpers";

test("schedule an Inbox task for a date, then a duration, then clear it", async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();

  await page.getByRole("link", { name: "Inbox" }).click();
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("Renew passport");
  await input.press("Enter");
  await page.getByRole("link", { name: "Renew passport" }).click();

  await page.getByRole("button", { name: "Due date" }).click();
  const tomorrow = format(addDays(new Date(), 1), "EEEE, MMMM do, yyyy");
  await page.getByRole("button", { name: tomorrow }).click();
  await page.getByLabel("Time").fill("17:30");
  await page.getByRole("button", { name: "OK" }).click();

  const row = page.getByRole("link", { name: /Renew passport/ });
  await expect(row).toContainText("Tomorrow 5:30pm");
  await page.reload();
  await expect(row).toContainText("Tomorrow 5:30pm");

  await page.getByRole("button", { name: "Tomorrow 5:30pm" }).click();
  await page.getByRole("tab", { name: "Duration" }).click();
  await expect(page.getByLabel("End time")).toHaveValue("18:30");
  await page.getByLabel("End time").fill("19:00");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(row).toContainText("Tomorrow 5:30pm – 7:00pm");

  await page.getByRole("button", { name: "Tomorrow 5:30pm – 7:00pm" }).click();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("button", { name: "Due date" })).toBeVisible();
  await expect(row).toHaveText("Renew passport");
});
