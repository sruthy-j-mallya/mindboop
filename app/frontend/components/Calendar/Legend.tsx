// What solid and dashed events are.
const Legend = () => (
  <ul aria-label="Legend" className="flex items-center gap-4 text-xs text-muted-foreground">
    <li className="flex items-center gap-1.5">
      <span aria-hidden className="size-3 rounded-sm border border-primary bg-primary" />
      Task
    </li>
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-3 rounded-sm border border-dashed border-(--primary-text) bg-(--primary-text)/15"
      />
      Logged time
    </li>
  </ul>
);

export default Legend;
