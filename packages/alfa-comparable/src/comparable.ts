export enum Comparison {
  Less = -1,
  Equal,
  More
}

export interface Comparable<T> {
  /**
   * @remarks
   * Comparisons are limited to the range [-1, 1] in order to avoid the
   * potential of over-/underflows when comparisons are implemented naïvely
   * using subtractions, such `a - b`; this would not be allowed.
   */
  compare(value: T): Comparison;
}

/**
 * Ready made generic function to use with Array.sort
 */
export function compare<T, U extends Comparable<T>>(a: U, b: T): Comparison {
  return a.compare(b);
}
