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

// react-big-calendar's time slots have no accessible names, so the grid is reached through its own classes: the
// first quarter hour of the given hour in the (single) day column.
const hourSlot = (page: Page, hour: number) =>
  page
    .locator(".rbc-time-content .rbc-day-slot .rbc-timeslot-group")
    .nth(hour)
    .locator(".rbc-time-slot")
    .first();

// The events layer sits over the slots, so a click goes to the slot's spot on screen rather than to the element.
const clickSlot = async (page: Page, hour: number) => {
  const slot = hourSlot(page, hour);
  await slot.scrollIntoViewIfNeeded();
  const box = await slot.boundingBox();
  if (!box) throw new Error("The slot should be on screen");
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

test("add, edit and move a task from the calendar", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await page.getByRole("tab", { name: "Day", exact: true }).click();
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
  await expect(event).toContainText("10:00 AM – 10:30 AM");

  await event.click();
  const editTask = page.getByRole("dialog", { name: "Edit task" });
  await expect(editTask.getByRole("checkbox", { name: "List the goals" })).toBeVisible();
  await editTask.getByRole("textbox", { name: "Title" }).fill("Plan the month");
  await editTask.getByRole("textbox", { name: "Title" }).press("Enter");
  await expect(editTask).toBeHidden();
  const renamed = page.locator(".calendar-event-task", { hasText: "Plan the month" });
  await expect(renamed).toBeVisible();

  // Dragged two hours later.
  const from = await renamed.boundingBox();
  const to = await hourSlot(page, 12).boundingBox();
  if (!from || !to) throw new Error("The event and the slot should be on screen");
  await page.mouse.move(from.x + from.width / 2, from.y + 4);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, to.y + 10, { steps: 10 });
  await page.mouse.move(from.x + from.width / 2, to.y + 4, { steps: 2 });
  await page.mouse.up();
  await expect(renamed).toContainText("12:00 PM – 12:30 PM");

  await page.reload();
  await page.getByRole("tab", { name: "Day", exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".calendar-event-task", { hasText: "Plan the month" })).toContainText("12:00 PM");
});

// Presses the event's top or bottom edge and drags it to the given slot.
const dragEdge = async (page: Page, event: Locator, edge: "top" | "bottom", hour: number) => {
  const from = await event.boundingBox();
  const to = await hourSlot(page, hour).boundingBox();
  if (!from || !to) throw new Error("The event and the slot should be on screen");
  const x = from.x + from.width / 2;
  await page.mouse.move(x, edge === "top" ? from.y + 1 : from.y + from.height - 1);
  await page.mouse.down();
  await page.mouse.move(x, to.y + 10, { steps: 10 });
  await page.mouse.move(x, to.y + 4, { steps: 2 });
  await page.mouse.up();
};

test("stretch a task from its start and its end", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await page.getByRole("tab", { name: "Day", exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await clickSlot(page, 10);
  const newTask = page.getByRole("dialog", { name: "New task" });
  await newTask.getByRole("textbox", { name: "Title" }).fill("Deep work");
  await page.keyboard.press("Escape");
  await expect(newTask).toBeHidden();

  const event = page.locator(".calendar-event-task", { hasText: "Deep work" });
  await expect(event).toContainText("10:00 AM – 10:30 AM");

  await dragEdge(page, event, "top", 9);
  await expect(event).toContainText("9:00 AM – 10:30 AM");

  await dragEdge(page, event, "bottom", 12);
  await expect(event).toContainText("9:00 AM – 12:00 PM");

  await page.reload();
  await page.getByRole("tab", { name: "Day", exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".calendar-event-task", { hasText: "Deep work" })).toContainText(
    "9:00 AM – 12:00 PM",
  );
});

test("log time in the last 24 hours with only a title", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await page.getByRole("tab", { name: "Day", exact: true }).click();

  const now = new Date();
  const start = startOfHour(subHours(now, 2));
  if (!isSameDay(start, now)) await page.getByRole("button", { name: "Previous" }).click();

  await clickSlot(page, start.getHours());
  const logTime = page.getByRole("dialog", { name: "Log time" });
  await logTime.getByRole("textbox", { name: "What did you work on?" }).fill("Answer emails");
  await page.keyboard.press("Escape");
  await expect(logTime).toBeHidden();

  await expect(page.locator(".calendar-event-time-log", { hasText: "Answer emails" })).toBeVisible();
});

test("the year view drills down to a day", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Calendar" }).click();
  await page.getByRole("tab", { name: "Year", exact: true }).click();

  await expect(page.getByRole("region", { name: /^January / })).toBeVisible();
  await page.getByRole("button", { name: /, 1 January / }).click();
  await expect(page.getByRole("tab", { name: "Day", exact: true, selected: true })).toBeVisible();
});
