import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useDroppedOrder from "./useDroppedOrder";

const withIds = (...ids: string[]) => ids.map((id) => ({ id }));

const renderDroppedOrder = (items: { id: string }[]) => {
  const { result, rerender } = renderHook(({ listed }) => useDroppedOrder(listed), {
    initialProps: { listed: items },
  });
  const shownIds = () => result.current[0].map(({ id }) => id);
  const showMove = (id: string, position: number) => act(() => result.current[1](id, position));
  // A new array each time, as a caller mapping its list on every render would pass.
  const relist = (...ids: string[]) => rerender({ listed: withIds(...ids) });

  return { shownIds, showMove, relist };
};

describe("useDroppedOrder", () => {
  it("shows the dropped order until the list given catches up", () => {
    const { shownIds, showMove, relist } = renderDroppedOrder(withIds("a", "b", "c"));

    showMove("c", 0);
    expect(shownIds()).toEqual(["c", "a", "b"]);

    relist("a", "b", "c");
    expect(shownIds()).toEqual(["c", "a", "b"]);

    relist("c", "a", "b");
    expect(shownIds()).toEqual(["c", "a", "b"]);
  });

  it("follows the list once it changes, so a failed move goes back", () => {
    const { shownIds, showMove, relist } = renderDroppedOrder(withIds("a", "b", "c"));

    showMove("c", 0);
    relist("c", "a", "b");
    relist("a", "b", "c");

    expect(shownIds()).toEqual(["a", "b", "c"]);
  });

  it("builds a second drop on the first", () => {
    const { shownIds, showMove } = renderDroppedOrder(withIds("a", "b", "c"));

    showMove("c", 0);
    showMove("a", 2);

    expect(shownIds()).toEqual(["c", "b", "a"]);
  });
});
