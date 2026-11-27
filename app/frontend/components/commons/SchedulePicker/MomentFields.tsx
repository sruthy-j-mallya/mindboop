import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import { toTimeInputValue } from "./utils";

type MomentFieldsProps = {
  label: string;
  value: Date;
  hasTime: boolean;
  // The first day and time ("HH:mm") that can be picked.
  fromDay?: Date;
  minTime?: string;
  onDayChange: (day: Date) => void;
  onTimeChange: (time: string) => void;
};

// A labelled date picker, plus a time input unless the duration is all day. A cleared time is ignored.
const MomentFields = ({
  label,
  value,
  hasTime,
  fromDay,
  minTime,
  onDayChange,
  onTimeChange,
}: MomentFieldsProps) => {
  return (
    <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2 text-sm">
      <span>{label}</span>
      <DatePicker
        className={hasTime ? undefined : "col-span-2"}
        fromDay={fromDay}
        label={`${label} date`}
        value={value}
        onChange={onDayChange}
      />
      {hasTime && (
        <TimePicker
          label={`${label} time`}
          minTime={minTime}
          value={toTimeInputValue(value)}
          onChange={onTimeChange}
        />
      )}
    </div>
  );
};

export default MomentFields;
