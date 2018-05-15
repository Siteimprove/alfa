import { isNewline } from "./is-newline";

export function isWhitespace(char: string): boolean {
  return char === " " || char === "\t" || isNewline(char);
}
