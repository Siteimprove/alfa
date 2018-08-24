export type Option<T> = T | null;

export function some<T, U>(
  option: Option<T>,
  iteratee: (value: T) => U | null
): Option<U> {
  if (option !== null) {
    return iteratee(option);
  }

  return null;
}

export function none<T, U>(
  option: Option<T>,
  iteratee: () => U | null
): Option<T | U> {
  if (option === null) {
    return iteratee();
  }

  return option;
}
