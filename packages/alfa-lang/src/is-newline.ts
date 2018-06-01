import { Char } from "./char";

export function isNewline(char: number): boolean {
  return (
    char === Char.LineFeed ||
    char === Char.CarriageReturn ||
    char === Char.FormFeed
  );
}
