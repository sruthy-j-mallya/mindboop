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

test("reach the timer from the sidebar with nothing in progress", async ({ page }) => {
  await signUp(page);

  await page.getByRole("link", { name: "Timer" }).click();

  await expect(page.getByRole("heading", { name: "Nothing on the clock" })).toBeVisible();
  await page.getByRole("link", { name: "Start a session" }).click();
  await expect(page.getByRole("heading", { name: "What do you want to get done?" })).toBeVisible();
});
