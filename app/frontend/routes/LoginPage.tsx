import { Link, Navigate } from "react-router";
import { AuthCard } from "@/components/AuthCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogin } from "@/lib/auth";
import { formValues } from "@/lib/forms";

export function LoginPage() {
  const { data: user } = useCurrentUser();
  const login = useLogin();

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthCard
      title="Sign in"
      error={login.error?.message}
      onSubmit={(event) => login.mutate(formValues(event, "email_address", "password"))}
      footer={
        <>
          <Link to="/passwords/new" className="underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="underline">
            Create an account
          </Link>
        </>
      }
    >
      <FormField label="Email" name="email_address" type="email" autoComplete="username" />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" />
      <Button type="submit" disabled={login.isPending}>
        Sign in
      </Button>
    </AuthCard>
  );
}
