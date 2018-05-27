export function union<T>(...arrays: Array<ArrayLike<T>>): Array<T> {
  const result: Array<T> = new Array();

  for (let i = 0, n = arrays.length; i < n; i++) {
    const array = arrays[i];

    for (let j = 0, m = array.length; j < m; j++) {
      const value = array[j];

      if (result.indexOf(value) === -1) {
        result.push(value);
      }
    }
  }

  return result;
}
