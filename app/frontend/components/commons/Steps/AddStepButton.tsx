import { ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";

type AddStepButtonProps = { onClick: () => void };

// Starts the first step. Once there is one, Enter in a step adds the next, so the button is only shown while there are
// none.
const AddStepButton = ({ onClick }: AddStepButtonProps) => (
  <Button
    className="shrink-0 text-muted-foreground"
    size="sm"
    type="button"
    variant="ghost"
    onClick={onClick}
  >
    <ListTodo />
    Add step
  </Button>
);

export default AddStepButton;
