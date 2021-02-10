import { Mapper } from "@siteimprove/alfa-mapper";

export type Callback<T, R = void, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => R;

export namespace Callback {
  export function contraMap<T, R, U, A extends Array<unknown> = []>(
    callback: Callback<T, R, A>,
    mapper: Mapper<U, T>
  ): Callback<U, R, A> {
    return (value, ...args) => callback(mapper(value), ...args);
  }
}
