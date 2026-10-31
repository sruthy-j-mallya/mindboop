import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ForgotPasswordPage } from "@/routes/ForgotPasswordPage";

function renderForgotPasswordPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ForgotPasswordPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("replaces the form with a confirmation once the email is sent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "Password reset instructions sent." }))),
    );
    renderForgotPasswordPage();

    await userEvent.type(screen.getByLabelText("Email"), "someone@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Email reset instructions" }));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText(/on its way to someone@example\.com/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
