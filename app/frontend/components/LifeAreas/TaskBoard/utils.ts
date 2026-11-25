import type { LifeArea, TaskFilters } from "@/apis/types";

const getListFilters = (lifeArea?: LifeArea): TaskFilters =>
  lifeArea ? { lifeAreaId: lifeArea.id } : { isInInbox: true };

// Only tasks still to do are listed; ticking one off takes it out of its list. The Inbox lists the tasks in no area.
export const getTaskFilters = (lifeArea?: LifeArea): TaskFilters => ({
  isCompleted: false,
  ...getListFilters(lifeArea),
});

export const getCompletedTaskFilters = (lifeArea?: LifeArea): TaskFilters => ({
  isCompleted: true,
  ...getListFilters(lifeArea),
});
