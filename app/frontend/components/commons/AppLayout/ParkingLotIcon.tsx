import { SquareParking } from "lucide-react";

import { MAX_PARKED_COUNT } from "./constants";

type ParkingLotIconProps = { count: number };

// The count is also in the link's text for screen readers, so the badge is hidden from them.
const ParkingLotIcon = ({ count }: ParkingLotIconProps) => (
  <span aria-hidden className="relative shrink-0">
    <SquareParking className="size-4" />
    {count > 0 && (
      <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] leading-none font-medium text-primary-foreground tabular-nums">
        {count > MAX_PARKED_COUNT ? `${MAX_PARKED_COUNT}+` : count}
      </span>
    )}
  </span>
);

export default ParkingLotIcon;
