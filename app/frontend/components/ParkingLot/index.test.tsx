import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
import curiosityTimesApi from "@/apis/curiosity_times";
import parkingLotItemConversionsApi from "@/apis/parking_lot_item_conversions";
import parkingLotItemRestorationsApi from "@/apis/parking_lot_item_restorations";
import parkingLotItemsApi from "@/apis/parking_lot_items";
import type { ParkingLotItem, ParkingLotItemListParams } from "@/apis/types";
import ParkingLot from "@/components/ParkingLot";
import { Toaster } from "@/components/ui/sonner";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

const buildItem = (overrides: Partial<ParkingLotItem> = {}): ParkingLotItem => ({
  id: crypto.randomUUID(),
  content: "Build an aeroplane",
  status: "parked",
  taskId: null,
  curiosityEndsAt: null,
  isCuriosityExtended: false,
  createdAt: "2026-11-05T10:00:00.000Z",
  updatedAt: "2026-11-05T10:00:00.000Z",
  ...overrides,
});

const listOf = (parkingLotItems: ParkingLotItem[]) => ({
  parkingLotItems,
  parkingLotItemsCount: parkingLotItems.length,
  page: 1,
  totalPages: 1,
});

// Answers each status with its own items, so the tabs can be told apart.
const stubList = (itemsByStatus: Partial<Record<string, ParkingLotItem[]>>) =>
  vi
    .spyOn(parkingLotItemsApi, "fetchList")
    .mockImplementation(({ status }: ParkingLotItemListParams = {}) =>
      Promise.resolve(listOf(itemsByStatus[status ?? ""] ?? [])),
    );

const renderParkingLot = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route element={<ParkingLot />} path={routes.parkingLot} />
        <Route element={<p>Inbox task</p>} path={routes.inbox.show} />
      </Routes>
      <Toaster />
    </>,
    undefined,
    routes.parkingLot,
  );

