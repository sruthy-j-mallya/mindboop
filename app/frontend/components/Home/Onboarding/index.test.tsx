import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import onboardingsApi from "@/apis/onboardings";
import sessionsApi from "@/apis/sessions";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

import Onboarding from ".";

const NOTHING_DONE = { hasLifeAreas: false, hasTasks: false, hasSessions: false };

describe("Onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(sessionsApi, "show").mockResolvedValue({
      user: { id: "8d0f2b6e-4c1a-4e3b-9f7d-1a2b3c4d5e6f", emailAddress: "someone@example.com" },
    });
    vi.spyOn(onboardingsApi, "show").mockResolvedValue({ onboarding: NOTHING_DONE });
  });

  afterEach(() => vi.restoreAllMocks());

  it("leads to the steps left, and marks the ones taken", async () => {
    vi.mocked(onboardingsApi.show).mockResolvedValue({ onboarding: { ...NOTHING_DONE, hasTasks: true } });
    renderWithProviders(<Onboarding />);

    expect(await screen.findByRole("link", { name: /Start a session/ })).toHaveAttribute(
      "href",
      routes.timer,
    );
    expect(screen.getByRole("link", { name: /Create an area/ })).toBeVisible();
    expect(screen.queryByRole("link", { name: /Add a task/ })).not.toBeInTheDocument();
    expect(screen.getByText("(done)")).toBeInTheDocument();
  });

  it("goes once every step is taken", async () => {
    vi.mocked(onboardingsApi.show).mockResolvedValue({
      onboarding: { hasLifeAreas: true, hasTasks: true, hasSessions: true },
    });
    renderWithProviders(<Onboarding />);

    await vi.waitFor(() => expect(onboardingsApi.show).toHaveBeenCalled());
    expect(screen.queryByRole("heading", { name: "Getting started" })).not.toBeInTheDocument();
  });

  it("stays away once dismissed", async () => {
    const { unmount } = renderWithProviders(<Onboarding />);
    await userEvent.click(await screen.findByRole("button", { name: "Dismiss getting started" }));
    expect(screen.queryByRole("heading", { name: "Getting started" })).not.toBeInTheDocument();
    unmount();
    vi.mocked(sessionsApi.show).mockClear();
    vi.mocked(onboardingsApi.show).mockClear();

    renderWithProviders(<Onboarding />);

    await vi.waitFor(() => expect(sessionsApi.show).toHaveBeenCalled());
    expect(onboardingsApi.show).not.toHaveBeenCalled();
  });
});
