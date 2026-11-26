import { expect, type Locator, type Page, test } from "@playwright/test";
import { isSameDay, startOfHour, subHours } from "date-fns";

import { signupTokenFor } from "./helpers";

const signUp = async (page: Page) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
};

const chooseView = async (page: Page, view: string) => {
  await page.getByRole("combobox", { name: "Calendar view" }).click();
  await page.getByRole("option", { name: view, exact: true }).click();
  // The open menu blocks pointer events on the page, so raw mouse clicks wait for it to close.
  await expect(page.getByRole("listbox")).toBeHidden();
};

// react-big-calendar's time slots have no accessible names, so the grid is reached through its own classes: the
// first quarter hour of the given hour in the (single) day column.
const hourSlot = (page: Page, hour: number) =>
  page
    .locator(".rbc-time-content .rbc-day-slot .rbc-timeslot-group")
    .nth(hour)
    .locator(".rbc-time-slot")
    .first();

// The day view opens scrolled to an hour before now, so a slot may be out of view. Dragging over a slot out of view
// makes the calendar scroll under the pointer, and the drop lands on the wrong slot. Scroll it into view first.
const visibleHourSlot = async (page: Page, hour: number) => {
  const slot = hourSlot(page, hour);
  await slot.scrollIntoViewIfNeeded();
  const box = await slot.boundingBox();
  if (!box) throw new Error("The slot should be on screen");
  return box;
};

// The events layer sits over the slots, so a click goes to the slot's spot on screen rather than to the element.
const clickSlot = async (page: Page, hour: number) => {
  const box = await visibleHourSlot(page, hour);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

// A dropped event shows where it landed before its save finishes. Wait for the save before reloading or dragging
// again, or the reload cancels it, or the two saves race.
const waitForTaskSave = (page: Page) =>
  page.waitForResponse(
    (response) => response.request().method() === "PATCH" && /\/api\/tasks\/[^/]+$/.test(response.url()),
  );

test("add, edit and move a task from the calendar", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await chooseView(page, "Day");
  await page.getByRole("button", { name: "Next" }).click();

  await clickSlot(page, 10);
  const newTask = page.getByRole("dialog", { name: "New task" });
  await newTask.getByRole("textbox", { name: "Title" }).fill("Plan the week");
  await newTask.getByRole("button", { name: "Add step" }).click();
  const step = newTask.getByRole("textbox", { name: "New step" });
  await step.fill("List the goals");
  await step.press("Enter");
  await step.press("Escape");
  // Leaving the popover saves the task.
  await page.keyboard.press("Escape");
  await expect(newTask).toBeHidden();

  const event = page.locator(".calendar-event-task", { hasText: "Plan the week" });
  await expect(event).toBeVisible();
  await expect(event).toContainText("10 – 10:30am");

  await event.click();
  const editTask = page.getByRole("dialog", { name: "Edit task" });
  await expect(editTask.getByRole("checkbox", { name: "List the goals" })).toBeVisible();
  const title = editTask.getByRole("textbox", { name: "Task title" });
  await title.fill("Plan the month");
  // Enter saves the title in place, as in the Inbox pane; leaving the popover closes it.
  const renameSaved = waitForTaskSave(page);
  await title.press("Enter");
  await renameSaved;
  await page.keyboard.press("Escape");
  await expect(editTask).toBeHidden();
  const renamed = page.locator(".calendar-event-task", { hasText: "Plan the month" });
  await expect(renamed).toBeVisible();

  // Dragged two hours later, by its middle: its top and bottom edges are resize handles.
  const to = await visibleHourSlot(page, 12);
  const from = await renamed.boundingBox();
  if (!from) throw new Error("The event should be on screen");
  const x = from.x + from.width / 2;
  const grabOffset = from.height / 2;
  await page.mouse.move(x, from.y + grabOffset);
  await page.mouse.down();
  await page.mouse.move(x, to.y + grabOffset + 6, { steps: 10 });
  await page.mouse.move(x, to.y + grabOffset, { steps: 2 });
  const saved = waitForTaskSave(page);
  await page.mouse.up();
  await expect(renamed).toContainText("12 – 12:30pm");
  await saved;

  await page.reload();
  await chooseView(page, "Day");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".calendar-event-task", { hasText: "Plan the month" })).toContainText(
    "12 – 12:30pm",
  );
});

