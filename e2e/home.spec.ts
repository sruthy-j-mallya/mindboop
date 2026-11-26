import { expect, type Page, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { signupTokenFor } from "./helpers";

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

// An overdue task and one with a breadcrumb, which take days or minutes of focus to come by in the app.
const SEED_TASKS = `
  user = User.find_by!(email_address: ARGV[0])
  # Planned back when the day was still ahead; a new start can't be in the past.
  user.tasks.new(title: "Renew passport", is_all_day: true, starts_at: 3.days.ago).save!(validate: false)
  task = user.tasks.create!(title: "Write the report")
  task.breadcrumbs.create!(restart_description: "Chapter 2")
`;

const seedTasks = (email: string) =>
  execFileSync(resolve("bin/rails"), ["runner", SEED_TASKS, email], {
    env: { ...process.env, RAILS_ENV: "test" },
  });

test("move an overdue task to today, then complete it", async ({ page }) => {
  seedTasks(await signUp(page));
  await page.reload();

  const agenda = page.getByRole("region", { name: "Today's agenda" });
  const overdue = page.getByRole("region", { name: "Overdue" });
  await expect(page.getByText("0 on today's agenda, 1 overdue")).toBeVisible();

  await overdue.getByRole("button", { name: "Move Renew passport to today" }).click();

  await expect(overdue.getByText("Nothing overdue.")).toBeVisible();
  await expect(agenda.getByRole("link", { name: "Renew passport" })).toBeVisible();
  await expect(agenda.getByText("All day", { exact: true })).toBeVisible();

  await agenda.getByRole("checkbox", { name: "Complete Renew passport" }).click();

  await expect(agenda.getByText("Nothing is due or scheduled today.")).toBeVisible();
  await expect(page.getByText("Your day is clear.")).toBeVisible();
});

test("resume a task from its breadcrumb", async ({ page }) => {
  seedTasks(await signUp(page));
  await page.reload();

  const resumable = page.getByRole("region", { name: "Pick up where you left off" });
  await expect(resumable.getByText("Pick up from: Chapter 2")).toBeVisible();

  await resumable.getByRole("button", { name: "Resume: Write the report" }).click();

  await expect(page).toHaveURL("/timer");
  await expect(page.getByRole("combobox", { name: "Task" })).toHaveValue("Write the report");
});

test("open a task from its title", async ({ page }) => {
  seedTasks(await signUp(page));
  await page.reload();

  await page.getByRole("link", { name: "Renew passport" }).click();

  await expect(page).toHaveURL(/\/inbox\/.+/);
  await expect(page.getByRole("heading", { name: "Renew passport" })).toBeVisible();
});
