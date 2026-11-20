import type { LucideIcon } from "lucide-react";

// Mirrors `LifeArea::COLORS` and `LifeArea::ICONS` on the server.
export type LifeAreaColorId =
  "rose" | "orange" | "amber" | "lime" | "emerald" | "teal" | "sky" | "indigo" | "violet" | "slate";

export type LifeAreaIconId =
  | "briefcase"
  | "heart"
  | "users"
  | "house"
  | "dumbbell"
  | "heart-pulse"
  | "gamepad-2"
  | "palette"
  | "book-open"
  | "sprout"
  | "wallet"
  | "plane"
  | "music"
  | "coffee"
  | "brain"
  | "sparkles"
  | "paw-print"
  | "baby"
  | "laptop"
  | "smile";

export type LifeAreaColor = { id: LifeAreaColorId; label: string; value: string };

export type LifeAreaIcon = { id: LifeAreaIconId; label: string; icon: LucideIcon };
