type KeyTransform = (key: string) => string;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

const transformKeys = (value: unknown, transform: KeyTransform): unknown => {
  if (Array.isArray(value)) return value.map((item) => transformKeys(item, transform));

  if (!isPlainObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [transform(key), transformKeys(nested, transform)]),
  );
};

const toCamelCase: KeyTransform = (key) =>
  key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

const toSnakeCase: KeyTransform = (key) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

export const keysToCamelCase = <T>(value: unknown) => transformKeys(value, toCamelCase) as T;

export const keysToSnakeCase = <T>(value: unknown) => transformKeys(value, toSnakeCase) as T;

// Rounds up, so a break doesn't read as over during its last second.
export const getBreakRemainingSeconds = (endsAt: string, currentTime: number) =>
  Math.max(Math.ceil((Date.parse(endsAt) - currentTime) / 1000), 0);

// shadcn generates `import { cn } from "@/utils"` (see components.json); re-export the package so it resolves.
export { cn } from "cn";
