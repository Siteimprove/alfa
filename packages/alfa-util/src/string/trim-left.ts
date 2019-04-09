export function trimLeft(
  input: string,
  predicate: (code: number) => boolean
): string {
  let l = 0;
  const r = input.length;

  while (l < r && predicate(input.charCodeAt(l))) {
    l++;
  }

  return input.substring(l, r);
}
