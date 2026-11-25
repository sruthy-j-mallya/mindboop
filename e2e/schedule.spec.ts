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

  await page.getByRole("link", { name: "Areas of life" }).click();
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("Renew passport");
  await input.press("Enter");
  await page.getByRole("textbox", { name: "Renew passport" }).click();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Add due date" }).click();
  const tomorrow = format(addDays(new Date(), 1), "EEEE, MMMM do, yyyy");
  await page.getByRole("button", { name: tomorrow }).click();
  await page.getByRole("combobox", { name: "Time" }).click();
  await page.getByRole("option", { name: "5:30 PM" }).click();
  await page.getByRole("button", { name: "OK" }).click();

  const rowDate = page.getByRole("button", { name: /^Due date of Renew passport:/ });
  await expect(rowDate).toContainText("Tomorrow, 5:30pm");
  await page.reload();
  await expect(rowDate).toContainText("Tomorrow, 5:30pm");

  // The list row's date opens the same picker as the pane.
  await rowDate.click();
  await page.getByRole("tab", { name: "Duration" }).click();
  const endTime = page.getByRole("combobox", { name: "End time" });
  await expect(endTime).toHaveValue("6:30 PM");
  await endTime.fill("7pm");
  await endTime.press("Enter");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(rowDate).toContainText("Tomorrow, 5:30 – 7pm");
  await expect(page.getByRole("dialog", { name: "Schedule" })).toBeHidden();

  await page.getByRole("button", { name: "Tomorrow, 5:30 – 7pm", exact: true }).click();
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByRole("button", { name: "Due date", exact: true })).toBeHidden();
  await expect(rowDate).toBeHidden();
});
