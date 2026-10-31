import { useNavigate, useParams } from "react-router";
import { AuthCard } from "@/components/AuthCard";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/lib/auth";
import { formValues } from "@/lib/forms";

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const resetPassword = useResetPassword(token);

  return (
    <AuthCard
      title="Choose a new password"
      error={resetPassword.error?.message}
      onSubmit={(event) =>
        resetPassword.mutate(formValues(event, "password", "password_confirmation"), {
          onSuccess: () => navigate("/login"),
        })
      }
    >
      <FormField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
      <FormField
        label="Confirm password"
        name="password_confirmation"
        type="password"
        autoComplete="new-password"
      />
      <Button type="submit" disabled={resetPassword.isPending}>
        Save
      </Button>
    </AuthCard>
  );
}
