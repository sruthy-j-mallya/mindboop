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

test("add areas from the suggestions, move a task into it, search and edit it", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Areas of life" }).click();
  await expect(page).toHaveURL("/inbox");
  const nav = page.getByRole("navigation", { name: "Areas of life" });
  await nav.getByRole("button", { name: "Work" }).click();
  await nav.getByRole("button", { name: "Health" }).click();
  await nav.getByRole("button", { name: "Add 2 areas" }).click();
  const work = nav.getByRole("link", { name: "Work" });
  await expect(work).toBeVisible();
  await expect(nav.getByRole("link", { name: "Health" })).toBeVisible();

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

  // The search in the sidebar finds tasks from every list, on any page.
  await page.getByRole("link", { name: "Calendar" }).click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const taskSearch = page.getByRole("combobox", { name: "Search tasks" });
  await taskSearch.fill("plants");
  await expect(page.getByRole("option", { name: /Water the plants/ })).toBeVisible();
  await taskSearch.fill("review");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.getByRole("option", { name: /Review the PRs/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/areas\/[^/]+\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();

  await work.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Edit" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Work" });
  await dialog.getByRole("textbox", { name: "Name" }).fill("Career");
  await dialog.getByRole("radio", { name: "Teal" }).check();
  await dialog.getByRole("button", { name: "Emoji: briefcase" }).click();
  const picker = page.getByRole("dialog", { name: "Pick an emoji" });
  const search = picker.getByRole("searchbox", { name: "Search emojis" });
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();
  await expect(dialog).toBeVisible();

  // The list scrolls inside the dialog, down to the last category.
  await dialog.getByRole("button", { name: "Emoji: briefcase" }).click();
  await picker.getByRole("gridcell", { name: "rocket" }).hover();
  await page.mouse.wheel(0, 10_000);
  await expect(picker.getByRole("gridcell", { name: "motorcycle" })).toBeVisible();
  await search.fill("pets");
  await expect(picker.getByRole("gridcell", { name: "dog face" })).toBeVisible();
  await search.fill("rocket");
  await expect(picker.getByRole("gridcell", { name: "dog face" })).toBeHidden();
  await search.press("Enter");
  await expect(picker).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Emoji: rocket" })).toBeVisible();
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Career" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Career" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Career" })).toContainText("🚀");
  await expect(page.getByRole("textbox", { name: "Review the PRs" })).toBeVisible();

  // Moving the open task from its pane takes the pane along to the Inbox.
  await page.getByRole("textbox", { name: "Plan the sprint" }).click();
  await page.getByRole("button", { name: "Area of life: Career" }).click();
  await page.getByRole("dialog", { name: "Areas of life" }).getByRole("button", { name: "Inbox" }).click();
  await expect(page).toHaveURL(/\/inbox\/[\w-]+$/);
  await expect(page.getByRole("heading", { name: "Plan the sprint" })).toBeVisible();

  // Deleting the area from its right-click menu moves its tasks to the list picked.
  await nav.getByRole("link", { name: "Career" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Delete Career?" });
  await deleteDialog.getByRole("combobox", { name: "Move tasks to" }).click();
  await page.getByRole("option", { name: "Health" }).click();
  await deleteDialog.getByRole("button", { name: "Delete area" }).click();
  await expect(nav.getByRole("link", { name: "Career" })).toBeHidden();
  await nav.getByRole("link", { name: "Health" }).click();
  await expect(page.getByRole("textbox", { name: "Review the PRs" })).toBeVisible();
  await page.getByRole("link", { name: "Areas of life" }).click();
  await expect(page).toHaveURL("/inbox");
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeVisible();
});

test("reorder areas by dragging and by keyboard, also in the narrow layout", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Areas of life" }).click();
  const nav = page.getByRole("navigation", { name: "Areas of life" });
  for (const name of ["Work", "Health", "Leisure"]) await nav.getByRole("button", { name }).click();
  await nav.getByRole("button", { name: "Add 3 areas" }).click();
  const areaLink = (name: string) => nav.getByRole("link", { name });
  const expectOrder = (names: string[]) => expect(nav.getByRole("link")).toContainText(["Inbox", ...names]);
  await expectOrder(["Work", "Health", "Leisure"]);

  const dragArea = async (name: string, target: string) => {
    await areaLink(name).hover();
    const saved = page.waitForResponse((response) => response.request().method() === "PATCH");
    await drag(page, nav.getByRole("button", { name: `Reorder ${name}` }), areaLink(target));
    expect((await saved).ok()).toBe(true);
  };

  await dragArea("Leisure", "Work");
  await expectOrder(["Leisure", "Work", "Health"]);
  await page.reload();
  await expectOrder(["Leisure", "Work", "Health"]);

  const announcement = page.getByRole("status").filter({ hasText: "Leisure" });
  await nav.getByRole("button", { name: "Reorder Leisure" }).focus();
  await page.keyboard.press("Space");
  await expect(announcement).toContainText("Picked up Leisure");
  // dnd-kit listens for keys a moment after the pick up, so the arrow is pressed until it's heard.
  await expect(async () => {
    await page.keyboard.press("ArrowDown");
    await expect(announcement).toContainText("Leisure moved over Work.", { timeout: 300 });
  }).toPass();
  const saved = page.waitForResponse((response) => response.request().method() === "PATCH");
  await page.keyboard.press("Space");
  expect((await saved).ok()).toBe(true);
  await expectOrder(["Work", "Leisure", "Health"]);

  // A task can still be dropped on an area, and an area opened.
  await addTask(page, "Plan the sprint");
  await page.getByRole("textbox", { name: "Plan the sprint" }).hover();
  await drag(page, page.getByRole("button", { name: "Move Plan the sprint" }), areaLink("Health"));
  await expect(page.getByText("Moved “Plan the sprint” to Health")).toBeVisible();
  await areaLink("Health").click();
  await expect(page.getByRole("textbox", { name: "Plan the sprint" })).toBeVisible();

  await page.setViewportSize({ width: 800, height: 800 });
  await dragArea("Health", "Work");
  await expectOrder(["Health", "Work", "Leisure"]);
  await page.reload();
  await expectOrder(["Health", "Work", "Leisure"]);
});
