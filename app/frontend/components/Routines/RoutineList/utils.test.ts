import { describe, expect, it } from "vitest";

import type { Routine } from "@/apis/types";

import { orderByIds } from "./utils";

const routinesWithIds = (...ids: string[]) => ids.map((id) => ({ id }) as Routine);

describe("orderByIds", () => {
  it("puts the routines in the order of the ids, leaving any not listed after them", () => {
    const ordered = orderByIds(routinesWithIds("shower", "reading", "walk", "new"), [
      "walk",
      "shower",
      "reading",
    ]);

    expect(ordered.map(({ id }) => id)).toEqual(["walk", "shower", "reading", "new"]);
  });
});
