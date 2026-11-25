import type { CSSProperties } from "react";

import { LIFE_AREA_COLORS } from "./constants";
import type { LifeAreaColorId } from "./types";

// The CSS colour for an area's colour key, falling back to the first should the server send one this client doesn't know.
export const getLifeAreaColor = (id: LifeAreaColorId) =>
  (LIFE_AREA_COLORS.find((color) => color.id === id) ?? LIFE_AREA_COLORS[0]).value;

// The inline style that hands an area's colour to `.area-tint` and friends.
export const toAreaColorStyle = (color: LifeAreaColorId) =>
  ({ "--area-color": getLifeAreaColor(color) }) as CSSProperties;
