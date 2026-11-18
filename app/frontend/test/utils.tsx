import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { type InitialEntry, MemoryRouter } from "react-router";

// `initialPath` may also be a location object, to start with router state.
export const renderWithProviders = (
  ui: ReactElement,
  queryClient = new QueryClient(),
  initialPath: InitialEntry = "/",
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
