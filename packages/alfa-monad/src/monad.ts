import type { Applicative } from "@siteimprove/alfa-applicative";
import type { Functor } from "@siteimprove/alfa-functor";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Monad<T> extends Functor<T>, Applicative<T> {
  map<U>(mapper: Mapper<T, U>): Monad<U>;
  apply<U>(mapper: Monad<Mapper<T, U>>): Monad<U>;
  flatMap<U>(mapper: Mapper<T, Monad<U>>): Monad<U>;
  flatten<T>(this: Monad<Monad<T>>): Monad<T>;
}
