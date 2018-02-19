export function isNewline(char: string | null): boolean {
  return char === "\n" || char === "\r" || char === "\f";
}
