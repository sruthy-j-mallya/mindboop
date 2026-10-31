import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";

export function HomePage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-start justify-center gap-4 p-4">
      <h1 className="text-3xl font-semibold">Mindboop</h1>
      <p className="text-muted-foreground">Signed in as {user?.email_address}</p>
      <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Sign out
      </Button>
    </main>
  );
}
