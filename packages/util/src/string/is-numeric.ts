import { isBetween } from "./is-between";

export function isNumeric(char: string): boolean {
  return isBetween(char, "0", "9");
}
