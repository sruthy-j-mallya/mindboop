import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import QuickStart from "@/components/QuickStart";
import { renderWithProviders } from "@/test/utils";

const CUSTOM_LABEL = /set your own/i;
const CUSTOM_ERROR = /pick a preset or enter/i;
const TITLE_ERROR = /say what you want to get done/i;

const beginSession = () => userEvent.click(screen.getByRole("button", { name: "Begin" }));
const addStep = (text: string) =>
  userEvent.type(screen.getByRole("textbox", { name: "New step" }), `${text}{Enter}`);

describe("QuickStart", () => {
  it("asks for a task before beginning a session", async () => {
    renderWithProviders(<QuickStart />);
    await beginSession();

    expect(await screen.findByText(TITLE_ERROR)).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Task" })).toHaveAttribute("aria-invalid", "true");

    await userEvent.type(screen.getByRole("textbox", { name: "Task" }), "Draft submitted");

    expect(screen.queryByText(TITLE_ERROR)).not.toBeInTheDocument();
  });

  it("adds trimmed steps on Enter without submitting the form", async () => {
    renderWithProviders(<QuickStart />);
    const input = screen.getByRole("textbox", { name: "New step" });

    await userEvent.type(input, "  Write the introduction  {Enter}");
    await userEvent.type(input, "Check the statistics{Enter}");

    const steps = within(screen.getByRole("list", { name: "Steps" })).getAllByRole("checkbox");
    expect(steps).toHaveLength(2);
    expect(screen.getByRole("checkbox", { name: "Write the introduction" })).toBeVisible();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(screen.queryByText(TITLE_ERROR)).not.toBeInTheDocument();
  });

  it("adds a step with the button and ignores blank steps", async () => {
    renderWithProviders(<QuickStart />);
    const addStep = screen.getByRole("button", { name: "Add step" });

    await userEvent.click(addStep);
    await userEvent.type(screen.getByRole("textbox", { name: "New step" }), "   ");
    await userEvent.click(addStep);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: "New step" }), "Outline");
    await userEvent.click(addStep);

    expect(screen.getByRole("checkbox", { name: "Outline" })).toBeVisible();
  });

  it("ticks a step off", async () => {
    renderWithProviders(<QuickStart />);
    await userEvent.type(screen.getByRole("textbox", { name: "New step" }), "Outline{Enter}");
    const step = screen.getByRole("checkbox", { name: "Outline" });

    await userEvent.click(step);

    expect(step).toBeChecked();
  });

  it("edits a step inline when its text is clicked, without ticking it", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("Outline");

    await userEvent.click(screen.getByText("Outline"));

    expect(screen.getByRole("textbox", { name: "Step text" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Step text" })).toHaveValue("Outline");
    expect(screen.getByRole("checkbox", { name: "Outline" })).not.toBeChecked();
  });

  it("removes a step that is being edited", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("First");
    await addStep("Second");

    await userEvent.click(screen.getByText("First"));
    await userEvent.keyboard("Draft");
    await userEvent.click(screen.getByRole("button", { name: "Remove First" }));

    const steps = within(screen.getByRole("list", { name: "Steps" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual(["Second"]);
  });

  it("edits a trimmed step on Enter without submitting the form or losing its tick", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("Outline");
    await userEvent.click(screen.getByRole("checkbox", { name: "Outline" }));

    await userEvent.click(screen.getByRole("button", { name: "Edit Outline" }));
    const input = screen.getByRole("textbox", { name: "Step text" });
    expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "  Write the outline  {Enter}");

    expect(screen.getByRole("checkbox", { name: "Write the outline" })).toBeChecked();
    expect(screen.queryByRole("textbox", { name: "Step text" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Write the outline" })).toHaveFocus();
    expect(screen.queryByText(TITLE_ERROR)).not.toBeInTheDocument();
  });

  it("saves an edit when focus leaves the input", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("Outline");

    await userEvent.click(screen.getByRole("button", { name: "Edit Outline" }));
    await userEvent.keyboard("Draft");
    await userEvent.click(screen.getByRole("textbox", { name: "Task" }));

    expect(screen.getByRole("checkbox", { name: "Draft" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Task" })).toHaveFocus();
  });

  it("discards an edit on Escape", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("Outline");

    await userEvent.click(screen.getByRole("button", { name: "Edit Outline" }));
    await userEvent.keyboard("Draft{Escape}");

    expect(screen.getByRole("checkbox", { name: "Outline" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit Outline" })).toHaveFocus();
  });

  it("keeps the old text when an edit is left blank", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("Outline");

    await userEvent.click(screen.getByRole("button", { name: "Edit Outline" }));
    await userEvent.clear(screen.getByRole("textbox", { name: "Step text" }));
    await userEvent.keyboard("   {Enter}");

    expect(screen.getByRole("checkbox", { name: "Outline" })).toBeVisible();
  });

  it("removes a step and leaves the others intact", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("First");
    await addStep("Second");
    await addStep("Third");
    await userEvent.click(screen.getByRole("checkbox", { name: "Third" }));

    await userEvent.click(screen.getByRole("button", { name: "Remove Second" }));

    expect(screen.queryByRole("checkbox", { name: "Second" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "First" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Third" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Add step" })).toHaveFocus();
  });

  it("keeps an edit when other steps are added and removed", async () => {
    renderWithProviders(<QuickStart />);
    await addStep("First");
    await addStep("Second");

    await userEvent.click(screen.getByRole("button", { name: "Edit Second" }));
    await userEvent.keyboard("Edited{Enter}");
    await addStep("Third");
    await userEvent.click(screen.getByRole("button", { name: "Remove First" }));

    const steps = within(screen.getByRole("list", { name: "Steps" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual(["Edited", "Third"]);
  });

  it("selects one timer at a time, starting from the first preset", async () => {
    renderWithProviders(<QuickStart />);
    const preset = (name: string) => screen.getByRole("button", { name });
    const custom = screen.getByRole("spinbutton", { name: CUSTOM_LABEL });

    expect(preset("5 min")).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(preset("15 min"));

    expect(preset("15 min")).toHaveAttribute("aria-pressed", "true");
    expect(preset("5 min")).toHaveAttribute("aria-pressed", "false");

    await userEvent.type(custom, "25");

    expect(custom).toHaveValue(25);
    expect(preset("15 min")).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(preset("10 min"));

    expect(custom).toHaveValue(null);
    expect(preset("10 min")).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps typing in the custom input when the digits match a preset", async () => {
    renderWithProviders(<QuickStart />);
    const custom = screen.getByRole("spinbutton", { name: CUSTOM_LABEL });

    await userEvent.type(custom, "55");

    expect(custom).toHaveValue(55);
    expect(screen.getByRole("button", { name: "5 min" })).toHaveAttribute("aria-pressed", "false");
  });

  it.each(["19", "61", "25.5"])("rejects %s custom minutes", async (minutes) => {
    renderWithProviders(<QuickStart />);
    await userEvent.type(screen.getByRole("spinbutton", { name: CUSTOM_LABEL }), minutes);
    await beginSession();

    expect(await screen.findByText(CUSTOM_ERROR)).toBeVisible();
  });

  it.each(["20", "60"])("accepts %s custom minutes", async (minutes) => {
    renderWithProviders(<QuickStart />);
    await userEvent.type(screen.getByRole("textbox", { name: "Task" }), "Draft submitted");
    await userEvent.type(screen.getByRole("spinbutton", { name: CUSTOM_LABEL }), minutes);
    await beginSession();

    expect(screen.queryByText(CUSTOM_ERROR)).not.toBeInTheDocument();
  });

  it("clears a custom minutes error when a preset is picked", async () => {
    renderWithProviders(<QuickStart />);
    await userEvent.type(screen.getByRole("spinbutton", { name: CUSTOM_LABEL }), "19");
    await beginSession();
    await screen.findByText(CUSTOM_ERROR);

    await userEvent.click(screen.getByRole("button", { name: "10 min" }));

    expect(screen.queryByText(CUSTOM_ERROR)).not.toBeInTheDocument();
  });
});
