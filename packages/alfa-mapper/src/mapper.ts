export type Mapper<T, U = T, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => U;
