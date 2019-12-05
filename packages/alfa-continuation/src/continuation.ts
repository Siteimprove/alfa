import { Callback } from "@siteimprove/alfa-callback";
import { Mapper } from "@siteimprove/alfa-mapper";

export type Continuation<T, R = void> = Callback<Callback<T, R>, R>;

export namespace Continuation {
  export function of<T, R = void>(value: T): Continuation<T, R> {
    return callback => callback(value);
  }

  export function map<T, U, R = void>(
    continuation: Continuation<T, R>,
    mapper: Mapper<T, U>
  ): Continuation<U, R> {
    return callback => continuation(value => callback(mapper(value)));
  }

  export function flatMap<T, U, R = void>(
    continuation: Continuation<T, R>,
    mapper: Mapper<T, Continuation<U, R>>
  ): Continuation<U, R> {
    return callback => continuation(value => mapper(value)(callback));
  }
}
