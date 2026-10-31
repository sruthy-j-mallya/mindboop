import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import TextLink from "@/components/commons/TextLink";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/reactQuery/useRegistrationsApi";
import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

import { INITIAL_FORM_VALUES, SIGNUP_VALIDATION_SCHEMA, type SignupFormValues } from "./constants";

const Signup = () => {
  const { data: user } = useCurrentUser();
  const { mutate: signup, isPending, error } = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(SIGNUP_VALIDATION_SCHEMA),
  });

  const handleSignup = (values: SignupFormValues) => signup(values);

  if (user) return <Navigate replace to={routes.root} />;

  return (
    <AuthCard
      error={error?.message}
      footer={<TextLink to={routes.login}>Already have an account? Sign in</TextLink>}
      title="Create an account"
      onSubmit={handleSubmit(handleSignup)}
    >
      <FormField
        autoComplete="username"
        error={errors.emailAddress?.message}
        label="Email"
        type="email"
        {...register("emailAddress")}
      />
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

export default Signup;
