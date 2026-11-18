import type { Theme } from "@/apis/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { THEMES } from "./constants";

type AppearanceProps = { theme: Theme; onChange: (theme: Theme) => void };

const Appearance = ({ theme, onChange }: AppearanceProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Appearance</CardTitle>
      <CardDescription>Choose how Mindboop looks.</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center justify-between gap-4">
      <Label htmlFor="theme">Theme</Label>
      <Select value={theme} onValueChange={onChange}>
        <SelectTrigger className="w-48" id="theme">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THEMES.map(({ id, label }) => (
            <SelectItem key={id} value={id}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
);

export default Appearance;
