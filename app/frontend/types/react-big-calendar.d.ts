// react-big-calendar's own docs build custom views on TimeGrid, which @types/react-big-calendar doesn't cover.
declare module "react-big-calendar/lib/TimeGrid" {
  import type { ComponentType } from "react";

  const TimeGrid: ComponentType<Record<string, unknown>>;
  export default TimeGrid;
}
