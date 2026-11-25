import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import currentTimeLogsApi from "@/apis/current_time_logs";
import parkingLotItemsApi from "@/apis/parking_lot_items";
import routinesApi from "@/apis/routines";
import sessionsApi from "@/apis/sessions";
import userPreferencesApi from "@/apis/user_preferences";
import Main from "@/Main";
import { renderWithProviders } from "@/test/utils";

describe("NotFound", () => {
  beforeEach(() => {
    vi.spyOn(sessionsApi, "show").mockResolvedValue({
      user: { id: crypto.randomUUID(), emailAddress: "someone@example.com" },
    });
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
    vi.spyOn(parkingLotItemsApi, "fetchList").mockResolvedValue({
      parkingLotItems: [],
      parkingLotItemsCount: 0,
      page: 1,
      totalPages: 1,
    });
    vi.spyOn(routinesApi, "fetchList").mockResolvedValue({ routines: [] });
    vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
      userPreference: {
        theme: "light",
        completionSound: "rising",
        breakAlarmSound: "classic",
        weekStartsOn: 1,
      },
    });
  });

  it("leads home from an unknown path, with the sidebar still there", async () => {
    renderWithProviders(<Main />, undefined, "/nowhere");

    expect(await screen.findByRole("heading", { name: "This page isn’t here" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Calendar" })).toBeVisible();
  });
});
