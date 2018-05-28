import { isBetween } from "./is-between";

export function isNumeric(char: number): boolean {
  return isBetween(char, 0, 9);
}
