import { useState } from "react";

import { joinIds, orderByIds } from "./utils";

type DroppedOrder = { ids: string[]; listedIds: string };

// Shows a dragged item in its new place in the same render as the drop. dnd-kit clears the dragged row's offset at
// once, but a move's optimistic update reaches the query a moment later (`onMutate` awaits, and TanStack Query notifies
// on a timeout), so the row would flash back to its old place first. The dropped order lasts until the listed order
// changes (the update arriving, or a failed move putting it back); from then on the list given wins.
const useDroppedOrder = <Item extends { id: string }>(items: Item[]) => {
  const [droppedOrder, setDroppedOrder] = useState<DroppedOrder | null>(null);
  const listedIds = joinIds(items);
  // Cleared during render rather than in an effect, so a stale order never paints.
  if (droppedOrder && droppedOrder.listedIds !== listedIds) setDroppedOrder(null);

  const orderedItems = droppedOrder?.listedIds === listedIds ? orderByIds(items, droppedOrder.ids) : items;

  // Call with the same `position` the move sends: the index the item lands on in `orderedItems`.
  const showMove = (id: string, position: number) => {
    const ids = orderedItems.map((item) => item.id).filter((itemId) => itemId !== id);
    setDroppedOrder({ ids: ids.toSpliced(position, 0, id), listedIds });
  };

  return [orderedItems, showMove] as const;
};

export default useDroppedOrder;
