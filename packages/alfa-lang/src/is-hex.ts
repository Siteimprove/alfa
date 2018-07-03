import { Char } from "./char";
import { isBetween } from "./is-between";
import { isNumeric } from "./is-numeric";

export function isHex(char: number): boolean {
  return (
    isNumeric(char) ||
    isBetween(char, Char.SmallLetterA, Char.SmallLetterF) ||
    isBetween(char, Char.CapitalLetterA, Char.CapitalLetterF)
  );
}
