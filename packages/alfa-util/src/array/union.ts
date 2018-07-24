export function union<T>(...arrays: Array<ArrayLike<T>>): Set<T> {
  const result: Set<T> = new Set();

  for (let i = 0, n = arrays.length; i < n; i++) {
    const array = arrays[i];

    for (let j = 0, m = array.length; j < m; j++) {
      result.add(array[j]);
    }
  }

  return result;
}
