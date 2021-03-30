import { Callback } from "@siteimprove/alfa-callback";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export type Continuation<T, R = void, A extends Array<unknown> = []> = Callback<
  Callback<T, R>,
  R,
  A
>;

/**
 * @public
 */
export namespace Continuation {
  export function of<T, R = void, A extends Array<unknown> = []>(
    value: T
  ): Continuation<T, R, A> {
    return (callback, ..._) => callback(value);
  }

  export function map<T, U, R = void, A extends Array<unknown> = []>(
    continuation: Continuation<T, R, A>,
    mapper: Mapper<T, U>
  ): Continuation<U, R, A> {
    return (callback, ...args) =>
      continuation(
        (value, ...args) => callback(mapper(value), ...args),
        ...args
      );
  }

  export function flatMap<T, U, R = void, A extends Array<unknown> = []>(
    continuation: Continuation<T, R, A>,
    mapper: Mapper<T, Continuation<U, R, A>>
  ): Continuation<U, R, A> {
    return (callback, ...args) =>
      continuation((value) => mapper(value)(callback, ...args), ...args);
  }
}
