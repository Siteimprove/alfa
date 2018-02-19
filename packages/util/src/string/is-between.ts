export function isBetween(
  char: string | null,
  lower: string,
  upper: string
): boolean {
  return char !== null && char >= lower && char <= upper;
}
