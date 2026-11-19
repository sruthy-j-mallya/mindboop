import { useState } from "react";

import { Pencil } from "lucide-react";

import type { LifeArea } from "@/apis/types";
import { Button } from "@/components/ui/button";

import AreaBadge from "../AreaBadge";
import EditAreaDialog from "../AreaDialog/Edit";
import { INBOX_NAME } from "../constants";

type BoardHeadingProps = { id: string; lifeArea?: LifeArea };

// The list's name: the Inbox, or the area with its badge and a button to edit it.
const BoardHeading = ({ id, lifeArea }: BoardHeadingProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCloseEdit = () => setIsEditing(false);

  if (!lifeArea) {
    return (
      <h1 className="text-2xl font-semibold" id={id}>
        {INBOX_NAME}
      </h1>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <AreaBadge className="size-8 rounded-lg [&_svg]:size-4.5" color={lifeArea.color} icon={lifeArea.icon} />
      <h1 className="min-w-0 truncate text-2xl font-semibold" id={id}>
        {lifeArea.name}
      </h1>
      <Button
        aria-label={`Edit ${lifeArea.name}`}
        className="text-muted-foreground"
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={handleEdit}
      >
        <Pencil />
      </Button>
      {isEditing && <EditAreaDialog lifeArea={lifeArea} onClose={handleCloseEdit} />}
    </div>
  );
};

export default BoardHeading;
