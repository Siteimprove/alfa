import { isBetween } from "./is-between";

export function isNumeric(char: string | null): boolean {
  return isBetween(char, "0", "9");
}
