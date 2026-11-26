import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LinkifiedText from ".";

describe("LinkifiedText", () => {
  it("renders addresses as links that open in a new tab", () => {
    render(
      <p>
        <LinkifiedText text="Read https://example.com/post today" />
      </p>,
    );

    const link = screen.getByRole("link", { name: "https://example.com/post" });
    expect(link).toHaveAttribute("href", "https://example.com/post");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("paragraph")).toHaveTextContent("Read https://example.com/post today");
  });

  it("wraps the plain runs when asked", () => {
    render(<LinkifiedText renderText={(text) => <em>{text}</em>} text="Go to www.example.com" />);

    expect(screen.getByText("Go to").tagName).toBe("EM");
    expect(screen.getByRole("link", { name: "www.example.com" })).toHaveAttribute(
      "href",
      "https://www.example.com",
    );
  });
});
