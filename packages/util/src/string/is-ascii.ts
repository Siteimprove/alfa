const asciiLimit = String.fromCharCode(0x80);

export function isAscii(char: string | null): boolean {
  return char !== null && char < asciiLimit;
}
