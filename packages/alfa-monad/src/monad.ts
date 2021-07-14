import { Applicative } from "@siteimprove/alfa-applicative";
import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Monad<T> extends Functor<T>, Applicative<T> {
  map<U>(mapper: Mapper<T, U>): Monad<U>;
  apply<U>(mapper: Monad<Mapper<T, U>>): Monad<U>;
  flatMap<U>(mapper: Mapper<T, Monad<U>>): Monad<U>;
  flatten<T>(this: Monad<Monad<T>>): Monad<T>;
}
