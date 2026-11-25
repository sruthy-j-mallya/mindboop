import useRoutineReminders from "./useRoutineReminders";

// Lives in the layout, so routine reminders show on every page.
const RoutineReminders = () => {
  useRoutineReminders();

  return null;
};

export default RoutineReminders;
