import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LazyRichTextEditor from "./LazyEditor";

describe("LazyRichTextEditor", () => {
  it("holds the editor's place until it loads", async () => {
    render(<LazyRichTextEditor defaultValue="Ship it" label="Description" onChange={vi.fn()} />);

    expect(screen.getByRole("status", { name: "Loading editor" })).toBeInTheDocument();
    expect(await screen.findByRole("textbox", { name: "Description" })).toHaveTextContent("Ship it");
    expect(screen.queryByRole("status", { name: "Loading editor" })).not.toBeInTheDocument();
  });
});
