import { describe, expect, it } from "vitest";

import { orderByIds } from "./utils";

const withIds = (...ids: string[]) => ids.map((id) => ({ id }));

describe("orderByIds", () => {
  it("puts the items in the order of the ids, leaving any not listed after them", () => {
    const ordered = orderByIds(withIds("shower", "reading", "walk", "new"), ["walk", "shower", "reading"]);

    expect(ordered.map(({ id }) => id)).toEqual(["walk", "shower", "reading", "new"]);
  });
});
