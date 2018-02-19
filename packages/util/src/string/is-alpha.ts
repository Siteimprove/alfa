import { isBetween } from "./is-between";

export function isAlpha(char: string | null): boolean {
  return isBetween(char, "a", "z") || isBetween(char, "A", "Z");
}
