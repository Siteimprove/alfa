import { Char } from "./char";
import { isBetween } from "./is-between";

export function isAlpha(char: number): boolean {
  return isBetween(char, Char.a, Char.z) || isBetween(char, Char.A, Char.Z);
}