describe("ParkingLot", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Sonner keeps its toasts in module state and replays the active ones to each new Toaster.
    toast.dismiss();
    vi.spyOn(curiosityTimesApi, "show").mockResolvedValue({ parkingLotItem: null });
  });

  it("lists the parked thoughts", async () => {
    stubList({
      parked: [buildItem(), buildItem({ content: "Is there a law on air quality?" })],
    });
    renderParkingLot();

    const list = await screen.findByRole("list", { name: "Parked" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("Is there a law on air quality?")).toBeVisible();
    expect(parkingLotItemsApi.fetchList).toHaveBeenCalledWith({ status: "parked", page: 1 });
  });

  it("shows an empty state when nothing is parked", async () => {
    stubList({});
    renderParkingLot();

    expect(await screen.findByText("Nothing parked. Your head is clear.")).toBeVisible();
  });

  it("parks a new thought", async () => {
    stubList({});
    const create = vi
      .spyOn(parkingLotItemsApi, "create")
      .mockResolvedValue({ parkingLotItem: buildItem({ content: "Renew passport" }) });
    renderParkingLot();

    await userEvent.type(
      await screen.findByRole("textbox", { name: "Thought to park" }),
      "Renew passport{Enter}",
    );

    expect(create).toHaveBeenCalledWith({ content: "Renew passport" }, expect.anything());
  });

  it("adds a thought to the Inbox and links to the new task", async () => {
    const item = buildItem();
    const taskId = crypto.randomUUID();
    stubList({ parked: [item] });
    const convert = vi
      .spyOn(parkingLotItemConversionsApi, "create")
      .mockResolvedValue({ parkingLotItem: { ...item, status: "converted", taskId } });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Add as task" }));
    await userEvent.click(await screen.findByRole("button", { name: "Add undated" }));

    expect(convert).toHaveBeenCalledWith(
      { parkingLotItemId: item.id, isDuration: false, isAllDay: false, startsAt: null, endsAt: null },
      expect.anything(),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Open" }));
    expect(await screen.findByText("Inbox task")).toBeVisible();
  });

  it("schedules the task while adding it", async () => {
    const item = buildItem();
    stubList({ parked: [item] });
    const convert = vi
      .spyOn(parkingLotItemConversionsApi, "create")
      .mockResolvedValue({ parkingLotItem: { ...item, status: "converted", taskId: crypto.randomUUID() } });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Add as task" }));
    await userEvent.click(await screen.findByRole("button", { name: "Add" }));

    expect(convert).toHaveBeenCalledWith(
      expect.objectContaining({ parkingLotItemId: item.id, isAllDay: true, startsAt: expect.any(String) }),
      expect.anything(),
    );
  });

  it("starts a curiosity time on a thought", async () => {
    const item = buildItem();
    stubList({ parked: [item] });
    const start = vi
      .spyOn(curiosityTimesApi, "create")
      .mockResolvedValue({ parkingLotItem: { ...item, curiosityEndsAt: "2026-11-05T10:05:00.000Z" } });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Look into it · 5 min" }));

    expect(start).toHaveBeenCalledWith(item.id, expect.anything());
  });

  it("marks the thought being looked into and holds the others", async () => {
    const running = buildItem({ curiosityEndsAt: "2026-11-05T10:05:00.000Z" });
    stubList({ parked: [running, buildItem({ content: "Who wrote Dune?" })] });
    vi.spyOn(curiosityTimesApi, "show").mockResolvedValue({ parkingLotItem: running });
    renderParkingLot();

    expect(await screen.findByText("Looking into it")).toBeVisible();
    const [lookIntoIt] = screen.getAllByRole("button", { name: "Look into it · 5 min" });
    await waitFor(() => expect(lookIntoIt).toBeDisabled());
  });

  it("marks a thought addressed and can undo it", async () => {
    const item = buildItem();
    stubList({ parked: [item] });
    const update = vi
      .spyOn(parkingLotItemsApi, "update")
      .mockImplementation(({ status }) =>
        Promise.resolve({ parkingLotItem: { ...item, status: status ?? "parked" } }),
      );
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Mark addressed" }));

    expect(update).toHaveBeenCalledWith({ id: item.id, status: "addressed" }, expect.anything());
    expect(await screen.findByText("Marked as addressed")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(update).toHaveBeenLastCalledWith({ id: item.id, status: "parked" }, expect.anything());
  });

  it("lets a thought go and can restore it", async () => {
    const item = buildItem();
    stubList({ parked: [item] });
    const destroy = vi.spyOn(parkingLotItemsApi, "destroy").mockResolvedValue({} as never);
    const restore = vi
      .spyOn(parkingLotItemRestorationsApi, "create")
      .mockResolvedValue({ parkingLotItem: item });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Let it go" }));

    expect(destroy).toHaveBeenCalledWith(item.id, expect.anything());
    expect(await screen.findByText("Let go")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => expect(restore).toHaveBeenCalledWith(item.id, expect.anything()));
  });

  it("shows the error when an action fails", async () => {
    stubList({ parked: [buildItem()] });
    vi.spyOn(parkingLotItemConversionsApi, "create").mockRejectedValue(
      new ApiError(404, "Record not found."),
    );
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Add as task" }));
    await userEvent.click(await screen.findByRole("button", { name: "Add undated" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Record not found.");
    expect(screen.getByRole("button", { name: "Add as task" })).toBeEnabled();
  });

  it("lists addressed thoughts, which can be parked again", async () => {
    const item = buildItem({ status: "addressed" });
    stubList({ addressed: [item] });
    const update = vi
      .spyOn(parkingLotItemsApi, "update")
      .mockResolvedValue({ parkingLotItem: { ...item, status: "parked" } });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("tab", { name: "Addressed" }));
    const list = await screen.findByRole("list", { name: "Addressed" });
    await userEvent.click(within(list).getByRole("button", { name: "Park again" }));

    expect(update).toHaveBeenCalledWith({ id: item.id, status: "parked" }, expect.anything());
    expect(within(list).queryByRole("button", { name: "Add as task" })).not.toBeInTheDocument();
  });

  it("links thoughts added as tasks to their task", async () => {
    const taskId = crypto.randomUUID();
    stubList({ converted: [buildItem({ status: "converted", taskId })] });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("tab", { name: "Added as tasks" }));
    const list = await screen.findByRole("list", { name: "Added as tasks" });

    expect(within(list).getByRole("link", { name: "Open task" })).toHaveAttribute("href", `/inbox/${taskId}`);
  });
});
