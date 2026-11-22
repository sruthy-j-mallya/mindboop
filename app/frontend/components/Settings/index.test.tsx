import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import type { UserPreference } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import Settings from "@/components/Settings";
import { renderWithProviders } from "@/test/utils";
import { previewAlarmSound } from "@/utils/alarmSound";
import { playCompletionSound } from "@/utils/completionSound";

vi.mock("@/utils/completionSound");
vi.mock("@/utils/alarmSound");

const PREFERENCE: UserPreference = {
  theme: "system",
  completionSound: "rising",
  breakAlarmSound: "classic",
  weekStartsOn: 1,
};

const renderSettings = (preference: Partial<UserPreference> = {}) => {
  vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
    userPreference: { ...PREFERENCE, ...preference },
  });
  renderWithProviders(<Settings />);
};

const choose = async (field: string, option: string) => {
  await userEvent.click(await screen.findByRole("combobox", { name: field }));
  await userEvent.click(screen.getByRole("option", { name: option }));
};

describe("Settings", () => {
  beforeEach(() => {
    vi.spyOn(userPreferencesApi, "update").mockImplementation((changes) =>
      Promise.resolve({ userPreference: { ...PREFERENCE, ...changes } }),
    );
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("shows the saved preferences", async () => {
    renderSettings({ theme: "dark", completionSound: "bell", breakAlarmSound: "marimba" });

    expect(await screen.findByRole("combobox", { name: "Theme" })).toHaveTextContent("Dark");
    expect(screen.getByRole("combobox", { name: "Task completed" })).toHaveTextContent("Bell");
    expect(screen.getByRole("combobox", { name: "Break over" })).toHaveTextContent("Marimba");
  });

  it("saves the chosen theme", async () => {
    renderSettings();

    await choose("Theme", "Dark");

    expect(userPreferencesApi.update).toHaveBeenCalledWith({ theme: "dark" }, expect.anything());
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveTextContent("Dark");
  });

  it("shows and saves the day the week starts on", async () => {
    renderSettings({ weekStartsOn: 6 });

    expect(await screen.findByRole("combobox", { name: "Week starts on" })).toHaveTextContent("Saturday");

    await choose("Week starts on", "Sunday");

    expect(userPreferencesApi.update).toHaveBeenCalledWith({ weekStartsOn: 0 }, expect.anything());
    expect(screen.getByRole("combobox", { name: "Week starts on" })).toHaveTextContent("Sunday");
  });

  it("plays and saves the chosen completion sound", async () => {
    renderSettings();

    await choose("Task completed", "Wooden tick-tick");

    expect(playCompletionSound).toHaveBeenCalledWith("wood");
    expect(userPreferencesApi.update).toHaveBeenCalledWith({ completionSound: "wood" }, expect.anything());
    expect(screen.getByRole("combobox", { name: "Task completed" })).toHaveTextContent("Wooden tick-tick");
  });

  it("plays and saves the chosen break alarm", async () => {
    renderSettings();

    await choose("Break over", "Chimes");

    expect(previewAlarmSound).toHaveBeenCalledWith("chimes");
    expect(userPreferencesApi.update).toHaveBeenCalledWith({ breakAlarmSound: "chimes" }, expect.anything());
  });

  it("replays the chosen sounds", async () => {
    renderSettings({ completionSound: "glass", breakAlarmSound: "bell" });

    await userEvent.click(await screen.findByRole("button", { name: "Play task completed sound" }));
    await userEvent.click(screen.getByRole("button", { name: "Play break over sound" }));

    expect(playCompletionSound).toHaveBeenCalledWith("glass");
    expect(previewAlarmSound).toHaveBeenCalledWith("bell");
  });

  it("can't replay the completion sound once it's off", async () => {
    renderSettings();

    await choose("Task completed", "Off");

    expect(userPreferencesApi.update).toHaveBeenCalledWith({ completionSound: "none" }, expect.anything());
    expect(screen.getByRole("button", { name: "Play task completed sound" })).toBeDisabled();
  });

  it("puts the previous choice back when saving fails", async () => {
    vi.mocked(userPreferencesApi.update).mockRejectedValue(new ApiError(422, "Something went wrong"));
    renderSettings();

    await choose("Task completed", "Bell");

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Task completed" })).toHaveTextContent("Rising tick-tick"),
    );
  });
});
