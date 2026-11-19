import type { LucideIcon } from "lucide-react";

// Mirrors `Routine::ICONS` on the server.
export type RoutineIconId =
  | "toothbrush"
  | "shower-head"
  | "bath"
  | "flower-2"
  | "dumbbell"
  | "person-standing"
  | "footprints"
  | "bike"
  | "book-open"
  | "utensils"
  | "cooking-pot"
  | "washing-machine"
  | "shirt"
  | "broom"
  | "spray-can"
  | "bed"
  | "pill"
  | "leaf"
  | "droplets"
  | "music"
  | "sun"
  | "moon"
  | "heart"
  | "sparkles";

export type RoutineIcon = { id: RoutineIconId; label: string; icon: LucideIcon };
