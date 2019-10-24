export namespace Generator {
  export function* map<T, U, R, N>(
    generator: Generator<T, R, N>,
    mapper: (value: T) => U
  ): Generator<U, R, N> {
    let next = generator.next();

    while (next.done !== true) {
      yield mapper(next.value);
      next = generator.next();
    }

    return next.value;
  }

  export function* flatMap<T, U, R, N>(
    generator: Generator<T, R, N>,
    mapper: (value: T) => Generator<U, R, N>
  ): Generator<U, R, N> {
    let next = generator.next();

    while (next.done !== true) {
      yield* mapper(next.value);
      next = generator.next();
    }

    return next.value;
  }
}
