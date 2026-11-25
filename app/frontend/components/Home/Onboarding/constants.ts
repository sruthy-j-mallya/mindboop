import type { Onboarding } from "@/apis/types";
import routes from "@/routes";

export const STEPS: {
  label: string;
  hint: string;
  path: string;
  getIsDone: (onboarding: Onboarding) => boolean;
}[] = [
  {
    label: "Add a task",
    hint: "Anything on your mind goes in the Inbox.",
    path: routes.inbox.index,
    getIsDone: ({ hasTasks }) => hasTasks,
  },
  {
    label: "Create an area of life",
    hint: "Group tasks by Work, Health, Home or whatever fits.",
    path: routes.inbox.index,
    getIsDone: ({ hasLifeAreas }) => hasLifeAreas,
  },
  {
    label: "Start a session",
    hint: "Pick a task and give it a few minutes.",
    path: routes.timer,
    getIsDone: ({ hasSessions }) => hasSessions,
  },
];

// Followed by the user's id, as several people may share a browser.
export const DISMISSED_STORAGE_KEY = "onboarding.dismissed";
