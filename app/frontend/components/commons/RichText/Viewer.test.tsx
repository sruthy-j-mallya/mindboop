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

  it("renders ==highlights== and --- rules", () => {
    const { container } = render(<RichTextViewer markdown={"Ship ==today==\n\n---\n\nThen rest"} />);

    expect(screen.getByText("today").tagName).toBe("MARK");
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("links addresses written without https://", () => {
    render(<RichTextViewer markdown="Go to [this](www.mindboop.com)" />);

    expect(screen.getByRole("link", { name: "this" })).toHaveAttribute("href", "https://www.mindboop.com");
  });

  it("highlights a fenced code block in the language its info string names", () => {
    const { container } = render(<RichTextViewer markdown={"```ts\nconst answer: number = 42;\n```"} />);

    expect(container.querySelector("pre code")).toHaveClass("language-ts");
    expect(screen.getByText("const")).toHaveClass("hljs-keyword");
    expect(screen.getByText("42")).toHaveClass("hljs-number");
  });

  it("guesses the language of a fenced code block without an info string", () => {
    const { container } = render(
      <RichTextViewer markdown={'```\ndef greet(name):\n    return f"hi {name}"\n```'} />,
    );

    expect(container.querySelector("pre .hljs-keyword")).toHaveTextContent("def");
  });

  it("does not render raw HTML from the stored Markdown", () => {
    const { container } = render(
      <RichTextViewer markdown={'Hi <img src="x" onerror="alert(1)"><script>alert(1)</script>'} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });
});
