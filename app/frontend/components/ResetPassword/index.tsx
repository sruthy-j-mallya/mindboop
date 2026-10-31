import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/reactQuery/usePasswordsApi";
import routes from "@/routes";

import {
  INITIAL_FORM_VALUES,
  RESET_PASSWORD_VALIDATION_SCHEMA,
  type ResetPasswordFormValues,
} from "./constants";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending, error } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(RESET_PASSWORD_VALIDATION_SCHEMA),
  });

  const handleResetPassword = (values: ResetPasswordFormValues) =>
    resetPassword({ token, ...values }, { onSuccess: () => navigate(routes.login) });

  return (
    <AuthCard
      error={error?.message}
      title="Choose a new password"
      onSubmit={handleSubmit(handleResetPassword)}
    >
      <FormField
        autoComplete="new-password"
        error={errors.password?.message}
        label="New password"
        type="password"
        {...register("password")}
      />
      <FormField
        autoComplete="new-password"
        error={errors.passwordConfirmation?.message}
        label="Confirm password"
        type="password"
        {...register("passwordConfirmation")}
      />
      <Button disabled={isPending} type="submit">
        Save
      </Button>
    </AuthCard>
  );
};

export default ResetPassword;
