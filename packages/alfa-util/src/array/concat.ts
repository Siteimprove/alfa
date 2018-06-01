export function concat<T>(...arrays: Array<ArrayLike<T>>): Array<T> {
  let total = 0;

  for (let i = 0, n = arrays.length; i < n; i++) {
    total += arrays[i].length;
  }

  const result: Array<T> = new Array(total);

  for (let i = 0, p = 0, n = arrays.length; i < n; i++) {
    const array = arrays[i];

    for (let j = 0, m = array.length; j < m; j++) {
      result[p++] = array[j];
    }
  }

  return result;
}
