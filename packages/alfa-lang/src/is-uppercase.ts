import { Char } from "./char";
import { isBetween } from "./is-between";

export function isUppercase(char: number): boolean {
  return isBetween(char, Char.CapitalLetterA, Char.CapitalLetterZ);
}
