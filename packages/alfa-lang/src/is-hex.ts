import { Char } from "./char";
import { isNumeric } from "./is-numeric";
import { isBetween } from "./is-between";

export function isHex(char: number): boolean {
  return (
    isNumeric(char) ||
    isBetween(char, Char.SmallLetterA, Char.SmallLetterF) ||
    isBetween(char, Char.CapitalLetterA, Char.CapitalLetterF)
  );
}
