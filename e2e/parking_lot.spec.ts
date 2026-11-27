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
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page).toHaveURL("/timer");

  const parkingLot = page.getByRole("region", { name: "Parking lot" });
  await expect(parkingLot.getByText("Stray thought? Type it below.")).toBeVisible();

  const input = parkingLot.getByRole("textbox", { name: "Thought to park" });
  await input.fill("Build an aeroplane");
  await input.press("Enter");
  await expect(parkingLot.getByText("Build an aeroplane")).toBeVisible();
  // Each one waits for the last to land, so they're saved in the order typed.
  await input.fill("Is the library open on Sunday?");
  await input.press("Enter");
  await expect(parkingLot.getByText("Is the library open on Sunday?")).toBeVisible();
  await input.fill("Clean my scooter");
  await input.press("Enter");

  await expect(parkingLot.getByRole("list", { name: "Parked thoughts" }).getByRole("listitem")).toHaveText([
    /Build an aeroplane/,
    /Is the library open on Sunday\?/,
    /Clean my scooter/,
  ]);

  await page.getByRole("link", { name: "Parking lot" }).click();
  await expect(page).toHaveURL("/parking-lot");
  const parked = page.getByRole("list", { name: "Parked" });
  await expect(parked.getByRole("listitem")).toHaveCount(3);

  const scooter = parked.getByRole("listitem").filter({ hasText: "Clean my scooter" });
  await scooter.getByRole("button", { name: "Add as task" }).click();
  await page.getByRole("button", { name: "Add undated" }).click();
  await expect(page.getByText("Added to your Inbox")).toBeVisible();

  // A quick look-up gets a timeboxed curiosity time, shown on every page until it's dealt with.
  const library = parked.getByRole("listitem").filter({ hasText: "Is the library open on Sunday?" });
  await library.getByRole("button", { name: "Look into it · 5 min" }).click();
  const curiosity = page.getByRole("region", { name: "Curiosity time" });
  await expect(curiosity).toContainText(/Curiosity time · 0[45]:\d{2} left/);
  await expect(library.getByText("Looking into it")).toBeVisible();
  await curiosity.getByRole("button", { name: "Done, mark addressed" }).click();
  await expect(curiosity).toBeHidden();

  const aeroplane = parked.getByRole("listitem").filter({ hasText: "Build an aeroplane" });
  await aeroplane.getByRole("button", { name: "Let it go" }).click();
  await expect(page.getByText("Let go", { exact: true })).toBeVisible();
  await expect(page.getByText("Nothing parked. Your head is clear.")).toBeVisible();

  await page.getByRole("tab", { name: "Addressed" }).click();
  await expect(page.getByRole("list", { name: "Addressed" })).toHaveText(/Is the library open on Sunday\?/);

  await page.getByRole("tab", { name: "Added as tasks" }).click();
  await page.getByRole("link", { name: "Open task" }).click();
  await expect(page.getByRole("heading", { name: "Clean my scooter" })).toBeVisible();
});

test("mark several thoughts addressed, then let them all go", async ({ page }) => {
  await signUp(page);
  await page.goto("/parking-lot");

  const input = page.getByRole("textbox", { name: "Thought to park" });
  const parked = page.getByRole("list", { name: "Parked" });
  for (const thought of ["Build an aeroplane", "Renew passport", "Who wrote Dune?"]) {
    await input.fill(thought);
    await input.press("Enter");
    await expect(parked.getByText(thought)).toBeVisible();
  }

  await page.getByRole("checkbox", { name: "Select Build an aeroplane" }).check();
  await page.getByRole("checkbox", { name: "Select Who wrote Dune?" }).check();
  const toolbar = page.getByRole("toolbar", { name: "Bulk actions" });
  await expect(toolbar).toContainText("2 thoughts selected");
  await toolbar.getByRole("button", { name: "Mark addressed" }).click();
  await expect(page.getByText("2 thoughts marked as addressed")).toBeVisible();
  await expect(parked.getByRole("listitem")).toHaveText([/Renew passport/]);

  await page.getByRole("tab", { name: "Addressed" }).click();
  const addressed = page.getByRole("list", { name: "Addressed" });
  await expect(addressed.getByRole("listitem")).toHaveCount(2);
  await page.getByRole("checkbox", { name: "Select all" }).check();
  await toolbar.getByRole("button", { name: "Let it go" }).click();
  await expect(page.getByText("Let go of 2 thoughts")).toBeVisible();
  await expect(page.getByText("Thoughts you mark as addressed land here.")).toBeVisible();

  // The earlier toast may still be up, so pick the Undo on this one.
  await page
    .getByRole("listitem")
    .filter({ hasText: "Let go of 2 thoughts" })
    .getByRole("button", { name: "Undo" })
    .click();
  await expect(addressed.getByRole("listitem")).toHaveCount(2);
});
