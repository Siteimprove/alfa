import { Char } from "./char";
import { isBetween } from "./is-between";

export function isNumeric(char: number): boolean {
  return isBetween(char, Char.DigitZero, Char.DigitNine);
}
