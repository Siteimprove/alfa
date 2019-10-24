import { Mapper } from "@siteimprove/alfa-mapper";

export interface Functor<T> {
  map<U>(mapper: Mapper<T, U>): Functor<U>;
}
