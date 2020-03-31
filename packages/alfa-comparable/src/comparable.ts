export enum Comparison {
  Smaller = -1,
  Equal,
  Greater
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
