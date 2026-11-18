import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type SessionCardProps = { children: ReactNode; details: ReactNode };

// The Timer page's card, shared by a session and the setup before one: the clock and its actions on one side, the
// task's steps and description (`details`) on the other.
const SessionCard = ({ children, details }: SessionCardProps) => (
  <Card className="mx-auto w-full max-w-2xl flex-1 lg:max-w-5xl">
    {/* The card fills the page, and the steps-and-description column takes the height left under the timer. */}
    <CardContent className="grid flex-1 grid-rows-[auto_1fr] gap-8 lg:grid-cols-2 lg:grid-rows-[1fr] lg:gap-12">
      {/* The timer and its actions stay together (and pinned on wide screens), so a long description never
          pushes the buttons out of view. */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">{children}</div>
      <div className="flex flex-col gap-8 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
        {details}
      </div>
    </CardContent>
  </Card>
);

export default SessionCard;
