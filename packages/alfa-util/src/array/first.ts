export function first<T>(array: ArrayLike<T>): T | null {
  return array.length === 0 ? null : array[0];
}
