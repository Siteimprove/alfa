const asciiLimit = String.fromCharCode(0x80);

export function isAscii(char: string): boolean {
  return char < asciiLimit;
}
