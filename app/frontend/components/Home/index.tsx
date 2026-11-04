import Logo from "@/components/commons/Logo";
import { useCurrentUser } from "@/hooks/reactQuery/useSessionsApi";

const Home = () => {
  const { data: user } = useCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-4 p-4">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-3xl">Mindboop</h1>
      </div>
      <p className="text-muted-foreground">Signed in as {user?.emailAddress}</p>
    </div>
  );
};

export default Home;
