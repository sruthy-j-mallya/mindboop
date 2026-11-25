// The pane's placeholder on wide screens. On narrow ones the list fills the page until a task is picked.
const NoTaskSelected = () => (
  <p className="hidden py-12 text-center text-sm text-muted-foreground lg:block">
    Pick a task to see its steps and description.
  </p>
);

export default NoTaskSelected;
