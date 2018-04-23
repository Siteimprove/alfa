/**
 * Create an array of values returned from invocations of an iteratee on each
 * element of an array.
 */
export function map<T, U>(
  array: ArrayLike<T>,
  iteratee: (element: T, index: number) => U
): Array<U> {
  const mapped: Array<U> = new Array(length);

  for (let i = 0, n = array.length; i < n; i++) {
    mapped[i] = iteratee(array[i], i);
  }

  return mapped;
}
