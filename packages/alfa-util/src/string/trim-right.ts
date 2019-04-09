export function trimRight(
  input: string,
  predicate: (code: number) => boolean
): string {
  const l = 0;
  let r = input.length;

  while (r > l && predicate(input.charCodeAt(r - 1))) {
    r--;
  }

  return input.substring(l, r);
}
