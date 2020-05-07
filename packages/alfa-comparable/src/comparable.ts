import { Comparison } from "./comparison";

export interface Comparable<T> {
  /**
   * @remarks
   * Comparisons are limited to the range [-1, 1] in order to avoid the
   * potential of over-/underflows when comparisons are implemented naively
   * using subtractions, such `a - b`; this would not be allowed.
   */
  compare(value: T): Comparison;
}

export namespace Comparable {
  export function compare<T extends Comparable<U>, U>(a: T, b: U): Comparison {
    return a.compare(b);
  }
}
