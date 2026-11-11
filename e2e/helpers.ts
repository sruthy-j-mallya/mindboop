import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// The test server's mail never leaves the process, so mint the emailed sign-up token the same way Rails does.
export const signupTokenFor = (email: string) =>
  execFileSync(resolve("bin/rails"), ["runner", "print User.signup_token_for(ARGV.first)", email], {
    env: { ...process.env, RAILS_ENV: "test" },
    encoding: "utf8",
  }).trim();
