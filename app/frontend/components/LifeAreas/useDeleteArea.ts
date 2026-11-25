import { useMatch, useNavigate } from "react-router";
import { toast } from "sonner";

import type { LifeArea } from "@/apis/types";
import { useDeleteLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";
import routes from "@/routes";
import { getTaskListPath } from "@/utils";

import type { DropTarget } from "./types";

// Deletes an area; its uncompleted tasks, if it has any, move to the target. If the area (or one of its tasks) is open, the target's
// list opens instead, or the Inbox when there's none.
const useDeleteArea = ({ id, name }: Pick<LifeArea, "id" | "name">, onDeleted?: () => void) => {
  const navigate = useNavigate();
  const openLifeAreaId = useMatch({ path: routes.lifeAreas.show, end: false })?.params.lifeAreaId;
  const { mutateAsync: deleteLifeArea, isPending: isDeleting, error } = useDeleteLifeArea();

  // Awaited instead of passed to `mutate`, whose callbacks don't run if the area has already left the sidebar. A failure
  // shows through `error`, so the rejection needs no handling here.
  const deleteArea = (target: DropTarget | null) => {
    const handleDeleted = () => {
      onDeleted?.();
      if (openLifeAreaId === id) navigate(getTaskListPath(target?.lifeAreaId ?? null));
      toast(target ? `Deleted ${name} and moved its tasks to ${target.name}` : `Deleted ${name}`);
    };

    return deleteLifeArea({ id, tasksLifeAreaId: target?.lifeAreaId ?? undefined }).then(
      handleDeleted,
      () => undefined,
    );
  };

  return { deleteArea, isDeleting, error };
};

export default useDeleteArea;
