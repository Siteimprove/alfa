export function find<T, U extends T = T>(
  array: ArrayLike<T>,
  predicate:
    | ((element: T, index: number) => boolean)
    | ((element: T, index: number) => element is U)
): U | null {
  for (let i = 0, n = array.length; i < n; i++) {
    const element = array[i];

    if (predicate(element, i)) {
      return element;
    }
  }

  return null;
}
