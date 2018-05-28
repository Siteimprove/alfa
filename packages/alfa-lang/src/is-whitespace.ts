import { Char } from "./char";
import { isNewline } from "./is-newline";

export function isWhitespace(char: number): boolean {
  return (
    char === Char.Space || char === Char.CharacterTabulation || isNewline(char)
  );
}
