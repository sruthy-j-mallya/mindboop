import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import TextLink from "@/components/commons/TextLink";
import { Button } from "@/components/ui/button";
import { useRequestEmailConfirmation } from "@/hooks/reactQuery/useEmailConfirmationsApi";
import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

import { INITIAL_FORM_VALUES, SIGNUP_VALIDATION_SCHEMA, type SignupFormValues } from "./constants";

const Signup = () => {
  const { data: user } = useCurrentUser();
  const {
    mutate: requestEmailConfirmation,
    isPending,
    isSuccess,
    error,
    variables,
  } = useRequestEmailConfirmation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(SIGNUP_VALIDATION_SCHEMA),
  });

  const handleSignup = (values: SignupFormValues) => requestEmailConfirmation(values);

  const signInLink = <TextLink to={routes.login}>Already have an account? Sign in</TextLink>;

  if (user) return <Navigate replace to={routes.root} />;

  if (isSuccess) {
    return (
      <AuthCard
        description={`We sent a link to ${variables.emailAddress}. Open it to confirm your email and finish creating your account.`}
        footer={signInLink}
        title="Check your email"
      />
    );
  }

  return (
    <AuthCard
      description="We'll email you a link to confirm your address."
      error={error?.message}
      footer={signInLink}
      title="Create an account"
      onSubmit={handleSubmit(handleSignup)}
    >
      <FormField
        autoComplete="email"
        error={errors.emailAddress?.message}
        label="Email"
        type="email"
        {...register("emailAddress")}
      />
      <Button disabled={isPending} type="submit">
        Continue
      </Button>
    </AuthCard>
  );
};

export default Signup;
