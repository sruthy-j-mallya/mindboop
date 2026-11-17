import { expect, type Page, test } from "@playwright/test";

import { addSteps, backdateSession, signupTokenFor } from "./helpers";

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

// Puts two minutes of focus on the session in progress, the least that can be logged.
const focusForTwoMinutes = async (page: Page, email: string) => {
  backdateSession(email, 120);
  await page.reload();
  await expect(page.getByRole("timer")).toBeVisible();
};

test("begin a session, and keep it counting down through a reload", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await addSteps(page, ["First", "Second", "Third"]);
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();

  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("heading", { name: "Draft permission" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Steps" }).getByRole("listitem")).toHaveText([
    "First",
    "Second",
    "Third",
  ]);
  await expect(page.getByRole("timer")).toHaveText(/^09:[0-5]\d$/);

  const timeBeforeReload = await page.getByRole("timer").textContent();
  await page.reload();

  await expect(page.getByRole("heading", { name: "Draft permission" })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText(/^09:[0-5]\d$/);
  expect((await page.getByRole("timer").textContent())! <= timeBeforeReload!).toBe(true);
});

test("finish a session early, and watch the dialog fade away with nothing parked", async ({ page }) => {
  const email = await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await focusForTwoMinutes(page, email);
  await expect(page.getByRole("timer")).toHaveText(/^0[78]:[0-5]\d$/);

  await page.getByRole("button", { name: "Done" }).click();

  const dialog = page.getByRole("dialog", { name: /Finished early!/ });
  await expect(dialog.getByText("+1 early-finish boost")).toBeVisible();

  // Nothing was parked, so there's nothing to review: the dialog fades away by itself.
  await expect(dialog.getByRole("link")).toHaveCount(0);
  await expect(dialog).toBeHidden({ timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
});

test("finish a session with a parked thought and go review the parking lot", async ({ page }) => {
  const email = await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "Begin" }).click();
  const input = page
    .getByRole("region", { name: "Parking lot" })
    .getByRole("textbox", { name: "Thought to park" });
  await input.fill("Book a dentist");
  await input.press("Enter");
  await expect(page.getByRole("list", { name: "Parked thoughts" }).getByText("Book a dentist")).toBeVisible();
  await focusForTwoMinutes(page, email);

  await page.getByRole("button", { name: "Done" }).click();
  await page
    .getByRole("dialog", { name: /Finished/ })
    .getByRole("link", { name: "Review parking lot · 1" })
    .click();

  await expect(page).toHaveURL("/parking-lot");
  await expect(page.getByRole("list", { name: "Parked" }).getByText("Book a dentist")).toBeVisible();
});

test("Done in the first two minutes of a stopwatch only discards it", async ({ page }) => {
  await signUp(page);
  await page.getByRole("link", { name: "Inbox" }).click();
  await page.getByRole("textbox", { name: "New task" }).fill("Draft permission");
  await page.getByRole("textbox", { name: "New task" }).press("Enter");
  await expect(page.getByRole("textbox", { name: "Draft permission" })).toBeVisible();
  await page.getByRole("link", { name: "Timer" }).click();
  await page.getByRole("combobox", { name: "Task" }).click();
  await page.getByRole("option", { name: "Draft permission" }).click();
  await page.getByRole("tab", { name: "Stopwatch" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("timer")).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();

  const dialog = page.getByRole("dialog", { name: "Discard this timer?" });
  await expect(dialog).toContainText("too short to log");
  await dialog.getByRole("button", { name: "Discard timer" }).click();
  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Finished/ })).toBeHidden();

  // The task wasn't completed, so it can still be picked.
  await page.getByRole("combobox", { name: "Task" }).click();
  await expect(page.getByRole("option", { name: "Draft permission" })).toBeVisible();
});

