export function hasKey<K extends string>(
  input: object,
  key: K
): input is { [P in K]: unknown } {
  return key in input;
}
