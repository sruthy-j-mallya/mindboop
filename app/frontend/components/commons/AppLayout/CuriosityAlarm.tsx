import { useCuriosityTime } from "@/hooks/reactQuery/useCuriosityTimesApi";

import ActiveCuriosityAlarm from "./ActiveCuriosityAlarm";

const CuriosityAlarm = () => {
  const { data } = useCuriosityTime();
  const item = data?.parkingLotItem;

  if (!item?.curiosityEndsAt) return null;

  // Keyed by the end too, so extending the time starts a fresh alarm.
  return (
    <ActiveCuriosityAlarm
      key={`${item.id}-${item.curiosityEndsAt}`}
      endsAt={item.curiosityEndsAt}
      item={item}
    />
  );
};

export default CuriosityAlarm;
