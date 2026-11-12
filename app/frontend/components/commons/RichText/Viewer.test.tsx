import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RichTextViewer from "./Viewer";

describe("RichTextViewer", () => {
  it("renders Markdown as read-only formatted text", () => {
    render(
      <RichTextViewer markdown={"### Notes\n\n1. Read the [brief](https://example.com)\n\n> Stay calm"} />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Notes" })).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveTextContent("Read the brief");
    expect(screen.getByRole("link", { name: "brief" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Stay calm").closest("blockquote")).not.toBeNull();
    expect(screen.getByText("Stay calm").closest("[contenteditable]")).toHaveAttribute(
      "contenteditable",
      "false",
    );
  });

  it("links addresses written without https://", () => {
    render(<RichTextViewer markdown="Go to [this](www.mindboop.com)" />);

    expect(screen.getByRole("link", { name: "this" })).toHaveAttribute("href", "https://www.mindboop.com");
  });

  it("does not render raw HTML from the stored Markdown", () => {
    const { container } = render(
      <RichTextViewer markdown={'Hi <img src="x" onerror="alert(1)"><script>alert(1)</script>'} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });
});
