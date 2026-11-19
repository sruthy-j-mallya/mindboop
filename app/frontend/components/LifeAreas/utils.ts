import type { CSSProperties } from "react";

import type { LifeArea } from "@/apis/types";
import { getLifeAreaColor } from "@/components/commons/LifeArea/utils";

// Suggestions whose name isn't taken yet, ignoring case as the server does.
export const isNameTaken = (lifeAreas: LifeArea[], name: string) =>
  lifeAreas.some((lifeArea) => lifeArea.name.toLowerCase() === name.toLowerCase());

// The inline style that hands an area's colour to `.area-tint` and friends.
export const toAreaColorStyle = (color: LifeArea["color"]) =>
  ({ "--area-color": getLifeAreaColor(color) }) as CSSProperties;
