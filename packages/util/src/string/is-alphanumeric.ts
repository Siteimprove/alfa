import { isAlpha } from "./is-alpha";
import { isNumeric } from "./is-numeric";

export function isAlphanumeric(char: string | null): boolean {
  return isAlpha(char) || isNumeric(char);
}
