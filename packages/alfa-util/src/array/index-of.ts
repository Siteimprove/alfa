export function indexOf<T>(
  array: ArrayLike<T>,
  query: T,
  start: number = 0
): number {
  for (let i = start, n = array.length; i < n; i++) {
    if (array[i] === query) {
      return i;
    }
  }

  return -1;
}
