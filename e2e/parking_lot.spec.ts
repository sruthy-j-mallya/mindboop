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

test("park thoughts during a session, then deal with them on the Parking lot page", async ({ page }) => {
  await signUp(page);

  await page.getByRole("textbox", { name: "Task" }).fill("Write the report");
  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page).toHaveURL("/timer");

  const parkingLot = page.getByRole("region", { name: "Parking lot" });
  await expect(parkingLot.getByText("Stray thought? Type it below.")).toBeVisible();

  const input = parkingLot.getByRole("textbox", { name: "Thought to park" });
  await input.fill("Build an aeroplane");
  await input.press("Enter");
  await expect(parkingLot.getByText("Build an aeroplane")).toBeVisible();
  await parkingLot.getByText("question", { exact: true }).click();
  await input.fill("Is the library open on Sunday?");
  await input.press("Enter");
  await parkingLot.getByText("task", { exact: true }).click();
  await input.fill("Clean my scooter");
  await input.press("Enter");

  await expect(parkingLot.getByRole("list", { name: "Parked thoughts" }).getByRole("listitem")).toHaveText([
    /Build an aeroplane\s*idea/,
    /Is the library open on Sunday\?\s*question/,
    /Clean my scooter\s*task/,
  ]);

  await page.getByRole("link", { name: "Parking lot" }).click();
  await expect(page).toHaveURL("/parking-lot");
  const parked = page.getByRole("list", { name: "Parked" });
  await expect(parked.getByRole("listitem")).toHaveCount(3);

  const scooter = parked.getByRole("listitem").filter({ hasText: "Clean my scooter" });
  await scooter.getByRole("button", { name: "Add as task" }).click();
  await expect(page.getByText("Added to your Inbox")).toBeVisible();

  const library = parked.getByRole("listitem").filter({ hasText: "Is the library open on Sunday?" });
  await library.getByRole("button", { name: "Mark addressed" }).click();
  await expect(page.getByText("Marked as addressed")).toBeVisible();

  const aeroplane = parked.getByRole("listitem").filter({ hasText: "Build an aeroplane" });
  await aeroplane.getByRole("button", { name: "Discard" }).click();
  await expect(page.getByText("Nothing parked. Your head is clear.")).toBeVisible();

  await page.getByRole("tab", { name: "Addressed" }).click();
  await expect(page.getByRole("list", { name: "Addressed" })).toHaveText(/Is the library open on Sunday\?/);

  await page.getByRole("tab", { name: "Added as tasks" }).click();
  await page.getByRole("link", { name: "Open task" }).click();
  await expect(page.getByRole("heading", { name: "Clean my scooter" })).toBeVisible();
});
