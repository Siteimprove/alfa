import { isAlpha } from "./is-alpha";
import { isNumeric } from "./is-numeric";

export function isAlphanumeric(char: string): boolean {
  return isAlpha(char) || isNumeric(char);
}
