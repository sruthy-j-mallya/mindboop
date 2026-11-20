import type { CreateLifeAreaPayload } from "@/apis/types";

// Offered (behind the bulb, and in the sidebar until there are areas) to start with. One picked is added as it is and
// can be edited after; ones already added, by name, aren't offered again.
export const LIFE_AREA_SUGGESTIONS: CreateLifeAreaPayload[] = [
  { name: "Work", color: "indigo", icon: "briefcase", defaultSound: "rain" },
  { name: "Health", color: "emerald", icon: "heart-pulse", defaultSound: "waves" },
  { name: "Relationships", color: "rose", icon: "heart", defaultSound: "piano" },
  { name: "Household", color: "teal", icon: "house", defaultSound: "morning" },
  { name: "Leisure", color: "amber", icon: "gamepad-2", defaultSound: "campfire" },
  { name: "Learning", color: "violet", icon: "book-open", defaultSound: "harp" },
  { name: "Finances", color: "slate", icon: "wallet", defaultSound: "clock" },
];

export const INBOX_NAME = "Inbox";

// The id the Inbox drops as; areas drop as their own ids.
export const INBOX_DROP_ID = "inbox";
