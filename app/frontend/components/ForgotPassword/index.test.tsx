import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import passwordsApi from "@/apis/passwords";
import ForgotPassword from "@/components/ForgotPassword";
import { renderWithProviders } from "@/test/utils";

describe("ForgotPassword", () => {
  afterEach(() => vi.restoreAllMocks());

  it("replaces the form with a confirmation once the email is sent", async () => {
    vi.spyOn(passwordsApi, "create").mockResolvedValue({ message: "Password reset instructions sent." });
    renderWithProviders(<ForgotPassword />);

    await userEvent.type(screen.getByLabelText("Email"), "someone@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Email reset instructions" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText(/on its way to someone@example\.com/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
