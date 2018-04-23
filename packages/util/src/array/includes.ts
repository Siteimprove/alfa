/**
 * Check if an array includes a specific element.
 */
export function includes<T>(
  array: ArrayLike<T>,
  query: T,
  position: number = 0
): boolean {
  const { length } = array;

  if (length === 0) {
    return false;
  }

  let start: number;

  if (position >= 0) {
    start = position;
  } else {
    start = position + length;

    if (start < 0) {
      start = 0;
    }
  }

  const isNaN = query !== query;

  for (let i = start; i < length; i++) {
    const element = array[i];

    if (element === query || (element !== element && isNaN)) {
      return true;
    }
  }

  return false;
}
