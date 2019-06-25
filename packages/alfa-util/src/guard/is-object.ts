export function isObject(input: unknown): input is object {
  return typeof input === "object";
}
