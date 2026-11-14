import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import { toTimeInputValue } from "./utils";

type MomentFieldsProps = {
  label: string;
  value: Date;
  hasTime: boolean;
  onDayChange: (day: Date) => void;
  onTimeChange: (time: string) => void;
};

// A labelled date picker, plus a time input unless the duration is all day. A cleared time is ignored.
const MomentFields = ({ label, value, hasTime, onDayChange, onTimeChange }: MomentFieldsProps) => {
  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 text-sm">
      <span>{label}</span>
      <DatePicker
        className={hasTime ? undefined : "col-span-2"}
        label={`${label} date`}
        value={value}
        onChange={onDayChange}
      />
      {hasTime && (
        <TimePicker label={`${label} time`} value={toTimeInputValue(value)} onChange={onTimeChange} />
      )}
    </div>
  );
};

export default MomentFields;
