import type { CreateLifeAreaPayload } from "@/apis/types";

import type { DropTarget } from "./types";

// Offered in the sidebar until there are areas. The ones picked are added as they are and can be edited after.
export const LIFE_AREA_SUGGESTIONS: CreateLifeAreaPayload[] = [
  { name: "Work", color: "indigo", emoji: "💼", defaultSound: "rain" },
  { name: "Health", color: "emerald", emoji: "🩺", defaultSound: "waves" },
  { name: "Relationships", color: "rose", emoji: "❤️", defaultSound: "piano" },
  { name: "Household", color: "teal", emoji: "🏠", defaultSound: "morning" },
  { name: "Leisure", color: "amber", emoji: "🎮", defaultSound: "campfire" },
  { name: "Learning", color: "violet", emoji: "📚", defaultSound: "harp" },
  { name: "Finances", color: "slate", emoji: "💰", defaultSound: "clock" },
];

export const INBOX_NAME = "Inbox";

export const INBOX_TARGET: DropTarget = { lifeAreaId: null, name: INBOX_NAME };

// The id the Inbox drops as; areas drop as their own ids.
export const INBOX_DROP_ID = "inbox";
