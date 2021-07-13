import { Applicative } from "@siteimprove/alfa-applicative";
import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Monad<T> extends Applicative<T> {
  flatMap<U>(mapper: Mapper<T, Monad<U>>): Monad<U>;
}
