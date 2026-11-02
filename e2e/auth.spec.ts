import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// The test server's mail never leaves the process, so mint the emailed sign-up token the same way Rails does.
const signupTokenFor = (email: string) =>
  execFileSync(resolve("bin/rails"), ["runner", "print User.signup_token_for(ARGV.first)", email], {
    env: { ...process.env, RAILS_ENV: "test" },
    encoding: "utf8",
  }).trim();

test("confirm email, sign up, sign out and sign back in", async ({ page }) => {
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password123";

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  await page.goto(`/signup/${signupTokenFor(email)}`);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText(`Signed in as ${email}`)).toBeVisible();
});
