import { Char } from "./char";
import { isBetween } from "./is-between";

export function isAlpha(char: number): boolean {
  return (
    isBetween(char, Char.SmallLetterB, Char.SmallLetterZ) ||
    isBetween(char, Char.CapitalLetterA, Char.CapitalLetterZ)
  );
}
