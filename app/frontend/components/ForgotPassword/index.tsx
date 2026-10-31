import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import TextLink from "@/components/commons/TextLink";
import { Button } from "@/components/ui/button";
import { useRequestPasswordReset } from "@/hooks/reactQuery/usePasswordsApi";
import routes from "@/routes";

import {
  FORGOT_PASSWORD_VALIDATION_SCHEMA,
  type ForgotPasswordFormValues,
  INITIAL_FORM_VALUES,
} from "./constants";

const ForgotPassword = () => {
  const { mutate: requestPasswordReset, isPending, isSuccess, error, variables } = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(FORGOT_PASSWORD_VALIDATION_SCHEMA),
  });

  const handleRequestReset = (values: ForgotPasswordFormValues) => requestPasswordReset(values);

  const backToSignIn = <TextLink to={routes.login}>Back to sign in</TextLink>;

  if (isSuccess) {
    return (
      <AuthCard
        description={`A password reset link is on its way to ${variables.emailAddress}.`}
        footer={backToSignIn}
        title="Check your email"
      />
    );
  }

  return (
    <AuthCard
      error={error?.message}
      footer={backToSignIn}
      title="Forgot your password?"
      onSubmit={handleSubmit(handleRequestReset)}
    >
      <FormField
        autoComplete="username"
        error={errors.emailAddress?.message}
        label="Email"
        type="email"
        {...register("emailAddress")}
      />
      <Button disabled={isPending} type="submit">
        Email reset instructions
      </Button>
    </AuthCard>
  );
};

export default ForgotPassword;
