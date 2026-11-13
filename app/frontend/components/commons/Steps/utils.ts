import type { Active, Announcements, Over } from "@dnd-kit/core";

// Each Step passes its text as sortable data, so announcements can name it.
const textOf = ({ data }: Active | Over): string => data.current?.text;

// dnd-kit announces raw ids by default, which are meaningless UUIDs for field array rows.
export const STEP_ANNOUNCEMENTS: Announcements = {
  onDragStart: ({ active }) => `Picked up ${textOf(active)}.`,
  onDragOver: ({ active, over }) => {
    if (!over || active.id === over.id) return undefined;

    return `${textOf(active)} moved over ${textOf(over)}.`;
  },
  onDragEnd: ({ active, over }) =>
    over ? `${textOf(active)} dropped over ${textOf(over)}.` : `${textOf(active)} dropped.`,
  onDragCancel: ({ active }) => `Cancelled. ${textOf(active)} went back to where it was.`,
};
