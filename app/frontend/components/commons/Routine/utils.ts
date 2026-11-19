import { ROUTINE_ICONS } from "./constants";
import type { RoutineIconId } from "./types";

// A routine's icon by its key, falling back to the first should the server send one this client doesn't know.
export const findRoutineIcon = (id: RoutineIconId) =>
  ROUTINE_ICONS.find((icon) => icon.id === id) ?? ROUTINE_ICONS[0];
