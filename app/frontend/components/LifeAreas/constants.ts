import type { CreateLifeAreaPayload } from "@/apis/types";

// Offered (behind the bulb, and in the sidebar until there are areas) to start with. One picked is added as it is and
// can be edited after; ones already added, by name, aren't offered again.
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

// The id the Inbox drops as; areas drop as their own ids.
export const INBOX_DROP_ID = "inbox";
