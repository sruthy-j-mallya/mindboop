import { Link } from "react-router";
import { AuthCard } from "@/components/AuthCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useRequestPasswordReset } from "@/lib/auth";
import { formValues } from "@/lib/forms";

export function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();

  const backToSignIn = (
    <Link to="/login" className="text-primary underline-offset-4 hover:underline">
      Back to sign in
    </Link>
  );

  if (requestReset.isSuccess) {
    return (
      <AuthCard
        title="Check your email"
        description={`A password reset link is on its way to ${requestReset.variables.email_address}.`}
        footer={backToSignIn}
      />
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      error={requestReset.error?.message}
      onSubmit={(event) => requestReset.mutate(formValues(event, "email_address"))}
      footer={backToSignIn}
    >
      <FormField label="Email" name="email_address" type="email" autoComplete="username" />
      <Button type="submit" disabled={requestReset.isPending}>
        Email reset instructions
      </Button>
    </AuthCard>
  );
}
