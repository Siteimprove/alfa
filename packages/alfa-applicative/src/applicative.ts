import type { Functor } from "@siteimprove/alfa-functor";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Applicative<T> extends Functor<T> {
  map<U>(mapper: Mapper<T, U>): Applicative<U>;
  apply<U>(mapper: Applicative<Mapper<T, U>>): Applicative<U>;
}
