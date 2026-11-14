import { useEffect, useRef } from "react";

import { cn } from "cn";

import ParkForm from "@/components/commons/ParkingLot/ParkForm";
import ThoughtCard from "@/components/commons/ParkingLot/ThoughtCard";
import { Card } from "@/components/ui/card";
import { useParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";

type ParkingLotProps = { since: string; className?: string };

// Catches stray thoughts during a session, so they can wait for the Parking lot page instead of pulling focus. Lists
// only what's still parked since the session started, oldest first like a chat, and keeps the newest in view.
const ParkingLot = ({ since, className }: ParkingLotProps) => {
  const { data, isPending, error } = useParkingLotItems({ status: "parked", since });
  const listRef = useRef<HTMLDivElement>(null);
  // The API lists newest first.
  const items = (data?.parkingLotItems ?? []).toReversed();

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [items.length]);

  return (
    <Card aria-labelledby="parking-lot-heading" className={cn("gap-0 py-0", className)} role="region">
      <header className="grid gap-1 border-b px-6 py-4">
        <h2 className="text-lg font-semibold" id="parking-lot-heading">
          Parking lot
        </h2>
        <p className="text-sm text-muted-foreground">
          Park it, don&apos;t chase it. You&apos;ll get it back.
        </p>
      </header>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-6">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        )}
        {!isPending && !error && items.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Stray thought? Type it below.</p>
        )}
        {items.length > 0 && (
          <ul aria-label="Parked thoughts" className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <ThoughtCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t px-6 py-4">
        <ParkForm />
      </div>
    </Card>
  );
};

export default ParkingLot;
