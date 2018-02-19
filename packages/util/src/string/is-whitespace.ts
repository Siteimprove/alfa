import { isNewline } from "./is-newline";

export function isWhitespace(char: string | null): boolean {
  return char === " " || char === "\t" || isNewline(char);
}
