import { Navigate, useParams } from "react-router";

import { useLifeAreas } from "@/hooks/reactQuery/useLifeAreasApi";
import routes from "@/routes";

import Board from "./Board";

// The Inbox's tasks, or an area's. An area that's gone (deleted, or never there) leads back to the Inbox. Keyed by the
// list, so a search doesn't carry over to the next area picked.
const TaskBoard = () => {
  const { lifeAreaId } = useParams();
  const { data: lifeAreas = [], isPending } = useLifeAreas({ enabled: !!lifeAreaId });
  const lifeArea = lifeAreas.find(({ id }) => id === lifeAreaId);

  if (!lifeAreaId) return <Board key="inbox" />;

  if (isPending) return null;

  if (!lifeArea) return <Navigate replace to={routes.inbox.index} />;

  return <Board key={lifeArea.id} lifeArea={lifeArea} />;
};

export default TaskBoard;
