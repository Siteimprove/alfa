import { Reducer } from "@siteimprove/alfa-reducer";

export interface Foldable<T> {
  reduce<U>(reducer: Reducer<T, U>, accumulator: U): U;
}
