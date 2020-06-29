export type Reducer<T, U = T, A extends Array<unknown> = []> = (
  accumulator: U,
  value: T,
  ...args: A
) => U;

export namespace Reducer {
  export function append<T>(): Reducer<T, Iterable<T>> {
    return (accumulator, value) => [...accumulator, value];
  }

  export function concat<T>(): Reducer<Iterable<T>, Iterable<T>> {
    return (accumulator, value) => [...accumulator, ...value];
  }
}
