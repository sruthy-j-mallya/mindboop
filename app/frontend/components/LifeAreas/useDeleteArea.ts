import { useMatch, useNavigate } from "react-router";
import { toast } from "sonner";

import type { LifeArea } from "@/apis/types";
import { useDeleteLifeArea } from "@/hooks/reactQuery/useLifeAreasApi";
import routes from "@/routes";

// Deletes an area; its tasks go back to the Inbox. If the area (or one of its tasks) is open, the Inbox opens instead.
const useDeleteArea = ({ id, name }: Pick<LifeArea, "id" | "name">, onDeleted?: () => void) => {
  const navigate = useNavigate();
  const openLifeAreaId = useMatch({ path: routes.lifeAreas.show, end: false })?.params.lifeAreaId;
  const { mutate: deleteLifeArea, isPending: isDeleting, error } = useDeleteLifeArea();

  const handleDeleted = () => {
    onDeleted?.();
    if (openLifeAreaId === id) navigate(routes.inbox.index);
    toast(`Deleted ${name}. Its tasks are back in the Inbox.`);
  };

  const deleteArea = () => deleteLifeArea(id, { onSuccess: handleDeleted });

  return { deleteArea, isDeleting, error };
};

export default useDeleteArea;
