export function last<T>(array: ArrayLike<T>): T | null {
  return array.length === 0 ? null : array[array.length - 1];
}
