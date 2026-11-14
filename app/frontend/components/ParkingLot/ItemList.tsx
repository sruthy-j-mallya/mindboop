import { SquareParking } from "lucide-react";

import type { ParkingLotItemStatus } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { useInfiniteParkingLotItems } from "@/hooks/reactQuery/useParkingLotItemsApi";

import ItemRow from "./ItemRow";

type ItemListProps = { status: ParkingLotItemStatus; label: string; emptyMessage: string };

const ItemList = ({ status, label, emptyMessage }: ItemListProps) => {
  const { data, isPending, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteParkingLotItems({
      status,
    });
  const items = data?.pages.flatMap((page) => page.parkingLotItems) ?? [];

  const handleLoadMore = () => fetchNextPage();

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
      <ul aria-label={label} className="flex flex-col gap-3">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
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
