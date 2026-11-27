import { expect, type Page, test } from "@playwright/test";

import { backdateSession, signupTokenFor } from "./helpers";

const signUp = async (page: Page) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();

  return email;
};

test("add a routine from an idea, run it, see it counted, then edit and delete it", async ({ page }) => {
  const email = await signUp(page);

  await page.getByRole("link", { name: "Routines" }).click();
  await expect(page).toHaveURL("/routines");
  await page.getByRole("button", { name: /Meditation/ }).click();
  await page.getByRole("button", { name: /Shower/ }).click();
  await page.getByRole("button", { name: "Add 2 routines" }).click();
  const list = page.getByRole("list", { name: "Routines" });
  await expect(list.getByRole("link", { name: /Meditation/ })).toBeVisible();
  await expect(list.getByRole("link", { name: /Shower/ })).toBeVisible();

  await list.getByRole("link", { name: /Meditation/ }).click();
  await expect(page.getByRole("heading", { name: "Meditation" })).toBeVisible();
  await expect(page.getByText("Not started yet.", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("heading", { name: "Meditation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Discard" })).toBeVisible();

  backdateSession(email, 3 * 60);
  await page.reload();
  await page.getByRole("button", { name: "End session" }).click();
  await expect(page.getByText("Finished", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: "Routines" }).click();
  await list.getByRole("link", { name: /Meditation/ }).click();
  await expect(page.getByText("Times done").locator("..")).toContainText("1");
  await expect(page.getByText("1 day with it")).toBeVisible();

  await page.getByRole("button", { name: "Previous month" }).click();
  await page.getByRole("button", { name: /^Log time on \w+, 15 / }).click();
  await page.getByRole("dialog").getByLabel("Minutes").fill("25");
  await page.getByRole("dialog").getByRole("button", { name: "Log time" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: /^Log time on \w+, 15 .*25 min/ })).toBeVisible();
  await expect(page.getByText("Times done").locator("..")).toContainText("2");

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("Evening meditation");
  await dialog.getByRole("radio", { name: "Daily" }).check();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Evening meditation" })).toBeVisible();
  await expect(page.getByText(/^Daily at/)).toBeVisible();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Delete routine" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/routines");
  await expect(list.getByRole("link", { name: /Evening meditation/ })).toBeHidden();
  await expect(list.getByRole("link", { name: /Shower/ })).toBeVisible();
});

test("build a routine's checklist, tick it off on the Timer, and start fresh next time", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Routines" }).click();
  await page.getByRole("button", { name: /Shower/ }).click();
  await page.getByRole("button", { name: /^Add 1 routine/ }).click();
  await page
    .getByRole("list", { name: "Routines" })
    .getByRole("link", { name: /Shower/ })
    .click();

  await page.getByRole("button", { name: "Add step" }).click();
  await page.getByRole("textbox", { name: "New step" }).fill("Wash hair");
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "New step" }).fill("Moisturise");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  const steps = page.getByRole("list", { name: "Steps" });
  await expect(steps.getByRole("button", { name: "Edit Moisturise" })).toBeVisible();
  await expect(steps.getByRole("checkbox")).toHaveCount(0);

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL("/timer");
  await page.getByRole("checkbox", { name: "Wash hair" }).click();
  await expect(page.getByText("1 of 2 done")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Wash hair" })).toBeChecked();

  await page.getByRole("button", { name: "Discard" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Discard/ })
    .click();
  await page.getByRole("link", { name: "Routines" }).click();
  await page
    .getByRole("list", { name: "Routines" })
    .getByRole("link", { name: /Shower/ })
    .click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Wash hair" })).not.toBeChecked();
  await expect(page.getByText("0 of 2 done")).toBeVisible();
});
