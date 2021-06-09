import { Comparison } from "./comparison";

/**
 * @public
 */
export type Comparer<T, A extends Array<unknown> = []> = (
  a: T,
  b: T,
  ...args: A
) => Comparison;
