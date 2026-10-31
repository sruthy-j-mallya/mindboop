import { Link } from "react-router";
import { AuthCard } from "@/components/AuthCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useRequestPasswordReset } from "@/lib/auth";
import { formValues } from "@/lib/forms";

export function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();

  return (
    <AuthCard
      title="Forgot your password?"
      description={requestReset.data?.message}
      error={requestReset.error?.message}
      onSubmit={(event) => requestReset.mutate(formValues(event, "email_address"))}
      footer={
        <Link to="/login" className="underline">
          Back to sign in
        </Link>
      }
    >
      <FormField label="Email" name="email_address" type="email" autoComplete="username" />
      <Button type="submit" disabled={requestReset.isPending}>
        Email reset instructions
      </Button>
    </AuthCard>
  );
}
