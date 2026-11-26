import { describe, expect, it } from "vitest";

import { hasLinks, splitLinks } from "./utils";

describe("splitLinks", () => {
  it("keeps text without addresses as one plain run", () => {
    expect(splitLinks("Water the plants")).toEqual([{ kind: "text", text: "Water the plants" }]);
    expect(hasLinks("Water the plants")).toBe(false);
  });

  it("splits out http and https addresses", () => {
    expect(splitLinks("Read https://example.com/post?id=1 then http://a.io")).toEqual([
      { kind: "text", text: "Read " },
      { kind: "link", text: "https://example.com/post?id=1", href: "https://example.com/post?id=1" },
      { kind: "text", text: " then " },
      // eslint-disable-next-line sonarjs/no-clear-text-protocols -- plain http addresses are linked too
      { kind: "link", text: "http://a.io", href: "http://a.io" },
    ]);
  });

  it("opens bare www. addresses over https", () => {
    expect(splitLinks("www.mindboop.com")).toEqual([
      { kind: "link", text: "www.mindboop.com", href: "https://www.mindboop.com" },
    ]);
  });

  it("leaves trailing punctuation and stray brackets out of the link", () => {
    expect(splitLinks("See (https://example.com/a).")).toEqual([
      { kind: "text", text: "See (" },
      { kind: "link", text: "https://example.com/a", href: "https://example.com/a" },
      { kind: "text", text: ")." },
    ]);
  });

  it("keeps brackets that belong to the address", () => {
    const address = "https://en.wikipedia.org/wiki/Mind_(disambiguation)";

    expect(splitLinks(`${address}!`)).toEqual([
      { kind: "link", text: address, href: address },
      { kind: "text", text: "!" },
    ]);
  });

  it("ignores other schemes and words that only look like addresses", () => {
    expect(hasLinks("javascript:alert(1)")).toBe(false);
    expect(hasLinks("Email me@example.com")).toBe(false);
    expect(hasLinks("Read https://")).toBe(false);
  });
});
