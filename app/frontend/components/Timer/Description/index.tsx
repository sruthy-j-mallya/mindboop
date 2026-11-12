import { useState } from "react";

import { Pencil, Plus } from "lucide-react";

import type { Task } from "@/apis/types";
import RichTextViewer from "@/components/commons/RichText/LazyViewer";
import { Button } from "@/components/ui/button";

import DescriptionForm from "./DescriptionForm";

type DescriptionProps = { task: Task };

const Description = ({ task }: DescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleClose = () => setIsEditing(false);

  if (isEditing) return <DescriptionForm task={task} onClose={handleClose} />;

  if (!task.description) {
    return (
      <Button className="self-start text-muted-foreground" type="button" variant="ghost" onClick={handleEdit}>
        <Plus />
        Add a description
      </Button>
    );
  }

  return (
    <section aria-label="Description" className="group relative">
      <Button
        aria-label="Edit description"
        className="absolute top-0 right-0 text-muted-foreground"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={handleEdit}
      >
        <Pencil />
      </Button>
      <div className="pr-10">
        <RichTextViewer markdown={task.description} />
      </div>
    </section>
  );
};

export default Description;
