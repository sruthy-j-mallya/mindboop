import type { Announcements, UniqueIdentifier } from "@dnd-kit/core";

// dnd-kit announces raw ids by default, which are meaningless UUIDs for field array rows.
export const getAnnouncements = (fields: { id: string; text: string }[]): Announcements => {
  const textOf = (id: UniqueIdentifier) => fields.find((field) => field.id === id)?.text;

  return {
    onDragStart: ({ active }) => `Picked up ${textOf(active.id)}.`,
    onDragOver: ({ active, over }) => {
      if (!over || active.id === over.id) return undefined;

      return `${textOf(active.id)} moved over ${textOf(over.id)}.`;
    },
    onDragEnd: ({ active, over }) =>
      over ? `${textOf(active.id)} dropped over ${textOf(over.id)}.` : `${textOf(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Cancelled. ${textOf(active.id)} went back to where it was.`,
  };
};
