import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import emailConfirmationsApi from "@/apis/email_confirmations";
import Signup from "@/components/Signup";
import { renderWithProviders } from "@/test/utils";

describe("Signup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("asks the user to confirm their email before creating the account", async () => {
    const create = vi
      .spyOn(emailConfirmationsApi, "create")
      .mockResolvedValue({ message: "Sign-up link sent." });
    renderWithProviders(<Signup />);

    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Email"), "someone@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText(/sent a link to someone@example\.com/)).toBeInTheDocument();
    expect(create).toHaveBeenCalledWith({ emailAddress: "someone@example.com" }, expect.anything());
  });
});
