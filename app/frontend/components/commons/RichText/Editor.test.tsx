import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RichTextEditor from "./Editor";

const renderEditor = (defaultValue = "") => {
  const onChange = vi.fn();
  render(<RichTextEditor defaultValue={defaultValue} label="Description" onChange={onChange} />);

  return { onChange, textbox: screen.getByRole("textbox", { name: "Description" }) };
};

const lastMarkdown = (onChange: ReturnType<typeof vi.fn>) => onChange.mock.lastCall?.[0];

describe("RichTextEditor", () => {
  it("offers a labelled button for every format", () => {
    renderEditor();

    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    for (const name of [
      "Bold",
      "Italic",
      "Strikethrough",
      "Inline code",
      "Heading",
      "Subheading",
      "Bullet list",
      "Numbered list",
      "Quote",
      "Code block",
      "Link",
    ]) {
      expect(within(toolbar).getByRole("button", { name })).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("shows stored Markdown as formatted text", () => {
    const { textbox } = renderEditor("## Plan\n\n- **Outline** the *intro*");

    expect(within(textbox).getByRole("heading", { level: 2, name: "Plan" })).toBeVisible();
    expect(within(textbox).getByRole("listitem")).toHaveTextContent("Outline the intro");
    expect(textbox.querySelector("strong")).toHaveTextContent("Outline");
    expect(textbox.querySelector("em")).toHaveTextContent("intro");
  });

  it("reports the document as Markdown when a format is toggled", async () => {
    const { onChange, textbox } = renderEditor("Ship it");

    await userEvent.click(textbox);
    await userEvent.click(screen.getByRole("button", { name: "Bullet list" }));

    await waitFor(() => expect(lastMarkdown(onChange)).toBe("- Ship it"));
    expect(screen.getByRole("button", { name: "Bullet list" })).toHaveAttribute("aria-pressed", "true");
  });

  it("turns the selected text into a link", async () => {
    const { onChange, textbox } = renderEditor("Ship it");

    await userEvent.click(textbox);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.click(screen.getByRole("button", { name: "Link" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Link address" }), "example.com{Enter}");

    await waitFor(() => expect(lastMarkdown(onChange)).toBe("[Ship it](https://example.com)"));
  });

  it("rejects a link that isn't a web or email address", async () => {
    const { onChange, textbox } = renderEditor("Ship it");

    await userEvent.click(textbox);
    await userEvent.click(screen.getByRole("button", { name: "Link" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Link address" }), "javascript:alert(1){Enter}");

    expect(await screen.findByText("Use a web address or an email link")).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("drops links that aren't web or email addresses", () => {
    const { textbox } = renderEditor("[safe](https://example.com) [unsafe](javascript:alert(1))");

    const hrefs = Array.from(textbox.querySelectorAll("a"), (link) => link.getAttribute("href"));
    expect(hrefs).not.toContain("javascript:alert(1)");
    expect(hrefs).toContain("https://example.com");
  });
});
