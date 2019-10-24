import { Mapper } from "@siteimprove/alfa-mapper";

export interface Monad<T> {
  flatMap<U>(mapper: Mapper<T, Monad<U>>): Monad<U>;
}
