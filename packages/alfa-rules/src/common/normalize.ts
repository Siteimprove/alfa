export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}
