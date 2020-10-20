import { Comparison } from "./comparison";

export type Comparer<T, A extends Array<unknown> = []> = (
  a: T,
  b: T,
  ...args: A
) => Comparison;
