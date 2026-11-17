import type { ParkingLotItem } from "@/apis/types";

import { ALARM_PHASES } from "./constants";
import CuriosityBanner from "./CuriosityBanner";
import useAlarm from "./useAlarm";

type ActiveCuriosityAlarmProps = { item: ParkingLotItem; endsAt: string };

// Shows the running curiosity time on every page, so the look-up stays timeboxed wherever it leads, and rings when
// it's up.
const ActiveCuriosityAlarm = ({ item, endsAt }: ActiveCuriosityAlarmProps) => {
  const phase = useAlarm(endsAt, {
    tag: `curiosity-${item.id}`,
    title: "Curiosity time's up",
    body: `Got your answer? ${item.content}`,
  });

  return (
    <div className="px-4 pb-4">
      <CuriosityBanner endsAt={endsAt} isOver={phase !== ALARM_PHASES.WAITING} item={item} />
    </div>
  );
};

export default ActiveCuriosityAlarm;
