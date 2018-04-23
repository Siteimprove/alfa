export function each<T>(
  array: ArrayLike<T>,
  iteratee: (element: T, index: number) => void | false
): void {
  for (let i = 0, n = array.length; i < n; i++) {
    if (iteratee(array[i], i) === false) {
      break;
    }
  }
}
