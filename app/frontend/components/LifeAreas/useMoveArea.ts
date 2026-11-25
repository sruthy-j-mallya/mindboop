import { toast } from "sonner";

import type { ApiError } from "@/apis/axios";
import type { LifeArea } from "@/apis/types";
import { useLifeAreas, useMoveLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";

import type { DropTarget } from "./types";
import { getAreaPosition } from "./utils";

// Moves an area dropped on another one to its place.
const useMoveArea = () => {
  const { data: lifeAreas = [] } = useLifeAreas();
  const { mutate: moveLifeArea } = useMoveLifeArea();

  const handleError = (error: ApiError) => toast.error(error.message);

  const moveArea = ({ id }: LifeArea, target: DropTarget | undefined) => {
    const areaIds = lifeAreas.map((lifeArea) => lifeArea.id);
    const position = getAreaPosition(areaIds, id, target);
    if (position !== null) moveLifeArea({ id, position }, { onError: handleError });
  };

  return moveArea;
};

export default useMoveArea;
