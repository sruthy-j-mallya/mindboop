import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import Settings from "@/components/Settings";
import { renderWithProviders } from "@/test/utils";

describe("Settings", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("switches to dark mode and remembers the choice", async () => {
    renderWithProviders(<Settings />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });

    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).toBeChecked();
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("switches back to light mode and remembers the choice", async () => {
    document.documentElement.classList.add("dark");
    renderWithProviders(<Settings />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });

    expect(toggle).toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
