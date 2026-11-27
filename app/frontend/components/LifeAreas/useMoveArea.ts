import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { LifeArea } from "@/apis/types";
import { useLifeAreas, useMoveLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";
import useDroppedOrder from "@/hooks/useDroppedOrder";

import type { DropTarget } from "./types";
import { getAreaPosition } from "./utils";

// Moves an area dropped on another one to its place. Returns the areas in the order to list them, which shows a drop
// at once (see useDroppedOrder).
const useMoveArea = () => {
  const { data: listedLifeAreas = [] } = useLifeAreas();
  const [lifeAreas, showMove] = useDroppedOrder(listedLifeAreas);
  const { mutate: moveLifeArea } = useMoveLifeArea();

  const handleError = (error: ApiError) => toast.error(error.message);

  const moveArea = ({ id }: LifeArea, target: DropTarget | undefined) => {
    const areaIds = lifeAreas.map((lifeArea) => lifeArea.id);
    const position = getAreaPosition(areaIds, id, target);
    if (position === null) return;

    showMove(id, position);
    moveLifeArea({ id, position }, { onError: handleError });
  };

  return { lifeAreas, moveArea };
};

export default useMoveArea;
