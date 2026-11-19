import { useState } from "react";

import { Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import routes from "@/routes";
import { getTaskListPath } from "@/utils";

import AreaBadge from "../AreaBadge";
import NewAreaDialog from "../AreaDialog/New";
import { INBOX_DROP_ID, INBOX_NAME } from "../constants";
import NavItem from "./NavItem";
import SuggestionChips from "./SuggestionChips";
import Suggestions from "./Suggestions";

// The Inbox and the areas, oldest first, to switch between and drop tasks on. A column on wide screens, a row that
// scrolls sideways on narrow ones. Until there are areas, the suggestions show here too.
const AreaNav = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { data: lifeAreas = [], isPending, error } = useLifeAreas();

  const handleAdd = () => setIsAdding(true);
  const handleCloseAdd = () => setIsAdding(false);

  return (
    <nav
      aria-label="Areas of life"
      className="flex shrink-0 flex-col gap-3 border-b px-4 pb-4 lg:w-60 lg:overflow-y-auto lg:border-r lg:border-b-0"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Areas of life</h2>
        <div className="flex items-center">
          <Suggestions lifeAreas={lifeAreas} />
          <Button aria-label="Add an area" size="icon-sm" type="button" variant="ghost" onClick={handleAdd}>
            <Plus />
          </Button>
        </div>
      </div>
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 py-0.5 lg:flex-col lg:overflow-visible">
        <NavItem
          icon={<Inbox className="size-4 text-muted-foreground" />}
          id={INBOX_DROP_ID}
          target={{ lifeAreaId: null, name: INBOX_NAME }}
          to={routes.inbox.index}
        />
        {lifeAreas.map(({ id, name, color, icon }) => (
          <NavItem
            key={id}
            icon={<AreaBadge className="size-5" color={color} icon={icon} />}
            id={id}
            target={{ lifeAreaId: id, name }}
            to={getTaskListPath(id)}
          />
        ))}
      </ul>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
      {!isPending && !error && lifeAreas.length === 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3">
          <p className="text-sm text-muted-foreground">
            Group your tasks by the parts of your life. Pick one to start:
          </p>
          <SuggestionChips lifeAreas={lifeAreas} />
        </div>
      )}
      {isAdding && <NewAreaDialog onClose={handleCloseAdd} />}
    </nav>
  );
};

export default AreaNav;
