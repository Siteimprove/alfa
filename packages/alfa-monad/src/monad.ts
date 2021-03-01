import { Mapper } from "@siteimprove/alfa-mapper";

/**
 * @public
 */
export interface Monad<T> {
  flatMap<U>(mapper: Mapper<T, Monad<U>>): Monad<U>;
}
