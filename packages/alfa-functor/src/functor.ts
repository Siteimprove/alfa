import { Mapper } from "@siteimprove/alfa-mapper";

export interface Functor<T> {
  map<U>(mapper: Mapper<T, U>): Functor<U>;
}

export namespace Functor {
  export interface Invariant<T> {
    contraMap<U>(mapper: Mapper<U, T>): Invariant<U>;
  }
}
