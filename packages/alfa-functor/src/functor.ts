import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Functor<T> {
  map<U>(mapper: Mapper<T, U>): Functor<U>;
}

/**
 * @public
 */
export namespace Functor {
  export interface Invariant<T> {
    contraMap<U>(mapper: Mapper<U, T>): Invariant<U>;
  }
}
