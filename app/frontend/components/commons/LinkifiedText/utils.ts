import { TRAILING_PUNCTUATION, URL_PATTERN } from "./constants";
import type { Segment } from "./types";

const count = (text: string, char: string) => text.split(char).length - 1;

// Drops sentence punctuation and a closing bracket with no opening one inside the address ("(see https://x.com)").
const trimAddress = (address: string) => {
  let trimmed = address;
  const isTrailing = (char: string) =>
    TRAILING_PUNCTUATION.has(char) || (char === ")" && count(trimmed, ")") > count(trimmed, "("));

  while (trimmed && isTrailing(trimmed.at(-1) ?? "")) trimmed = trimmed.slice(0, -1);

  return trimmed;
};

// "www.example.com" opens as "https://www.example.com". Anything that isn't a valid http(s) URL stays text.
const toHref = (address: string) => {
  const href = /^https?:\/\//i.test(address) ? address : `https://${address}`;

  try {
    const { protocol } = new URL(href);

    return protocol === "http:" || protocol === "https:" ? href : null;
  } catch {
    return null;
  }
};

const appendText = (segments: Segment[], text: string) => {
  if (!text) return;

  const last = segments.at(-1);
  if (last?.kind === "text") last.text += text;
  else segments.push({ kind: "text", text });
};

// Splits text into plain runs and web addresses, in order.
export const splitLinks = (text: string): Segment[] => {
  const segments: Segment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const address = trimAddress(match[0]);
    const href = toHref(address);
    if (!href || !address) continue;

    appendText(segments, text.slice(cursor, match.index));
    segments.push({ kind: "link", text: address, href });
    cursor = match.index + address.length;
  }
  appendText(segments, text.slice(cursor));

  return segments;
};

export const hasLinks = (text: string) => splitLinks(text).some(({ kind }) => kind === "link");
