import { Circle, CircleCheck } from "lucide-react";
import { Link } from "react-router";

type StepProps = { label: string; hint: string; path: string; isDone: boolean };

const Step = ({ label, hint, path, isDone }: StepProps) => {
  if (isDone) {
    return (
      <li className="flex gap-3 rounded-xl p-3 text-muted-foreground">
        <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm">
          <span className="line-through">{label}</span>
          <span className="sr-only"> (done)</span>
        </p>
      </li>
    );
  }

  return (
    <li>
      <Link
        className="flex h-full gap-3 rounded-xl border p-3 transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
        to={path}
      >
        <Circle aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <span className="grid gap-0.5">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">{hint}</span>
        </span>
      </Link>
    </li>
  );
};

export default Step;
