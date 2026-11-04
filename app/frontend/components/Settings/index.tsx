import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useTheme from "@/hooks/useTheme";

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (isDark: boolean) => setTheme(isDark ? "dark" : "light");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1>Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Mindboop looks on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label htmlFor="dark-mode">Dark mode</Label>
          <Switch checked={theme === "dark"} id="dark-mode" onCheckedChange={handleThemeChange} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
