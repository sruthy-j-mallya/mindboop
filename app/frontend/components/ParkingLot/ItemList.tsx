import { useState } from "react";

import { SquareParking } from "lucide-react";

import type { ParkingLotItemStatus } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useCuriosityTime } from "@/hooks/reactQuery/useCuriosityTimesApi";
import { useInfiniteParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";

import BulkActionBar from "./BulkActionBar";
import ItemRow from "./ItemRow";
import useBulkActions from "./useBulkActions";

type ItemListProps = { status: ParkingLotItemStatus; label: string; emptyMessage: string };

const ItemList = ({ status, label, emptyMessage }: ItemListProps) => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteParkingLotItems({
      status,
    });
  const { data: curiosityTime } = useCuriosityTime();
  const { markAddressed, letGo, isPending: isBulkPending, error: bulkError } = useBulkActions();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const items = data?.pages.flatMap((page) => page.parkingLotItems) ?? [];
  const isCuriosityRunning = !!curiosityTime?.parkingLotItem;
  // Thoughts that leave the list (moved by a row action or in another tab) drop out of the selection.
  const selectedIds = checkedIds.filter((id) => items.some((item) => item.id === id));

  const handleLoadMore = () => fetchNextPage();
  const handleSelectAll = (isSelected: boolean) => setCheckedIds(isSelected ? items.map(({ id }) => id) : []);
  const handleSelectedChange = (id: string, isSelected: boolean) =>
    setCheckedIds(isSelected ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));
  const clearSelection = () => setCheckedIds([]);
  // A failure shows through `bulkError` and keeps the selection, so it can be tried again.
  const ignore = () => undefined;
  const handleMarkAddressed = () => markAddressed(selectedIds).then(clearSelection, ignore);
  const handleLetGo = () => letGo(selectedIds).then(clearSelection, ignore);

  if (isPending) return null;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error.message}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <SquareParking className="size-8" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <BulkActionBar
        isPending={isBulkPending}
        itemCount={items.length}
        selectedCount={selectedIds.length}
        status={status}
        onLetGo={handleLetGo}
        onMarkAddressed={handleMarkAddressed}
        onSelectAll={handleSelectAll}
      />
      {bulkError && (
        <p className="px-3 text-sm text-destructive" role="alert">
          {bulkError.message}
        </p>
      )}
      <ul aria-label={label} className="flex flex-col gap-2">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <ItemRow
              key={item.id}
              isBulkPending={isBulkPending && isSelected}
              isCuriosityRunning={isCuriosityRunning}
              isSelected={isSelected}
              item={item}
              onSelectedChange={handleSelectedChange}
            />
          );
        })}
      </ul>
      {hasNextPage && (
        <Button disabled={isFetchingNextPage} type="button" variant="ghost" onClick={handleLoadMore}>
          Load more
        </Button>
      )}
    </div>
  );
};

export default ItemList;