test.describe("pausing", () => {
  const beginSession = async (page: Page) => {
    await signUp(page);
    await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
    await page.getByRole("button", { name: "10 min" }).click();
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page.getByRole("timer")).toBeVisible();
  };

  const takeBreak = async (page: Page) => {
    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: "Delivery · 5m" }).click();
    await page.getByRole("button", { name: "Pause & set reminder" }).click();
    await expect(page.getByText("Stepped away — Delivery")).toBeVisible();
  };

  test("holds the timer through a reload, then resumes", async ({ page }) => {
    await beginSession(page);
    await takeBreak(page);

    const pausedTime = await page.getByRole("timer").textContent();
    await expect(page.getByText(/^back in 0[45]:[0-5]\d$/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause" })).toBeDisabled();

    await page.reload();

    await expect(page.getByText("Stepped away — Delivery")).toBeVisible();
    await expect(page.getByRole("timer")).toHaveText(pausedTime!);

    await page.getByRole("button", { name: "I'm back" }).click();

    await expect(page.getByText("Focusing on")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pause" })).toBeEnabled();
    await expect(page.getByRole("timer")).not.toHaveText(pausedTime!);
  });

  test("rejects a break over the limit", async ({ page }) => {
    await beginSession(page);

    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: "Delivery · 5m" }).click();
    await page.getByLabel("Back in").fill("16");
    await page.getByRole("button", { name: "Pause & set reminder" }).click();

    await expect(page.getByText("Enter 1–15 whole minutes")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("rings on any page for a minute, then goes quiet with a notification", async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
      const alarm = { soundsStarted: 0, soundsStopped: 0, notifications: [] as string[], closed: 0 };
      Object.assign(window, { alarm });

      const { start, stop } = AudioBufferSourceNode.prototype;
      AudioBufferSourceNode.prototype.start = function (...args) {
        alarm.soundsStarted += 1;
        start.apply(this, args);
      };
      AudioBufferSourceNode.prototype.stop = function (...args) {
        alarm.soundsStopped += 1;
        stop.apply(this, args);
      };

      window.Notification = class {
        static readonly permission = "granted";
        constructor(title: string) {
          alarm.notifications.push(title);
        }
        close() {
          alarm.closed += 1;
        }
      } as unknown as typeof Notification;
    });
    const getAlarm = () =>
      page.evaluate(() => (window as unknown as { alarm: Record<string, unknown> }).alarm);

    await beginSession(page);
    await takeBreak(page);
    await page.getByRole("link", { name: "Quick start" }).click();
    await expect(page.getByRole("button", { name: "I'm back" })).toBeHidden();
    expect(await getAlarm()).toMatchObject({ soundsStarted: 0 });

    await page.clock.fastForward("05:01");

    await expect(page.getByText("Break's over — Delivery")).toBeVisible();
    await expect.poll(getAlarm).toMatchObject({ soundsStarted: 1, soundsStopped: 0, notifications: [] });

    await page.clock.fastForward("01:00");

    await expect
      .poll(getAlarm)
      .toMatchObject({ soundsStarted: 1, soundsStopped: 1, notifications: ["Break's over"], closed: 0 });

    await page.getByRole("button", { name: "I'm back" }).click();

    await expect(page.getByRole("button", { name: "I'm back" })).toBeHidden();
    await expect.poll(getAlarm).toMatchObject({ closed: 1 });
  });
});

test("extend a session up to the limit, and keep the extra time through a reload", async ({ page }) => {
  await signUp(page);
  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toHaveText(/^09:[0-5]\d$/);

  const dialog = page.getByRole("dialog", { name: "Extend carefully" });
  await page.getByRole("button", { name: "Extend" }).click();
  await expect(dialog.getByText("60 min")).toBeVisible();
  await dialog.getByRole("button", { name: "+15" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole("timer")).toHaveText(/^24:[0-5]\d$/);

  await page.reload();

  await expect(page.getByRole("timer")).toHaveText(/^24:[0-5]\d$/);

  await page.getByRole("button", { name: "Extend" }).click();
  await expect(dialog.getByText("45 min")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "+60" })).toBeDisabled();
  await dialog.getByRole("button", { name: "+30" }).click();

  await expect(page.getByRole("timer")).toHaveText(/^54:[0-5]\d$/);

  await page.getByRole("button", { name: "Extend" }).click();
  await expect(dialog.getByText("15 min")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "+20" })).toBeDisabled();
  await dialog.getByRole("button", { name: "+15" }).click();

  await expect(page.getByRole("timer")).toHaveText(/^69:[0-5]\d$/);
  await expect(page.getByRole("button", { name: "Extend" })).toBeDisabled();
});

test("bail out of a session, leaving breadcrumbs", async ({ page }) => {
  const email = await signUp(page);
  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await focusForTwoMinutes(page, email);

  await page.getByRole("button", { name: "Bail" }).click();

  const dialog = page.getByRole("dialog", { name: "Leave breadcrumbs" });
  await expect(dialog.getByRole("button", { name: "Save & exit" })).toBeDisabled();
  await dialog.getByLabel("Very next step").fill("Finish paragraph 2");
  await dialog.getByRole("button", { name: "Save & exit" }).click();

  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
  await expect(dialog).toBeHidden();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
});

