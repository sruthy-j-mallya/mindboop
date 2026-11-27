import { expect, type Locator, type Page, test } from "@playwright/test";

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

// Drags with the mouse in small steps, as dnd-kit only starts a drag once the pointer has moved a little.
const drag = async (page: Page, from: Locator, to: Locator) => {
  await from.hover();
  await page.mouse.down();
  const box = await to.boundingBox();
  if (!box) throw new Error("No drop target on the page");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
};

test("put routines in order by dragging them, with the mouse or the keyboard", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Routines" }).click();
  for (const name of [/Shower/, /Meditation/, /Reading/]) await page.getByRole("button", { name }).click();
  await page.getByRole("button", { name: "Add 3 routines" }).click();
  const list = page.getByRole("list", { name: "Routines" });
  const routineLink = (name: string) => list.getByRole("link").filter({ hasText: name });
  const expectOrder = (names: string[]) => expect(list.getByRole("link")).toContainText(names);
  await expectOrder(["Shower", "Meditation", "Reading"]);

  await routineLink("Reading").hover();
  const dragged = page.waitForResponse((response) => response.request().method() === "PATCH");
  await drag(page, list.getByRole("button", { name: "Reorder Reading" }), routineLink("Shower"));
  expect((await dragged).ok()).toBe(true);
  await expectOrder(["Reading", "Shower", "Meditation"]);
  await page.reload();
  await expectOrder(["Reading", "Shower", "Meditation"]);

  const announcement = page.getByRole("status").filter({ hasText: "Reading" });
  await list.getByRole("button", { name: "Reorder Reading" }).focus();
  await page.keyboard.press("Space");
  await expect(announcement).toContainText("Picked up Reading");
  // dnd-kit listens for keys a moment after the pick up, so the arrow is pressed until it's heard.
  await expect(async () => {
    await page.keyboard.press("ArrowDown");
    await expect(announcement).toContainText("Reading moved over Shower.", { timeout: 300 });
  }).toPass();
  const saved = page.waitForResponse((response) => response.request().method() === "PATCH");
  await page.keyboard.press("Space");
  expect((await saved).ok()).toBe(true);
  await expectOrder(["Shower", "Reading", "Meditation"]);
});

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
