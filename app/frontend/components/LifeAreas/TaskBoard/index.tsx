import { Navigate, useParams } from "react-router";

import { useLifeAreas, useTasksMovedTo } from "@/hooks/reactQuery/useLifeAreasApi";
import { getTaskListPath } from "@/utils";

import Board from "./Board";

// The Inbox's tasks, or an area's. An area that's gone (deleted, or never there) leads to the list its tasks were moved
// to, or the Inbox. Keyed by the list, so a half-typed task doesn't carry over to the next area picked.
const TaskBoard = () => {
  const { lifeAreaId } = useParams();
  const { data: lifeAreas = [], isPending } = useLifeAreas({ enabled: !!lifeAreaId });
  const tasksLifeAreaId = useTasksMovedTo(lifeAreaId);
  const lifeArea = lifeAreas.find(({ id }) => id === lifeAreaId);

  if (!lifeAreaId) return <Board key="inbox" />;

  if (isPending) return null;

  if (!lifeArea) return <Navigate replace to={getTaskListPath(tasksLifeAreaId ?? null)} />;

  return <Board key={lifeArea.id} lifeArea={lifeArea} />;
};

export default TaskBoard;
