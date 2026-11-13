import type { CreateQuickStartPayload } from "@/apis/types";
import { MINUTES_PER_HOUR } from "@/constants";
import { formatMinutes } from "@/utils";

import {
  DRAFT_SCHEMA,
  DRAFT_STORAGE_KEY,
  INITIAL_FORM_VALUES,
  isValidCustomMinutes,
  type QuickStartDraft,
  type QuickStartFormValues,
} from "./constants";

export const buildQuickStartPayload = ({
  title,
  description,
  steps,
  presetMinutes,
  customMinutes,
}: QuickStartFormValues): CreateQuickStartPayload => ({
  title,
  ...(description && { description }),
  estimatedMinutes: presetMinutes ?? Number(customMinutes),
  checklistItemsAttributes: steps.map(({ text, isDone }) => ({ title: text, isCompleted: isDone })),
});

// Only an hour or more needs converting, and only a time the form accepts is worth echoing back.
export const getCustomMinutesHint = (customMinutes: string) => {
  const minutes = Number(customMinutes);

  if (!isValidCustomMinutes(customMinutes) || minutes < MINUTES_PER_HOUR) return undefined;

  return `That's ${formatMinutes(minutes)}`;
};

const loadDraft = () => {
  try {
    const result = DRAFT_SCHEMA.safeParse(JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null"));

    return result.success ? result.data : {};
  } catch {
    // Storage can be blocked or hold malformed JSON; the form starts empty.
    return {};
  }
};

export const getInitialFormValues = (): QuickStartFormValues => ({ ...INITIAL_FORM_VALUES, ...loadDraft() });

export const saveDraft = (draft: QuickStartDraft) => {
  try {
    const isEmpty = !draft.title && !draft.description && draft.steps.length === 0;

    if (isEmpty) localStorage.removeItem(DRAFT_STORAGE_KEY);
    else localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be blocked or full; the draft just won't survive a reload.
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Storage can be blocked; there is nothing to clear then.
  }
};
