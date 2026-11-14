import type { Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// The test server's mail never leaves the process, so mint the emailed sign-up token the same way Rails does.
export const signupTokenFor = (email: string) =>
  execFileSync(resolve("bin/rails"), ["runner", "print User.signup_token_for(ARGV.first)", email], {
    env: { ...process.env, RAILS_ENV: "test" },
    encoding: "utf8",
  }).trim();

// Opens a new step row, types each step followed by Enter (which opens the next row), then closes the last empty row.
export const addSteps = async (page: Page, steps: string[]) => {
  await page.getByRole("button", { name: "Add step" }).click();
  const input = page.getByRole("textbox", { name: "New step" });

  for (const step of steps) {
    await input.fill(step);
    await input.press("Enter");
  }
  await input.press("Escape");
};
