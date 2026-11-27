import type { Active, Announcements, Over } from "@dnd-kit/core";

import type { Routine } from "@/apis/types";

// Each RoutineRow passes its title as sortable data, so announcements can name it rather than its id.
const titleOf = ({ data }: Active | Over): string => data.current?.title;

export const ROUTINE_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Picked up ${titleOf(active)}.`,
  onDragOver: ({ active, over }) => {
    if (!over || active.id === over.id) return undefined;

    return `${titleOf(active)} moved over ${titleOf(over)}.`;
  },
  onDragEnd: ({ active, over }) =>
    over ? `${titleOf(active)} dropped over ${titleOf(over)}.` : `${titleOf(active)} dropped.`,
  onDragCancel: ({ active }) => `Cancelled. ${titleOf(active)} went back to where it was.`,
};

// The routines in the order of `ids`; any not listed keep their place after them.
export const orderByIds = (routines: Routine[], ids: string[]) => {
  const rank = (routine: Routine) => {
    const index = ids.indexOf(routine.id);

    return index === -1 ? ids.length : index;
  };

  return routines.toSorted((a, b) => rank(a) - rank(b));
};
