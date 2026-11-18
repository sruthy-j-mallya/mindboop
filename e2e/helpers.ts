import type { Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// The test server's mail never leaves the process, so mint the emailed sign-up token the same way Rails does.
export const signupTokenFor = (email: string) =>
  execFileSync(resolve("bin/rails"), ["runner", "print User.signup_token_for(ARGV.first)", email], {
    env: { ...process.env, RAILS_ENV: "test" },
    encoding: "utf8",
  }).trim();

// Moves the user's session in progress `seconds` back in time on the server, as if they'd been focusing that long.
// Ending a session needs 2 minutes of focus, which the server checks against its own clock; reload the page after.
const BACKDATE_SESSION = `
  user = User.find_by!(email_address: ARGV[0])
  seconds = Integer(ARGV[1])
  TimeLog.active.in_progress.joins(:task).where(tasks: { user_id: user.id }).find_each do |time_log|
    time_log.update!(
      started_at: time_log.started_at - seconds,
      current_run_started_at: time_log.current_run_started_at && time_log.current_run_started_at - seconds
    )
  end
`;

export const backdateSession = (email: string, seconds: number) =>
  execFileSync(resolve("bin/rails"), ["runner", BACKDATE_SESSION, email, String(seconds)], {
    env: { ...process.env, RAILS_ENV: "test" },
  });

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
