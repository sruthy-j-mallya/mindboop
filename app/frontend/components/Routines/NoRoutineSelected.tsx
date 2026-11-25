// The pane's placeholder on wide screens. On narrow ones the list fills the page until a routine is picked.
const NoRoutineSelected = () => (
  <p className="hidden py-12 text-center text-sm text-muted-foreground lg:block">
    Pick a routine to see how it’s going, or press play to start one.
  </p>
);

export default NoRoutineSelected;
