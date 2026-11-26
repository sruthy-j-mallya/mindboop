export type TextSegment = { kind: "text"; text: string };

export type LinkSegment = { kind: "link"; text: string; href: string };

export type Segment = TextSegment | LinkSegment;
