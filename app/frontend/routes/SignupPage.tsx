import { Link, Navigate } from "react-router";
import { AuthCard } from "@/components/AuthCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useSignup } from "@/lib/auth";
import { formValues } from "@/lib/forms";

export function SignupPage() {
  const { data: user } = useCurrentUser();
  const signup = useSignup();

  if (user) return <Navigate to="/" replace />;

  return (
    <AuthCard
      title="Create an account"
      error={signup.error?.message}
      onSubmit={(event) =>
        signup.mutate(formValues(event, "email_address", "password", "password_confirmation"))
      }
      footer={
        <Link to="/login" className="underline">
          Already have an account? Sign in
        </Link>
      }
    >
      <FormField label="Email" name="email_address" type="email" autoComplete="username" />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" minLength={8} />
      <FormField
        label="Confirm password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
      />
      <Button type="submit" disabled={signup.isPending}>
        Sign up
      </Button>
    </AuthCard>
  );
}
