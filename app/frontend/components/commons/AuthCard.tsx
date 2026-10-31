import type { FormEvent, ReactNode } from "react";

import Logo from "@/components/commons/Logo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description?: string;
  error?: string | null;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
  footer?: ReactNode;
};

const AuthCard = ({ title, description, error, onSubmit, children, footer }: AuthCardProps) => (
  <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
    <Logo className="size-24" />
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {onSubmit && (
        <CardContent>
          <form noValidate className="grid gap-4" onSubmit={onSubmit}>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {children}
          </form>
        </CardContent>
      )}
      {footer && <CardFooter className="flex-col gap-2 text-sm">{footer}</CardFooter>}
    </Card>
  </main>
);

export default AuthCard;
