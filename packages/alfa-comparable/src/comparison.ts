/**
 * @remarks
 * Comparisons are limited to the range [-1, 1] in order to avoid the potential
 * of over-/underflows when comparisons are implemented naively using
 * subtractions, such `a - b`; this would not be allowed.
 */
export enum Comparison {
  Less = -1,
  Equal = 0,
  Greater = 1,
}
