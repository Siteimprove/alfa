export type Option<T> = T | null;

export function some<T, U>(
  option: Option<T>,
  some: (value: T) => U | null
): Option<U> {
  return option !== null ? some(option) : null;
}

export function none<T, U>(
  option: Option<T>,
  none: () => U | null
): Option<T | U> {
  return option === null ? none() : option;
}

export function option<T, U>(
  option: Option<T>,
  some: (value: T) => U | null,
  none: () => U | null
): Option<T | U> {
  return option === null ? none() : some(option);
}
