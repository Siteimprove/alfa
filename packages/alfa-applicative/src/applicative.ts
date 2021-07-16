import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Applicative<T> {
  apply<U>(mapper: Applicative<Mapper<T, U>>): Applicative<U>;
}
