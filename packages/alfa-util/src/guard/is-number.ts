export function isNumber(input: unknown): input is number {
  return typeof input === "number";
}
