export function slice<T>(
  array: ArrayLike<T>,
  start: number = 0,
  end: number = array.length
): Array<T> {
  let { length } = array;

  if (end > length) {
    end = length;
  }

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }

  if (end < 0) {
    end += length;
  }

  length = start > end ? 0 : end - start;

  const result: Array<T> = new Array(length);

  for (let i = 0, j = start, n = length; i < n; i++, j++) {
    result[i] = array[j];
  }

  return result;
}
