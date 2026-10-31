import { defineConfig, devices } from "@playwright/test";

const port = 5100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bin/vite build && bin/rails db:prepare && bin/rails server -p ${port}`,
    env: { RAILS_ENV: "test" },
    url: `http://localhost:${port}/up`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
