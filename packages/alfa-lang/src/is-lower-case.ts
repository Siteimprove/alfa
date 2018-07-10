import { Char } from "./char";
import { isBetween } from "./is-between";

export function isLowerCase(char: number): boolean {
  return isBetween(char, Char.SmallLetterA, Char.SmallLetterZ);
}
