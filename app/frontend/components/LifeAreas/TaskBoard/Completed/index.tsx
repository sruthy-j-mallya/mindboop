import { useId, useState } from "react";

import { cn } from "cn";
import { ChevronRight } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";

import CompletedList from "./CompletedList";

type CompletedProps = { lifeArea?: LifeArea };

// The list's completed tasks, out of the way (and not loaded) until asked for.
const Completed = ({ lifeArea }: CompletedProps) => {
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((isShown) => !isShown);

  return (
    <section aria-label="Completed" className="mt-4 flex flex-col gap-1">
      <Button
        aria-controls={isOpen ? listId : undefined}
        aria-expanded={isOpen}
        className="self-start text-muted-foreground"
        size="sm"
        type="button"
        variant="ghost"
        onClick={handleToggle}
      >
        <ChevronRight className={cn("transition-transform", isOpen && "rotate-90")} />
        Completed
      </Button>
      {isOpen && (
        <div id={listId}>
          <CompletedList lifeArea={lifeArea} />
        </div>
      )}
    </section>
  );
};

export default Completed;
