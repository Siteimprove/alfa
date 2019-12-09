import { Mapper } from "@siteimprove/alfa-mapper";
import { Reducer } from "@siteimprove/alfa-reducer";

export type Thunk<T> = () => T;

export namespace Thunk {
  export function of<T>(value: T): Thunk<T> {
    return () => value;
  }

  export function map<T, U>(thunk: Thunk<T>, mapper: Mapper<T, U>): Thunk<U> {
    return () => mapper(thunk());
  }

  export function flatMap<T, U>(
    thunk: Thunk<T>,
    mapper: Mapper<T, Thunk<U>>
  ): Thunk<U> {
    return mapper(thunk());
  }

  export function reduce<T, U>(
    thunk: Thunk<T>,
    reducer: Reducer<T, U>,
    accumulator: U
  ): U {
    return reducer(accumulator, thunk());
  }
}
