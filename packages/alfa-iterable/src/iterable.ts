export namespace Iterable {
  export function* map<T, U>(
    iterable: Iterable<T>,
    mapper: (value: T) => U
  ): Iterable<U> {
    for (const value of iterable) {
      yield mapper(value);
    }
  }

  export function* flatMap<T, U>(
    iterable: Iterable<T>,
    mapper: (value: T) => Iterable<U>
  ): Iterable<U> {
    for (const value of iterable) {
      yield* mapper(value);
    }
  }

  export function isIterable<T>(value: unknown): value is Iterable<T> {
    return (
      typeof value === "object" && value !== null && Symbol.iterator in value
    );
  }
}
