import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormField from "@/components/commons/FormField";
import { renderWithProviders } from "@/test/utils";

describe("PasswordInput", () => {
  it("hides the password until the eye button is pressed", async () => {
    renderWithProviders(<FormField label="Password" name="password" type="password" />);
    const input = screen.getByLabelText("Password");
    await userEvent.type(input, "secret123");

    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("secret123");

    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("leaves other field types without a toggle", () => {
    renderWithProviders(<FormField label="Email" name="emailAddress" type="email" />);

    expect(screen.queryByRole("button", { name: "Show password" })).not.toBeInTheDocument();
  });
});
