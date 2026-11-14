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

// Waits for each task to be listed before adding the next, so the saves can't race.
const addTasks = async (page: Page, titles: string[]) => {
  const input = page.getByRole("textbox", { name: "New task" });
  for (const title of titles) {
    await input.fill(title);
    await input.press("Enter");
    await expect(page.getByRole("link", { name: title })).toBeVisible();
  }
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

  await page.getByRole("link", { name: "Water the plants" }).click();
  await page.getByRole("checkbox", { name: "Mark as complete" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();
});

test("delete a task from its pane", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym", "Sort the mail"]);

  await page.getByRole("link", { name: "Cancel the gym" }).click();
  await page.getByRole("button", { name: "Delete task" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this task?" });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Cancel the gym" })).toBeVisible();

  await page.getByRole("button", { name: "Delete task" }).click();
  await dialog.getByRole("button", { name: "Delete task" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("link")).toHaveText(["Sort the mail"]);

  await page.reload();
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("link")).toHaveText(["Sort the mail"]);
});

test("delete a task from its row and undo it", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym", "Sort the mail"]);

  const tasks = page.getByRole("list", { name: "Tasks" }).getByRole("link");
  await expect(tasks).toHaveText(["Cancel the gym", "Sort the mail"]);

  await page.getByRole("link", { name: "Cancel the gym" }).hover();
  await page.getByRole("button", { name: "Delete Cancel the gym" }).click();
  await expect(tasks).toHaveText(["Sort the mail"]);
  await expect(page.getByText("Deleted “Cancel the gym”")).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(tasks).toHaveText(["Cancel the gym", "Sort the mail"]);

  await page.reload();
  await expect(tasks).toHaveText(["Cancel the gym", "Sort the mail"]);
});
