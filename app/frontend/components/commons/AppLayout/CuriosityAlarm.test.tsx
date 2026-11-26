import { act, fireEvent, screen } from "@testing-library/react";

import curiosityTimesApi from "@/apis/curiosity_times";
import parkingLotItemsApi from "@/apis/parking_lot_items";
import type { ParkingLotItem } from "@/apis/types";
import userPreferencesApi from "@/apis/user_preferences";
import { renderWithProviders } from "@/test/utils";
import { startAlarmSound } from "@/utils/alarmSound";
import { showNotification } from "@/utils/notifications";

import CuriosityAlarm from "./CuriosityAlarm";

vi.mock("@/utils/alarmSound");
vi.mock("@/utils/notifications");

const NOW = new Date("2026-11-15T10:00:00.000Z").getTime();
const ONE_MINUTE = 60_000;

const buildItem = (endsAt: number, overrides: Partial<ParkingLotItem> = {}): ParkingLotItem => ({
  id: "8d3f1a52-6b7c-4e90-a1d2-3c4b5e6f7a8b",
  content: "How old is the lead actor?",
  status: "parked",
  taskId: null,
  timeLogId: null,
  curiosityEndsAt: new Date(endsAt).toISOString(),
  isCuriosityExtended: false,
  createdAt: new Date(NOW).toISOString(),
  updatedAt: new Date(NOW).toISOString(),
  ...overrides,
});

const advance = (milliseconds: number) => act(() => vi.advanceTimersByTimeAsync(milliseconds));

const renderAlarm = async (parkingLotItem: ParkingLotItem | null) => {
  vi.spyOn(curiosityTimesApi, "show").mockResolvedValue({ parkingLotItem });
  vi.spyOn(userPreferencesApi, "show").mockResolvedValue({
    userPreference: {
      theme: "system",
      completionSound: "rising",
      breakAlarmSound: "marimba",
      weekStartsOn: 1,
      timeFormat: "12h",
    },
  });
  renderWithProviders(<CuriosityAlarm />);
  await advance(0);
};

describe("CuriosityAlarm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(startAlarmSound).mockReturnValue(vi.fn());
    vi.mocked(showNotification).mockReturnValue({ close: vi.fn() } as unknown as Notification);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("shows nothing without a curiosity time", async () => {
    await renderAlarm(null);

    expect(screen.queryByRole("region", { name: "Curiosity time" })).not.toBeInTheDocument();
  });

  it("counts down, then rings and asks for the answer", async () => {
    await renderAlarm(buildItem(NOW + 5 * ONE_MINUTE));

    expect(screen.getByText("Curiosity time · 05:00 left")).toBeVisible();
    expect(screen.getByText("How old is the lead actor?")).toBeVisible();

    await advance(5 * ONE_MINUTE);

    expect(startAlarmSound).toHaveBeenCalledExactlyOnceWith("marimba");
    expect(screen.getByText("Time's up. Got your answer?")).toBeVisible();
    expect(screen.getByRole("button", { name: "5 more minutes" })).toBeVisible();

    await advance(ONE_MINUTE);
    expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({ title: "Curiosity time's up" }));
  });

  it("offers more time only once", async () => {
    await renderAlarm(buildItem(NOW - 1000, { isCuriosityExtended: true }));

    expect(screen.getByText("Time's up. Got your answer?")).toBeVisible();
    expect(screen.queryByRole("button", { name: "5 more minutes" })).not.toBeInTheDocument();
  });

  it("marks the thought addressed when done", async () => {
    const item = buildItem(NOW - 1000);
    const update = vi.spyOn(parkingLotItemsApi, "update").mockResolvedValue({ parkingLotItem: item });
    await renderAlarm(item);

    fireEvent.click(screen.getByRole("button", { name: "Done, mark addressed" }));
    await advance(0);

    expect(update).toHaveBeenCalledWith({ id: item.id, status: "addressed" }, expect.anything());
  });

  it("adds more time and ends it on Not now", async () => {
    const item = buildItem(NOW - 1000);
    const extend = vi.spyOn(curiosityTimesApi, "update").mockResolvedValue({ parkingLotItem: item });
    const end = vi.spyOn(curiosityTimesApi, "destroy").mockResolvedValue({ parkingLotItem: null });
    await renderAlarm(item);

    fireEvent.click(screen.getByRole("button", { name: "5 more minutes" }));
    await advance(0);
    expect(extend).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    await advance(0);
    expect(end).toHaveBeenCalled();
    expect(screen.queryByRole("region", { name: "Curiosity time" })).not.toBeInTheDocument();
  });
});
