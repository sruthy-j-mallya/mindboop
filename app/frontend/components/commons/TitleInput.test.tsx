import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TitleInput from "./TitleInput";

const EditableTitle = ({
  initialTitle,
  onSave,
}: {
  initialTitle: string;
  onSave: (title: string) => void;
}) => {
  const [title, setTitle] = useState(initialTitle);

  const handleSave = (value: string) => {
    setTitle(value);
    onSave(value);
  };

  return <TitleInput label="Task title" title={title} onSave={handleSave} />;
};

describe("TitleInput", () => {
  it("keeps a title without links as a plain field", () => {
    render(<TitleInput label="Task title" title="Water the plants" onSave={vi.fn()} />);

    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveValue("Water the plants");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows web addresses as links that open in a new tab, without starting an edit", async () => {
    render(<TitleInput label="Task title" title="Read https://example.com/post" onSave={vi.fn()} />);

    const link = screen.getByRole("link", { name: "https://example.com/post" });
    expect(link).toHaveAttribute("target", "_blank");
    await userEvent.click(link);

    expect(screen.getByRole("link", { name: "https://example.com/post" })).toBeInTheDocument();
  });

  it("edits the title when it's clicked away from the link, then shows the link again", async () => {
    const onSave = vi.fn();
    render(<EditableTitle initialTitle="Read https://example.com" onSave={onSave} />);

    await userEvent.click(screen.getByText("Read"));
    const input = screen.getByRole("textbox", { name: "Task title" });
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Read https://example.com");

    await userEvent.type(input, " twice");
    await userEvent.tab();

    expect(onSave).toHaveBeenCalledWith("Read https://example.com twice");
    expect(screen.getByRole("link", { name: "https://example.com" })).toBeInTheDocument();
  });

  it("can be reached and edited from the keyboard", async () => {
    render(<TitleInput label="Task title" title="Read https://example.com" onSave={vi.fn()} />);

    await userEvent.tab();

    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveFocus();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
