import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";

import AuthCard from "@/components/commons/AuthCard";
import FormField from "@/components/commons/FormField";
import TextLink from "@/components/commons/TextLink";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogin } from "@/hooks/reactQuery/useSessionsApi";
import routes from "@/routes";

import { INITIAL_FORM_VALUES, LOGIN_VALIDATION_SCHEMA, type LoginFormValues } from "./constants";

const Login = () => {
  const { data: user } = useCurrentUser();
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: INITIAL_FORM_VALUES,
    resolver: zodResolver(LOGIN_VALIDATION_SCHEMA),
  });

  const handleLogin = (values: LoginFormValues) => login(values);

  if (user) return <Navigate replace to={routes.root} />;

  return (
    <AuthCard
      error={error?.message}
      title="Sign in"
      description="Pick one thing, give it your focus, and leave yourself a trail back."
      footer={<TextLink to={routes.signup.new}>Create an account</TextLink>}
      onSubmit={handleSubmit(handleLogin)}
    >
      <FormField
        autoFocus
        autoComplete="username"
        error={errors.emailAddress?.message}
        label="Email"
        type="email"
        {...register("emailAddress")}
      />
      <div className="grid gap-1.5">
        <FormField
          autoComplete="current-password"
          error={errors.password?.message}
          label="Password"
          type="password"
          {...register("password")}
        />
        <p className="text-right text-sm">
          <TextLink to={routes.passwords.new}>Forgot password?</TextLink>
        </p>
      </div>
      <Button disabled={isPending} type="submit">
        Sign in
      </Button>
    </AuthCard>
  );
};

export default Login;
