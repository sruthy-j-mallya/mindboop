import { expect, type Locator, type Page, test } from "@playwright/test";

import { signupTokenFor } from "./helpers";

const signUp = async (page: Page) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
};

const addTask = async (page: Page, title: string) => {
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill(title);
  await input.press("Enter");
  await expect(page.getByRole("textbox", { name: title })).toBeVisible();
};

// Drags with the mouse in small steps, as dnd-kit only starts a drag once the pointer has moved a little.
const drag = async (page: Page, from: Locator, to: Locator) => {
  await from.hover();
  await page.mouse.down();
  const box = await to.boundingBox();
  if (!box) throw new Error("No drop target on the page");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
};

test("add an area from a suggestion, move a task into it, search and edit it", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Areas of life" }).click();
  await expect(page).toHaveURL("/inbox");
  const nav = page.getByRole("navigation", { name: "Areas of life" });
  await nav.getByRole("button", { name: "Add Work" }).click();
  const work = nav.getByRole("link", { name: "Work" });
  await expect(work).toBeVisible();

  await addTask(page, "Plan the sprint");
  await addTask(page, "Water the plants");

  await page.getByRole("textbox", { name: "Plan the sprint" }).hover();
  await drag(page, page.getByRole("button", { name: "Move Plan the sprint" }), work);
  await expect(page.getByText("Moved “Plan the sprint” to Work")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeHidden();

  await work.click();
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeVisible();
  await addTask(page, "Review the PRs");

  await page.getByRole("searchbox", { name: "Search tasks" }).fill("review");
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeHidden();
  await expect(page.getByRole("textbox", { name: "Review the PRs" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search tasks" }).fill("");

  await page.getByRole("button", { name: "Edit Work" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Work" });
  await dialog.getByRole("textbox", { name: "Name" }).fill("Career");
  await dialog.getByRole("radio", { name: "Teal" }).check();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Career" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Career" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Review the PRs" })).toBeVisible();

  // Deleting the area sends its tasks back to the Inbox.
  await page.getByRole("button", { name: "Edit Career" }).click();
  await page.getByRole("button", { name: "Delete area" }).click();
  await page.getByRole("button", { name: "Delete area and move tasks" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Review the PRs" })).toBeVisible();
});
