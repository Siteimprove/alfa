import { Comparison } from "./comparison.js";

/**
 * @public
 */
export type Comparer<T, U = T, A extends Array<unknown> = []> = (
  a: T,
  b: U,
  ...args: A
) => Comparison;

/**
 * Turns a tuple of types into a tuple of comparer over these types.
 *
 * @public
 */
export type TupleComparer<T extends Array<unknown>> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [Comparer<Head>, ...TupleComparer<Tail>]
  : [];
