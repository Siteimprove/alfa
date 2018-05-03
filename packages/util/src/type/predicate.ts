export type Predicate<T, U extends T> =
  | ((n: T) => boolean)
  | ((n: T) => n is U);
