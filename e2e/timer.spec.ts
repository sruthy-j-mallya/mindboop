import { expect, type Page, test } from "@playwright/test";

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

test("begin a session, and keep it counting down through a reload", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  const newStep = page.getByRole("textbox", { name: "New step" });
  for (const step of ["First", "Second", "Third"]) {
    await newStep.fill(step);
    await newStep.press("Enter");
  }
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

test("finish a session early and move on to the next one", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();

  const dialog = page.getByRole("dialog", { name: /Finished early!/ });
  await expect(dialog.getByText("+1 early-finish boost")).toBeVisible();

  await dialog.getByRole("link", { name: "Move on to next" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();

  await page.getByRole("link", { name: "Timer" }).click();
  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
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
  await page.clock.install();
  await signUp(page);
  await page.getByRole("textbox", { name: "Task" }).fill("Draft permission");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await page.clock.fastForward("02:00");

  await page.getByRole("button", { name: "Bail" }).click();

  const dialog = page.getByRole("dialog", { name: "Leave breadcrumbs" });
  await expect(dialog.getByRole("button", { name: "Save & exit" })).toBeDisabled();
  await dialog.getByLabel("Very next step").fill("Finish paragraph 2");
  await dialog.getByRole("button", { name: "Save & exit" }).click();

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
  await expect(dialog).toBeHidden();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
});

test("reach the timer from the sidebar with nothing in progress", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Timer" }).click();

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
  await page.getByRole("link", { name: "Start a session" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
});
