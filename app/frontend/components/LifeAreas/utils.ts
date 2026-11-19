import type { LifeArea } from "@/apis/types";

// Whether an area already has this name, ignoring case as the server does.
export const isNameTaken = (lifeAreas: LifeArea[], name: string) =>
  lifeAreas.some((lifeArea) => lifeArea.name.toLowerCase() === name.toLowerCase());
