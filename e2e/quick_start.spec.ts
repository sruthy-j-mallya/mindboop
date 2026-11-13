import { expect, type Locator, type Page, test } from "@playwright/test";

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

const dragOnto = async (page: Page, handle: Locator, target: Locator) => {
  const from = await handle.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("Step is not on screen");

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2 + 4, { steps: 10 });
  await page.mouse.up();
};

test("reorder steps by dragging, and keep their ticks", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First", "Second", "Third"]);
  const steps = page.getByRole("list", { name: "Steps" }).getByRole("listitem");
  await expect(steps).toHaveText(["First", "Second", "Third"]);

  await page.getByRole("checkbox", { name: "First" }).check();

  await dragOnto(page, page.getByRole("button", { name: "Reorder First" }), steps.nth(2));

  await expect(steps).toHaveText(["Second", "Third", "First"]);
  await expect(page.getByRole("checkbox", { name: "First" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Second" })).not.toBeChecked();
});

test("reorder steps with the keyboard", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First", "Second"]);
  const steps = page.getByRole("list", { name: "Steps" }).getByRole("listitem");
  const announcement = page.getByRole("status");

  await page.getByRole("button", { name: "Reorder Second" }).focus();
  await page.keyboard.press("Space");
  await expect(announcement).toHaveText("Picked up Second.");
  // dnd-kit starts listening for keys a tick after the pick up, so an early press can be missed.
  await expect(async () => {
    await page.keyboard.press("ArrowUp");
    await expect(announcement).toHaveText("Second moved over First.", { timeout: 200 });
  }).toPass();
  await page.keyboard.press("Space");

  await expect(steps).toHaveText(["Second", "First"]);
});

test("edit a step, and keep the new text through a reorder", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First", "Second", "Third"]);
  const steps = page.getByRole("list", { name: "Steps" }).getByRole("listitem");

  await page.getByRole("button", { name: "Edit First" }).click();
  await page.getByRole("textbox", { name: "Step text" }).fill("Edited");
  await page.keyboard.press("Enter");
  // Enter opens a new step row below the edited one; leaving it empty discards it.
  await page.keyboard.press("Escape");
  await expect(steps).toHaveText(["Edited", "Second", "Third"]);

  await dragOnto(page, page.getByRole("button", { name: "Reorder Edited" }), steps.nth(2));

  await expect(steps).toHaveText(["Second", "Third", "Edited"]);
});

test("announce a step's edited text when reordering with the keyboard", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First"]);

  await page.getByRole("button", { name: "Edit First" }).click();
  await page.getByRole("textbox", { name: "Step text" }).fill("Edited");
  await page.keyboard.press("Enter");

  await page.getByRole("button", { name: "Reorder Edited" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toHaveText("Picked up Edited.");
});

test("cancel a step edit with Escape", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First"]);

  await page.getByRole("button", { name: "Edit First" }).click();
  await page.getByRole("textbox", { name: "Step text" }).fill("Edited");
  await page.keyboard.press("Escape");

  await expect(page.getByRole("list", { name: "Steps" }).getByRole("listitem")).toHaveText(["First"]);
  await expect(page.getByRole("button", { name: "Edit First" })).toBeFocused();
});

