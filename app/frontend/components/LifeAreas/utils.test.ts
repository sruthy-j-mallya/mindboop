import { describe, expect, it } from "vitest";

import { INBOX_TARGET } from "./constants";
import { getAreaPosition } from "./utils";

describe("getAreaPosition", () => {
  const areaIds = ["work", "health", "leisure"];
  const targetOf = (lifeAreaId: string) => ({ lifeAreaId, name: lifeAreaId });

  it("is the place of the area dropped on", () => {
    expect(getAreaPosition(areaIds, "leisure", targetOf("work"))).toBe(0);
    expect(getAreaPosition(areaIds, "work", targetOf("leisure"))).toBe(2);
  });

  it("is nowhere for the area itself, the Inbox, an unknown area or no target", () => {
    expect(getAreaPosition(areaIds, "work", targetOf("work"))).toBeNull();
    expect(getAreaPosition(areaIds, "work", INBOX_TARGET)).toBeNull();
    expect(getAreaPosition(areaIds, "work", targetOf("gone"))).toBeNull();
    expect(getAreaPosition(areaIds, "work", undefined)).toBeNull();
  });
});
