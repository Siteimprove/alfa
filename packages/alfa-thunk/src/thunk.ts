import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Reducer } from "@siteimprove/alfa-reducer";

/**
 * @public
 */
export type Thunk<T = void> = () => T;

/**
 * @public
 */
export namespace Thunk {
  export function of<T>(value: T): Thunk<T> {
    return () => value;
  }

  export function map<T, U>(thunk: Thunk<T>, mapper: Mapper<T, U>): Thunk<U> {
    return () => mapper(thunk());
  }

  export function flatMap<T, U>(
    thunk: Thunk<T>,
    mapper: Mapper<T, Thunk<U>>,
  ): Thunk<U> {
    return () => mapper(thunk())();
  }

  export function reduce<T, U>(
    thunk: Thunk<T>,
    reducer: Reducer<T, U>,
    accumulator: U,
  ): U {
    return reducer(accumulator, thunk());
  }

  /**
   * Freezes a Thunk into one that will always produce the same value,
   * even if the original one depends on mutable state.
   *
   * @remarks
   * While this may be desirable in contexts where immutability is required,
   * it can also break badly Thunks that rely on side effect to maintain an
   * internal state.
   *
   * Frozen thanks store their result internally, thus consuming memory. At the
   * same time, they ensure that repeated calls are fast. Because the result are
   * stored internally, they will be destroyed at the same time the thunk is.
   */
  export function freeze<T>(thunk: Thunk<T>): Thunk<T> {
    let state:
      | { value: undefined; frozen: false }
      | { value: T; frozen: true } = {
      value: undefined,
      frozen: false,
    };

    return () => {
      if (!state.frozen) {
        state = { value: thunk(), frozen: true };
      }

      return state.value;
    };
  }
}