test("remove a step, and keep the ticks on the rest", async ({ page }) => {
  await signUp(page);
  await addSteps(page, ["First", "Second", "Third"]);
  const steps = page.getByRole("list", { name: "Steps" }).getByRole("listitem");

  await page.getByRole("checkbox", { name: "Third" }).check();
  await page.getByRole("button", { name: "Remove First" }).click();

  await expect(steps).toHaveText(["Second", "Third"]);
  await expect(page.getByRole("checkbox", { name: "Third" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Second" })).not.toBeChecked();
});

test("write a formatted description and see it on the timer", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  const description = page.getByRole("textbox", { name: "Description" });
  await description.click();
  // Markdown shortcuts format as you type.
  await page.keyboard.type("## Plan");
  await page.keyboard.press("Enter");
  await page.keyboard.type("- Cite **sources** ");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Read the brief");
  // The toolbar link button wraps the selected word.
  await description.getByText("Read the brief").dblclick({ position: { x: 2, y: 5 } });
  await page.getByRole("button", { name: "Link" }).click();
  await page.getByRole("textbox", { name: "Link address" }).fill("example.com");
  await page.getByRole("button", { name: "Apply" }).click();
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();

  await expect(page).toHaveURL("/timer");
  const shown = page.getByRole("region", { name: "Description" });
  await expect(shown.getByRole("heading", { name: "Plan" })).toBeVisible();
  await expect(shown.getByRole("listitem")).toHaveText(["Cite sources", "Read the brief"]);
  await expect(shown.locator("strong")).toHaveText("sources");
  await expect(shown.getByRole("link")).toHaveCount(1);
  await expect(shown.getByRole("link", { name: "Read" })).toHaveAttribute("href", "https://example.com");
});

test("paste Markdown into the description and see it formatted", async ({ page }) => {
  await signUp(page);

  const description = page.getByRole("textbox", { name: "Description" });
  await description.click();
  // Code editors put the raw text in the HTML flavour too; the Markdown should still win.
  await description.evaluate((element) => {
    const markdown = "## Plan\n\n1. Cite **sources**\n2. Read [the brief](https://example.com)";
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", markdown);
    clipboardData.setData("text/html", `<div style="white-space: pre">${markdown}</div>`);
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
  });

  await expect(description.getByRole("heading", { level: 2, name: "Plan" })).toBeVisible();
  await expect(description.getByRole("listitem")).toHaveText(["Cite sources", "Read the brief"]);
  await expect(description.locator("strong")).toHaveText("sources");
  await expect(description.getByRole("link", { name: "the brief" })).toHaveAttribute(
    "href",
    "https://example.com",
  );
});

test("open, edit and copy a description link from its hover menu", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await signUp(page);

  const description = page.getByRole("textbox", { name: "Description" });
  await description.click();
  await page.keyboard.type("See [the brief](www.example.com) ");
  const link = description.getByRole("link", { name: "the brief" });
  await expect(link).toHaveAttribute("href", "https://www.example.com");

  // A click opens the link rather than placing the caret in it.
  const popupPromise = context.waitForEvent("page");
  await link.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/www\.example\.com/);
  await popup.close();

  await link.hover();
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://www.example.com/");

  await link.hover();
  await page.getByRole("button", { name: "Edit link" }).click();
  await expect(page.getByRole("textbox", { name: "Link text" })).toHaveValue("the brief");
  // The popover opens just under the link, not under the toolbar.
  const linkBox = await link.boundingBox();
  const fieldBox = await page.getByRole("textbox", { name: "Link text" }).boundingBox();
  expect(fieldBox!.y - (linkBox!.y + linkBox!.height)).toBeGreaterThan(0);
  expect(fieldBox!.y - (linkBox!.y + linkBox!.height)).toBeLessThan(60);
  await page.getByRole("textbox", { name: "Link text" }).fill("the plan");
  await page.getByRole("textbox", { name: "Link address" }).fill("example.com/plan");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(description.getByRole("link", { name: "the plan" })).toHaveAttribute(
    "href",
    "https://example.com/plan",
  );
});

test("keep an unstarted task through a reload, and start fresh after beginning it", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("textbox", { name: "Description" }).click();
  await page.keyboard.type("Cite **sources** ");
  await addSteps(page, ["Outline"]);
  await page.getByRole("checkbox", { name: "Outline" }).check();
  await page.reload();

  await expect(page.getByRole("textbox", { name: "Task" })).toHaveValue("Draft permission");
  const description = page.getByRole("textbox", { name: "Description" });
  await expect(description.locator("strong")).toHaveText("sources");
  await expect(page.getByRole("checkbox", { name: "Outline" })).toBeChecked();

  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page).toHaveURL("/timer");
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Task" })).toHaveValue("");
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});
