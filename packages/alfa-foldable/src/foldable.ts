import { Reducer } from "@siteimprove/alfa-reducer";

/**
 * @public
 */
export interface Foldable<T> {
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
}
