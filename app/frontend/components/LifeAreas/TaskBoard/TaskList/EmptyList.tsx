import type { LucideIcon } from "lucide-react";

type EmptyListProps = { icon: LucideIcon; title: string; hint: string };

const EmptyList = ({ icon: Icon, title, hint }: EmptyListProps) => (
  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
    <Icon className="size-8" />
    <p className="font-medium text-foreground">{title}</p>
    <p className="text-sm">{hint}</p>
  </div>
);

export default EmptyList;
