import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { ForgotPasswordPage } from "@/routes/ForgotPasswordPage";
import { HomePage } from "@/routes/HomePage";
import { LoginPage } from "@/routes/LoginPage";
import { ResetPasswordPage } from "@/routes/ResetPasswordPage";
import { SignupPage } from "@/routes/SignupPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route index element={<HomePage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="passwords/new" element={<ForgotPasswordPage />} />
          <Route path="passwords/:token/edit" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
