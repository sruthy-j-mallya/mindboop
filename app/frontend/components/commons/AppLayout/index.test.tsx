import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import currentTimeLogsApi from "@/apis/current_time_logs";
import sessionsApi from "@/apis/sessions";
import AppLayout from "@/components/commons/AppLayout";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

describe("AppLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(currentTimeLogsApi, "show").mockResolvedValue({ timeLog: null });
  });

  it("offers Quick start, Inbox, Timer and Parking lot in the sidebar and settings in the footer", () => {
    const { container } = renderWithProviders(<AppLayout />);

    const content = within(container.querySelector<HTMLElement>('[data-slot="sidebar-content"]')!);
    const footer = within(container.querySelector<HTMLElement>('[data-slot="sidebar-footer"]')!);

    expect(content.getAllByRole("link")).toHaveLength(4);
    expect(content.getByRole("link", { name: "Quick start" })).toHaveAttribute("href", routes.root);
    expect(content.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", routes.inbox.index);
    expect(content.getByRole("link", { name: "Timer" })).toHaveAttribute("href", routes.timer);
    expect(content.getByRole("link", { name: "Parking lot" })).toHaveAttribute("href", routes.parkingLot);
    expect(footer.getByRole("link", { name: "Settings" })).toHaveAttribute("href", routes.settings);
    expect(screen.getAllByRole("link", { name: "Settings" })).toHaveLength(1);
  });

  it("starts icon-only and toggles between the icon and full views", async () => {
    const { container } = renderWithProviders(<AppLayout />);
    const sidebar = container.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
    const toggle = screen.getByRole("button", { name: "Toggle Sidebar" });

    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");

    await userEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "expanded");

    await userEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  });

  it("restores the toggled state when mounted again", async () => {
    const { container, unmount } = renderWithProviders(<AppLayout />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "expanded");
    unmount();

    const { container: expanded, unmount: unmountExpanded } = renderWithProviders(<AppLayout />);
    expect(expanded.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "expanded");
    await userEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    unmountExpanded();

    const { container: collapsed } = renderWithProviders(<AppLayout />);
    expect(collapsed.querySelector('[data-slot="sidebar"]')).toHaveAttribute("data-state", "collapsed");
  });

  it("signs out from the sidebar footer", async () => {
    const destroy = vi.spyOn(sessionsApi, "destroy").mockResolvedValue(undefined as never);
    renderWithProviders(<AppLayout />);

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(destroy).toHaveBeenCalled());
  });
});
