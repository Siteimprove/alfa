import { isNumeric } from "./is-numeric";
import { isBetween } from "./is-between";

export function isHex(char: string): boolean {
  return (
    isNumeric(char) || isBetween(char, "a", "f") || isBetween(char, "A", "F")
  );
}
