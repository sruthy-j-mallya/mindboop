import Logo from "@/components/commons/Logo";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/reactQuery/useSessionsApi";

const Home = () => {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => logout();

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-start justify-center gap-4 p-4">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-3xl">Mindboop</h1>
      </div>
      <p className="text-muted-foreground">Signed in as {user?.emailAddress}</p>
      <Button disabled={isPending} variant="outline" onClick={handleLogout}>
        Sign out
      </Button>
    </main>
  );
};

export default Home;
