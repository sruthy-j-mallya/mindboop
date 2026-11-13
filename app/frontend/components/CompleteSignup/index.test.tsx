import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";

import { ApiError } from "@/apis/axios";
import registrationsApi from "@/apis/registrations";
import CompleteSignup from "@/components/CompleteSignup";
import routes from "@/routes";
import { renderWithProviders } from "@/test/utils";

const renderAt = (path: string) =>
  renderWithProviders(
    <Routes>
      <Route element={<CompleteSignup />} path={routes.signup.complete} />
    </Routes>,
    new QueryClient(),
    path,
  );

describe("CompleteSignup", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends the token from the link with the chosen password", async () => {
    const create = vi.spyOn(registrationsApi, "create").mockResolvedValue({
      user: { id: "1c292d93-1998-4212-b336-8bacbb8f4c39", emailAddress: "someone@example.com" },
    });
    renderAt("/signup/abc123");

    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(create).toHaveBeenCalledWith(
      { token: "abc123", password: "password123", passwordConfirmation: "password123" },
      expect.anything(),
    );
  });

  it("shows the server error for an expired link", async () => {
    vi.spyOn(registrationsApi, "create").mockRejectedValue(
      new ApiError(404, "Sign-up link is invalid or has expired."),
    );
    renderAt("/signup/expired");

    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sign-up link is invalid or has expired.");
  });

  it("toggles each password field on its own", async () => {
    renderAt("/signup/abc123");
    const [showPassword] = screen.getAllByRole("button", { name: "Show password" });
    await userEvent.click(showPassword);

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute("type", "password");
  });
});
