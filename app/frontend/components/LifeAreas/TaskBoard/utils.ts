import type { LifeArea, TaskFilters } from "@/apis/types";

// Only tasks still to do are listed; ticking one off takes it out of its list. The Inbox lists the tasks in no area.
export const getTaskFilters = (lifeArea?: LifeArea): TaskFilters => ({
  isCompleted: false,
  ...(lifeArea ? { lifeAreaId: lifeArea.id } : { isInInbox: true }),
});
