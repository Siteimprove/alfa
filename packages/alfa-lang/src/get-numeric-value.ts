import { Char } from "./char";
import { isBetween } from "./is-between";
import { isNumeric } from "./is-numeric";

export function getNumericValue(char: number): number | null {
  if (isNumeric(char)) {
    return char - Char.DigitZero;
  }

  if (isBetween(char, Char.SmallLetterA, Char.SmallLetterF)) {
    return char - Char.SmallLetterA + 10;
  }

  if (isBetween(char, Char.CapitalLetterA, Char.CapitalLetterF)) {
    return char - Char.CapitalLetterA + 10;
  }

  return null;
}
