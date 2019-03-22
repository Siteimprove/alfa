export function filter<T, U extends T = T>(
  array: ArrayLike<T>,
  predicate:
    | ((element: T, index: number) => boolean)
    | ((element: T, index: number) => element is U)
): Array<U> {
  const result: Array<U> = [];

  for (let i = 0, n = array.length; i < n; i++) {
    const element = array[i];

    if (predicate(element, i)) {
      result.push(element);
    }
  }

  return result;
}
