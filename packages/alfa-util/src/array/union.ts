export function union<T>(...arrays: Array<ArrayLike<T>>): Array<T> {
  const result: Array<T> = new Array();

  // Use a set for keeping track of the values that have already been seen. Even
  // though it's possible to iterate through sets in insertion order and as such
  // avoid also allocating the above array and instead using the expanded set as
  // the result, doing so would require us to actually iterate through the set.
  // We really don't want to do that as array iteration is way faster in most
  // JavaScript engines.
  const seen: Set<T> = new Set();

  for (let i = 0, n = arrays.length; i < n; i++) {
    const array = arrays[i];

    for (let j = 0, m = array.length; j < m; j++) {
      const value = array[j];

      if (!seen.has(value)) {
        result.push(value);
        seen.add(value);
      }
    }
  }

  return result;
}
