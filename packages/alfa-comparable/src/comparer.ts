import { Comparison } from "./comparison";

/**
 * @public
 */
export type Comparer<T, U = T, A extends Array<unknown> = []> = (
  a: T,
  b: U,
  ...args: A
) => Comparison;
