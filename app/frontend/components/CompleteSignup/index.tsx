import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useParams } from "react-router";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import TextLink from "@/components/commons/TextLink";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/reactQuery/useRegistrationsApi";
import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

import {
  COMPLETE_SIGNUP_VALIDATION_SCHEMA,
  type CompleteSignupFormValues,
  INITIAL_FORM_VALUES,
} from "./constants";

const CompleteSignup = () => {
  const { token = "" } = useParams();
  const { data: user } = useCurrentUser();
  const { mutate: signup, isPending, error } = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteSignupFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(COMPLETE_SIGNUP_VALIDATION_SCHEMA),
  });

  const handleSignup = (values: CompleteSignupFormValues) => signup({ token, ...values });

  if (user) return <Navigate replace to={routes.root} />;

  return (
    <AuthCard
      description="Your email is confirmed. Choose a password to finish."
      error={error?.message}
      footer={<TextLink to={routes.signup.new}>Need a new link? Start again</TextLink>}
      title="Create your account"
      onSubmit={handleSubmit(handleSignup)}
    >
      <FormField
        autoComplete="new-password"
        error={errors.password?.message}
        label="Password"
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
        Sign up
      </Button>
    </AuthCard>
  );
};

export default CompleteSignup;
