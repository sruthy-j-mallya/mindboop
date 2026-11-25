import EmptyPane from "@/components/commons/EmptyPane";
import { Button } from "@/components/ui/button";

import { NEW_TASK_INPUT_ID } from "./constants";

// The pane's placeholder on wide screens. On narrow ones the list fills the page until a task is picked.
const NoTaskSelected = () => {
  const handleAdd = () => document.getElementById(NEW_TASK_INPUT_ID)?.focus();

  return (
    <EmptyPane className="hidden lg:flex" message="Pick a task to see its steps and description.">
      <Button size="sm" type="button" variant="outline" onClick={handleAdd}>
        Or add a new one
      </Button>
    </EmptyPane>
  );
};

export default NoTaskSelected;
