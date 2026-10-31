import { QueryClient } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/apis/axios";
import sessionsApi from "@/apis/sessions";
import Login from "@/components/Login";
import { QUERY_KEYS } from "@/constants/query";
import { renderWithProviders } from "@/test/utils";

const renderLogin = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(QUERY_KEYS.SESSION, null);
  return renderWithProviders(<Login />, queryClient);
};

describe("Login", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the server error when sign in fails", async () => {
    vi.spyOn(sessionsApi, "create").mockRejectedValue(
      new ApiError(401, "Try another email address or password."),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "someone@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Try another email address or password.");
    expect(sessionsApi.create).toHaveBeenCalledWith(
      { emailAddress: "someone@example.com", password: "wrong-password" },
      expect.anything(),
    );
  });

  it("validates fields before calling the API", async () => {
    const create = vi.spyOn(sessionsApi, "create");
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });
});
