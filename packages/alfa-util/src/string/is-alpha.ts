import { isBetween } from "./is-between";

export function isAlpha(char: string): boolean {
  return isBetween(char, "a", "z") || isBetween(char, "A", "Z");
}