test("bail out in the first two minutes, discarding the timer", async ({ page }) => {
  await signUp(page);
  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();

  const dialog = page.getByRole("dialog", { name: "Discard this timer?" });
  await page.getByRole("button", { name: "Bail" }).click();
  await dialog.getByRole("button", { name: "Keep going" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("timer")).toBeVisible();

  await page.getByRole("button", { name: "Bail" }).click();
  await dialog.getByRole("button", { name: "Discard timer" }).click();

  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
});

const addInboxTask = async (page: Page, title: string) => {
  await page.getByRole("link", { name: "Inbox" }).click();
  await page.getByRole("textbox", { name: "New task" }).fill(title);
  await page.getByRole("textbox", { name: "New task" }).press("Enter");
  await expect(page.getByRole("textbox", { name: title })).toBeVisible();
};

const pickTask = async (page: Page, title: string) => {
  await page.getByRole("combobox", { name: "Task" }).click();
  await page.getByRole("option", { name: title }).click();
};

test("search for an Inbox task and start a timer on it from the Timer page, with edited minutes", async ({
  page,
}) => {
  await signUp(page);
  await addInboxTask(page, "Draft permission");
  await addInboxTask(page, "Call the bank");

  await page.getByRole("link", { name: "Timer" }).click();
  await expect(page.getByRole("heading", { name: "Start a session" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Parking lot" })).toBeHidden();

  const search = page.getByRole("combobox", { name: "Task" });
  await search.click();
  await expect(page.getByRole("option")).toHaveText(["Draft permission", "Call the bank"]);
  await search.fill("PERMIS");
  await expect(page.getByRole("option")).toHaveText(["Draft permission"]);
  await search.press("Enter");
  await expect(search).toHaveValue("Draft permission");
  const minutes = page.getByRole("textbox", { name: /Timer minutes/ });
  await expect(minutes).toHaveValue("05");
  await minutes.click();
  await page.keyboard.type("12");
  await page.keyboard.press("Enter");
  await expect(minutes).toHaveValue("12");
  await page.getByRole("button", { name: "Start" }).click();

  await expect(page.getByRole("heading", { name: "Draft permission" })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText(/^1[01]:[0-5]\d$/);
  await expect(page.getByRole("button", { name: "Extend" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Parking lot" })).toBeVisible();
});

test("start a stopwatch from the Timer page", async ({ page }) => {
  await signUp(page);
  await addInboxTask(page, "Draft permission");

  await page.getByRole("link", { name: "Timer" }).click();
  await pickTask(page, "Draft permission");
  await page.getByRole("tab", { name: "Stopwatch" }).click();
  await expect(page.getByText("00:00")).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();

  await expect(page.getByRole("timer")).toHaveText(/^00:0\d$/);
  await expect(page.getByText("elapsed")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Extend" })).toBeHidden();
  await expect(page.getByRole("region", { name: "Parking lot" })).toBeVisible();
});

test("edit the steps and the description mid-session, and keep them through a reload", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await addSteps(page, ["First", "Second"]);
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();

  const steps = page.getByRole("list", { name: "Steps" }).getByRole("listitem");
  await page.getByRole("checkbox", { name: "First" }).click();
  await expect(page.getByRole("checkbox", { name: "First" })).toBeChecked();
  // With steps already there, the add button is gone; Enter in the last step adds the next one.
  await expect(page.getByRole("button", { name: "Add step" })).toBeHidden();
  await page.getByRole("button", { name: "Edit Second" }).click();
  await page.getByRole("textbox", { name: "Step text" }).press("Enter");
  const thirdStep = page.getByRole("textbox", { name: "New step" });
  await thirdStep.fill("Third");
  await thirdStep.press("Enter");
  await thirdStep.press("Escape");
  await expect(steps).toHaveText(["First", "Second", "Third"]);
  await page.getByRole("button", { name: "Edit Second" }).click();
  await page.getByRole("textbox", { name: "Step text" }).fill("Middle");
  await page.getByRole("textbox", { name: "Step text" }).press("Enter");
  const announcement = page.getByRole("status");
  await page.getByRole("button", { name: "Reorder Third" }).focus();
  await page.keyboard.press("Space");
  await expect(announcement).toHaveText("Picked up Third.");
  // dnd-kit starts listening for keys a tick after the pick up, so an early press can be missed.
  await expect(async () => {
    await page.keyboard.press("ArrowUp");
    await expect(announcement).toHaveText("Third moved over Middle.", { timeout: 200 });
  }).toPass();
  await page.keyboard.press("ArrowUp");
  await expect(announcement).toHaveText("Third moved over First.");
  await page.keyboard.press("Space");
  await expect(steps).toHaveText(["Third", "First", "Middle"]);

  // The description is editable in place and saves itself once typing pauses (waits for the save of the whole text).
  const descriptionSaved = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      /\/api\/tasks\/[^/]+$/.test(response.url()) &&
      (response.request().postData() ?? "").includes("Cite **sources**"),
  );
  const editor = page.getByRole("textbox", { name: "Description" });
  await editor.click();
  await editor.pressSequentially("Cite **sources** ");
  await expect(editor.locator("strong")).toHaveText("sources");
  await descriptionSaved;

  await page.reload();

  await expect(steps).toHaveText(["Third", "First", "Middle"]);
  await expect(page.getByRole("checkbox", { name: "First" })).toBeChecked();
  await expect(page.getByRole("region", { name: "Description" }).locator("strong")).toHaveText("sources");

  // Enter in a step opens a new one right below it, and each Enter after that adds the next one below.
  let createdCount = 0;
  const bothCreated = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/checklist_items") &&
      (createdCount += 1) === 2,
  );
  await page.getByRole("button", { name: "Edit First" }).click();
  await page.getByRole("textbox", { name: "Step text" }).press("Enter");
  const newStep = page.getByRole("textbox", { name: "New step" });
  await newStep.fill("Second");
  await newStep.press("Enter");
  await newStep.fill("Almost");
  await newStep.press("Enter");
  await newStep.press("Escape");
  await expect(steps).toHaveText(["Third", "First", "Second", "Almost", "Middle"]);
  // New steps show before the server has them, so wait for both saves before reloading.
  await bothCreated;

  await page.reload();

  await expect(steps).toHaveText(["Third", "First", "Second", "Almost", "Middle"]);
});

test("start an estimated Inbox task, switching from the one on the clock by marking it done", async ({
  page,
}) => {
  const email = await signUp(page);
  await addInboxTask(page, "Draft permission");
  await addInboxTask(page, "Call the bank");

  // Start the first task from its pane: the Timer opens with it picked.
  await page.getByRole("link", { name: "Inbox" }).click();
  await page.getByRole("textbox", { name: "Draft permission" }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("combobox", { name: "Task" })).toHaveValue("Draft permission");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Draft permission" })).toBeVisible();
  await focusForTwoMinutes(page, email);

  // Estimate the second task, then start it: the first is still on the clock.
  await page.getByRole("link", { name: "Inbox" }).click();
  await page.getByRole("textbox", { name: "Call the bank" }).click();
  await page.getByRole("button", { name: "Estimate" }).click();
  await page.getByLabel("Minutes").fill("45");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("button", { name: "45 min" })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();

  const dialog = page.getByRole("dialog", { name: "Switch tasks?" });
  await expect(dialog.getByRole("region", { name: "Running session" })).toContainText("Draft permission");
  await dialog.getByRole("button", { name: "Mark as done" }).click();

  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("combobox", { name: "Task" })).toHaveValue("Call the bank");
  await expect(page.getByRole("textbox", { name: /Timer minutes/ })).toHaveValue("45");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("heading", { name: "Call the bank" })).toBeVisible();
  await expect(page.getByRole("timer")).toHaveText(/^4[45]:[0-5]\d$/);

  // The finished task has left the Inbox.
  await page.getByRole("link", { name: "Inbox" }).click();
  await expect(page.getByRole("textbox", { name: "Call the bank" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Draft permission" })).toBeHidden();
});

test("keep the clock in view in a mini timer on other pages, and go back to the Timer from it", async ({
  page,
}) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByRole("region", { name: "Current session" })).toBeHidden();

  await page.getByRole("link", { name: "Inbox" }).click();
  const session = page.getByRole("region", { name: "Current session" });
  await expect(session.getByRole("timer")).toHaveText(/^09:[0-5]\d$/);

  await page.getByRole("link", { name: "Parking lot" }).click();
  await expect(session.getByRole("timer")).toHaveText(/^09:[0-5]\d$/);

  await session.getByRole("link", { name: "Back to timer" }).click();
  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("heading", { name: "Draft permission" })).toBeVisible();
  await expect(session).toBeHidden();
});
