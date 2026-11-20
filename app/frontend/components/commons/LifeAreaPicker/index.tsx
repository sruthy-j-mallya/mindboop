import { useState } from "react";

import { Inbox } from "lucide-react";

import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";

import { INBOX_LABEL } from "./constants";
import Option from "./Option";

type LifeAreaPickerProps = {
  lifeAreaId: string | null;
  onSave: (lifeAreaId: string | null) => void;
  // Just the Inbox icon while in no area, where room is tight (the Calendar's popover).
  isCompact?: boolean;
};

// Picks the area of life a task is in, or the Inbox for none. Hidden until the user has an area.
const LifeAreaPicker = ({ lifeAreaId, onSave, isCompact = false }: LifeAreaPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: lifeAreas = [] } = useLifeAreas();
  const lifeArea = lifeAreas.find(({ id }) => id === lifeAreaId);
  const isIconOnly = isCompact && !lifeArea;

  const handlePick = (pickedId: string | null) => {
    setIsOpen(false);
    if (pickedId !== lifeAreaId) onSave(pickedId);
  };

  if (lifeAreas.length === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`Area of life: ${lifeArea?.name ?? INBOX_LABEL}`}
          className="text-muted-foreground"
          size={isIconOnly ? "icon-sm" : "sm"}
          type="button"
          variant="ghost"
        >
          {lifeArea ? (
            <LifeAreaBadge
              className="size-4 rounded [&_svg]:size-3"
              color={lifeArea.color}
              icon={lifeArea.icon}
            />
          ) : (
            <Inbox />
          )}
          {!isIconOnly && (lifeArea?.name ?? INBOX_LABEL)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-label="Areas of life" className="w-56 p-1">
        <ul className="flex flex-col">
          <Option
            icon={<Inbox className="size-4 text-muted-foreground" />}
            isSelected={!lifeArea}
            label={INBOX_LABEL}
            onPick={() => handlePick(null)}
          />
          {lifeAreas.map(({ id, name, color, icon }) => (
            <Option
              key={id}
              icon={<LifeAreaBadge className="size-5" color={color} icon={icon} />}
              isSelected={id === lifeAreaId}
              label={name}
              onPick={() => handlePick(id)}
            />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default LifeAreaPicker;