// Presses the middle of the event's top or bottom resize handle and drags it to the given slot.
const dragEdge = async (page: Page, event: Locator, edge: "top" | "bottom", hour: number) => {
  const to = await visibleHourSlot(page, hour);
  const handles = event.locator(".rbc-addons-dnd-resize-ns-anchor");
  const from = await (edge === "top" ? handles.first() : handles.last()).boundingBox();
  if (!from) throw new Error("The handle should be on screen");
  const x = from.x + from.width / 2;
  await page.mouse.move(x, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, to.y + 10, { steps: 10 });
  await page.mouse.move(x, to.y + 4, { steps: 2 });
  const saved = waitForTaskSave(page);
  await page.mouse.up();
  await saved;
};

test("stretch a task from its start and its end", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await chooseView(page, "Day");
  await page.getByRole("button", { name: "Next" }).click();

  await clickSlot(page, 10);
  const newTask = page.getByRole("dialog", { name: "New task" });
  await newTask.getByRole("textbox", { name: "Title" }).fill("Deep work");
  await page.keyboard.press("Escape");
  await expect(newTask).toBeHidden();

  const event = page.locator(".calendar-event-task", { hasText: "Deep work" });
  await expect(event).toContainText("10 – 10:30am");

  await dragEdge(page, event, "top", 9);
  await expect(event).toContainText("9 – 10:30am");

  await dragEdge(page, event, "bottom", 12);
  await expect(event).toContainText("9am – 12pm");

  await page.reload();
  await chooseView(page, "Day");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".calendar-event-task", { hasText: "Deep work" })).toContainText("9am – 12pm");
});

test("log time in the last 24 hours with only a title, then delete it", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await chooseView(page, "Day");

  const now = new Date();
  const start = startOfHour(subHours(now, 2));
  if (!isSameDay(start, now)) await page.getByRole("button", { name: "Previous" }).click();

  await clickSlot(page, start.getHours());
  const logTime = page.getByRole("dialog", { name: "Log time" });
  await logTime.getByRole("textbox", { name: "What did you work on?" }).fill("Answer emails");
  await page.keyboard.press("Escape");
  await expect(logTime).toBeHidden();

  const timeLog = page.locator(".calendar-event-time-log", { hasText: "Answer emails" });
  await expect(timeLog).toBeVisible();

  // Deleting a log made by mistake, then undoing it.
  await timeLog.click();
  await page
    .getByRole("dialog", { name: "Logged time" })
    .getByRole("button", { name: "Delete time log" })
    .click();
  await expect(timeLog).toBeHidden();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(timeLog).toBeVisible();
});

test("the year view drills down to a day", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await chooseView(page, "Year");

  // The year view also renders the years either side, so pick this year's January.
  const january = page.getByRole("region", { name: `January ${new Date().getFullYear()}` });
  await expect(january).toBeVisible();
  await january.getByRole("button", { name: /, 1 January / }).click();
  await expect(page.getByRole("combobox", { name: "Calendar view" })).toHaveText("Day");
});

test("the multi-day view shows the chosen number of days", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await chooseView(page, "Multi-day");
  await expect(page.getByRole("columnheader")).toHaveCount(3);

  await page.getByRole("combobox", { name: "Number of days" }).click();
  await page.getByRole("option", { name: "5 days", exact: true }).click();

  await expect(page.getByRole("columnheader")).toHaveCount(5);
  await expect(page.getByRole("combobox", { name: "Number of days" })).toHaveText("5 days");
});

test("scrolling sideways pages through dates, and up and down through months", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  // Home has level 2 headings too, so wait for it to go.
  await expect(page.locator(".rbc-time-content")).toBeVisible();
  const title = page.getByRole("heading", { level: 2 });
  const thisWeek = await title.textContent();

  const grid = page.locator(".rbc-time-content");
  await grid.hover();
  // Scrolling up and down only moves through the hours.
  await page.mouse.wheel(0, 300);
  await expect(title).toHaveText(thisWeek ?? "");
  await page.mouse.wheel(200, 0);
  await expect(title).not.toHaveText(thisWeek ?? "");

  await chooseView(page, "Month");
  const thisMonth = await title.textContent();
  await page.locator(".rbc-month-view").hover();
  await page.mouse.wheel(0, 200);
  await expect(title).not.toHaveText(thisMonth ?? "");
});
