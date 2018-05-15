export type Predicate<T, U extends T = T> =
  | ((n: T) => boolean)
  | ((n: T) => n is U);
