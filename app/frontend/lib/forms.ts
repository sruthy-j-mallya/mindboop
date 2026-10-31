import type { FormEvent } from "react";

export function formValues<K extends string>(event: FormEvent<HTMLFormElement>, ...keys: K[]) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  return Object.fromEntries(keys.map((key) => [key, String(data.get(key) ?? "")])) as Record<K, string>;
}
