import { Mapper } from "@siteimprove/alfa-mapper";
import { Reducer } from "@siteimprove/alfa-reducer";

export namespace Generator {
  export function* map<T, U, R, N>(
    generator: Generator<T, R, N>,
    mapper: Mapper<T, U>
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
    mapper: Mapper<T, Generator<U, R, N>>
  ): Generator<U, R, N> {
    let next = generator.next();

    while (next.done !== true) {
      yield* mapper(next.value);
      next = generator.next();
    }

    return next.value;
  }

  export function reduce<T, U, R, N>(
    generator: Generator<T, R, N>,
    reducer: Reducer<T, U>,
    accumulator: U
  ): U {
    let next = generator.next();

    while (next.done !== true) {
      accumulator = reducer(accumulator, next.value);
      next = generator.next();
    }

    return accumulator;
  }
}
