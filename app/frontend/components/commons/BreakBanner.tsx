import type { Break } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useEndBreak } from "@/hooks/reactQuery/useBreaksApi";
import useCurrentTime from "@/hooks/useCurrentTime";
import { getBreakRemainingSeconds } from "@/utils";

type BreakBannerProps = { currentBreak: Break; timeLogId: string };

const BreakBanner = ({ currentBreak: { intention, endsAt }, timeLogId }: BreakBannerProps) => {
  const currentTime = useCurrentTime(true);
  const { mutate: endBreak, isPending, error } = useEndBreak();
  const isOver = getBreakRemainingSeconds(endsAt, currentTime) === 0;

  const handleBack = () => endBreak(timeLogId);

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-brand-yellow/25 p-4">
      <p className="font-semibold wrap-anywhere">
        {isOver ? "Break's over" : "Stepped away"} — {intention}
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      <Button disabled={isPending} size="lg" type="button" onClick={handleBack}>
        I&apos;m back
      </Button>
    </div>
  );
};

export default BreakBanner;
