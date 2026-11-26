import EmptyPane from "@/components/commons/EmptyPane";

// The pane's placeholder on wide screens. On narrow ones the list fills the page until a routine is picked.
const NoRoutineSelected = () => (
  <EmptyPane
    className="hidden h-full lg:flex"
    message="Pick a routine to see how it’s going, or press play to start one."
  />
);

export default NoRoutineSelected;
