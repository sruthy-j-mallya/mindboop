import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";

export function HomePage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-start justify-center gap-4 p-4">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-3xl">Mindboop</h1>
      </div>
      <p className="text-muted-foreground">Signed in as {user?.email_address}</p>
      <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Sign out
      </Button>
    </main>
  );
}
