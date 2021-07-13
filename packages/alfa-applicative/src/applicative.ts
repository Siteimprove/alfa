import { Functor } from "@siteimprove/alfa-functor";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Applicative<T> extends Functor<T> {
  apply<U>(mapper: Applicative<Mapper<T, U>>): Applicative<U>;
}
