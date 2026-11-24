import { cn } from "cn";
import { Inbox } from "lucide-react";

import LifeAreaBadge from "@/components/commons/LifeArea/Badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import useOpenState, { type OpenStateProps } from "@/hooks/useOpenState";

import { INBOX_LABEL } from "./constants";
import Option from "./Option";

type LifeAreaPickerProps = OpenStateProps & {
  lifeAreaId: string | null;
  onSave: (lifeAreaId: string | null) => void;
  // Styles its button.
  className?: string;
};

// Picks the area of life a task is in, or the Inbox for none. Hidden until the user has an area.
const LifeAreaPicker = ({ lifeAreaId, className, onSave, ...openState }: LifeAreaPickerProps) => {
  const [isOpen, setIsOpen] = useOpenState(openState);
  const { data: lifeAreas = [] } = useLifeAreas();
  const lifeArea = lifeAreas.find(({ id }) => id === lifeAreaId);

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
          className={cn("text-muted-foreground", className)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {lifeArea ? (
            <LifeAreaBadge
              className="size-4 rounded text-[0.625rem]"
              color={lifeArea.color}
              emoji={lifeArea.emoji}
            />
          ) : (
            <Inbox />
          )}
          {lifeArea?.name ?? INBOX_LABEL}
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
          {lifeAreas.map(({ id, name, color, emoji }) => (
            <Option
              key={id}
              icon={<LifeAreaBadge className="size-5 text-xs" color={color} emoji={emoji} />}
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
