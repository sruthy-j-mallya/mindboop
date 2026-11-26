import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser, useLogout } from "@/hooks/reactQuery/useSessionsApi";

const Account = () => {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending, error } = useLogout();

  const handleLogout = () => logout();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        {user && (
          <CardDescription className="wrap-anywhere">Signed in as {user.emailAddress}.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid gap-3">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        <Button
          className="justify-self-start"
          disabled={isPending}
          type="button"
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
};

export default Account;
