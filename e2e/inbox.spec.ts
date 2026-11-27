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

// The titles of the listed tasks, in order. Each row's title is an editable field.
const expectTasks = async (page: Page, titles: string[]) => {
  const tasks = page.getByRole("list", { name: "Tasks" }).getByRole("textbox");
  await expect(tasks).toHaveCount(titles.length);
  for (const [index, title] of titles.entries()) await expect(tasks.nth(index)).toHaveValue(title);
};

// Waits for each task to be listed before adding the next, so the saves can't race.
const addTasks = async (page: Page, titles: string[]) => {
  const input = page.getByRole("textbox", { name: "New task" });
  for (const title of titles) {
    await input.fill(title);
    await input.press("Enter");
    await expect(page.getByRole("textbox", { name: title })).toBeVisible();
  }
};

test("add tasks to the Inbox, open one, and complete it", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();

  // Each save lands before the next is typed, so "newest" is the order they were added in.
  await addTasks(page, ["Water the plants", "Renew passport"]);

  // Newest first, as neither has a date.
  await expectTasks(page, ["Renew passport", "Water the plants"]);

  await page.getByRole("textbox", { name: "Renew passport" }).click();
  await expect(page.getByRole("heading", { name: "Renew passport" })).toBeVisible();
  await page.getByRole("button", { name: "More actions" }).click();
  await addSteps(page, ["Book an appointment"]);
  await expect(page.getByRole("list", { name: "Steps" })).toHaveText("Book an appointment");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Renew passport" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Steps" })).toHaveText("Book an appointment");

  await page.getByRole("checkbox", { name: "Complete Renew passport" }).click();
  await expect(page).toHaveURL("/inbox");
  await expectTasks(page, ["Water the plants"]);

  await page.getByRole("textbox", { name: "Water the plants" }).click();
  await page.getByRole("checkbox", { name: "Mark as complete" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();
});

test("delete a task from its pane", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym", "Sort the mail"]);

  await page.getByRole("textbox", { name: "Cancel the gym" }).click();
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Delete task" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this task?" });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: "Cancel the gym" })).toBeVisible();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Delete task" }).click();
  await dialog.getByRole("button", { name: "Delete task" }).click();
  await expect(page).toHaveURL("/inbox");
  await expectTasks(page, ["Sort the mail"]);

  await page.reload();
  await expectTasks(page, ["Sort the mail"]);
});

test("delete a task from its row and undo it", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym", "Sort the mail"]);

  await expectTasks(page, ["Sort the mail", "Cancel the gym"]);

  await page.getByRole("textbox", { name: "Cancel the gym" }).hover();
  await page.getByRole("button", { name: "Delete Cancel the gym" }).click();
  await expectTasks(page, ["Sort the mail"]);
  await expect(page.getByText("Deleted “Cancel the gym”")).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  await expectTasks(page, ["Sort the mail", "Cancel the gym"]);

  await page.reload();
  await expectTasks(page, ["Sort the mail", "Cancel the gym"]);
});

test("rename a task in its row", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym"]);

  // Going into the title opens the task beside the list.
  const title = page.getByRole("textbox", { name: "Cancel the gym" });
  await title.click();
  await expect(page.getByRole("heading", { name: "Cancel the gym" })).toBeVisible();

  await title.fill("Cancel the gym membership");
  await title.press("Enter");
  await expect(page.getByRole("heading", { name: "Cancel the gym membership" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Cancel the gym membership" })).toHaveValue(
    "Cancel the gym membership",
  );
});

test("rename a task from its pane", async ({ page }) => {
  await signUp(page);

  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym"]);
  await page.getByRole("textbox", { name: "Cancel the gym" }).click();

  const title = page.getByRole("textbox", { name: "Task title" });
  await title.fill("Cancel the gym membership");
  await title.press("Enter");
  await expect(page.getByRole("heading", { name: "Cancel the gym membership" })).toBeVisible();
  await expectTasks(page, ["Cancel the gym membership"]);

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Task title" })).toHaveValue("Cancel the gym membership");
});

test("reopen a completed task and restore a deleted one from their pages", async ({ page }) => {
  await signUp(page);
  await page.goto("/inbox");
  await addTasks(page, ["Cancel the gym", "Sort the mail"]);
  const nav = page.getByRole("navigation", { name: "Areas of life" });

  await page.getByRole("checkbox", { name: "Complete Cancel the gym" }).click();
  await expectTasks(page, ["Sort the mail"]);
  await page.getByRole("textbox", { name: "Sort the mail" }).hover();
  await page.getByRole("button", { name: "Delete Sort the mail" }).click();
  await expect(page.getByText("Your Inbox is empty")).toBeVisible();

  await nav.getByRole("link", { name: "Completed" }).click();
  await page.getByRole("button", { name: "Reopen Cancel the gym" }).click();
  await expect(page.getByText("Nothing completed yet")).toBeVisible();

  await nav.getByRole("link", { name: "Trash" }).click();
  await page.getByRole("button", { name: "Restore Sort the mail" }).click();
  await expect(page.getByText("Restored “Sort the mail” to your Inbox")).toBeVisible();
  await expect(page.getByText("Trash is empty")).toBeVisible();

  await nav.getByRole("link", { name: "Inbox" }).click();
  await expectTasks(page, ["Sort the mail", "Cancel the gym"]);
});

test("open a link in a task's title in a new tab, and still edit the title", async ({ page, context }) => {
  await signUp(page);
  await page.goto("/inbox");

  const title = "Read https://example.com/";
  await addTasks(page, [title]);

  const list = page.getByRole("list", { name: "Tasks" });
  const link = list.getByRole("link", { name: "https://example.com/" });
  await expect(link).toHaveAttribute("target", "_blank");

  // Stub the address so the test doesn't reach the internet.
  await context.route("https://example.com/**", (route) => route.fulfill({ body: "Example" }));
  const [popup] = await Promise.all([context.waitForEvent("page"), link.click()]);
  await expect(popup).toHaveURL("https://example.com/");
  await popup.close();

  // Clicking the words rather than the link edits the title.
  await list.getByText("Read").click();
  const input = list.getByRole("textbox", { name: title });
  await expect(input).toBeFocused();
  await input.press("End");
  await input.pressSequentially(" again");
  await input.press("Enter");
  await expect(list.getByRole("textbox", { name: `${title} again` })).toBeVisible();
});
