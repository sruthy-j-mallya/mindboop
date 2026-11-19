import { LIFE_AREA_COLORS, LIFE_AREA_ICONS } from "./constants";
import type { LifeAreaColorId, LifeAreaIconId } from "./types";

// The CSS colour for an area's colour key, falling back to the first should the server send one this client doesn't know.
export const getLifeAreaColor = (id: LifeAreaColorId) =>
  (LIFE_AREA_COLORS.find((color) => color.id === id) ?? LIFE_AREA_COLORS[0]).value;

// An area's icon (its label and component) by its key, falling back to the first likewise.
export const findLifeAreaIcon = (id: LifeAreaIconId) =>
  LIFE_AREA_ICONS.find((icon) => icon.id === id) ?? LIFE_AREA_ICONS[0];
