import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/apis/axios";
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
  kind: "idea",
  status: "parked",
  taskId: null,
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
  });

  it("lists the parked thoughts", async () => {
    stubList({
      parked: [buildItem(), buildItem({ content: "Is there a law on air quality?", kind: "question" })],
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

    await userEvent.click(await screen.findByRole("radio", { name: "question" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Thought to park" }), "Renew passport{Enter}");

    expect(create).toHaveBeenCalledWith({ content: "Renew passport", kind: "question" }, expect.anything());
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

    expect(convert).toHaveBeenCalledWith(item.id, expect.anything());
    await userEvent.click(await screen.findByRole("button", { name: "Open" }));
    expect(await screen.findByText("Inbox task")).toBeVisible();
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

  it("discards a thought and can restore it", async () => {
    const item = buildItem();
    stubList({ parked: [item] });
    const destroy = vi.spyOn(parkingLotItemsApi, "destroy").mockResolvedValue({} as never);
    const restore = vi
      .spyOn(parkingLotItemRestorationsApi, "create")
      .mockResolvedValue({ parkingLotItem: item });
    renderParkingLot();

    await userEvent.click(await screen.findByRole("button", { name: "Discard" }));

    expect(destroy).toHaveBeenCalledWith(item.id, expect.anything());
    expect(await screen.findByText("Thought discarded")).toBeVisible();

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
