import type { Functor } from "@siteimprove/alfa-functor";
import type { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type * as json from "@siteimprove/alfa-json";

import * as boundValue from "./bound.js";
import * as discreteValue from "./discrete.js";
import * as rangeValue from "./range.js";

/**
 * @public
 */
export interface Value<T = unknown>
  extends Functor<T>,
    Serializable<Value.JSON> {
  map<U>(mapper: Mapper<T, U>): Value<U>;
  matches(value: T): boolean;
  hasValue<U extends T>(refinement: Refinement<T, U>): this is Value<U>;
  toJSON(): Value.JSON;
}

/**
 * @public
 */
export namespace Value {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export import Bound = boundValue.Bound;
  export import Discrete = discreteValue.Discrete;
  export import Range = rangeValue.Range;

  export const { of: discrete, isDiscrete } = Discrete;

  export const {
    of: range,
    minimum: minimumRange,
    maximum: maximumRange,
    isRange,
  } = Range;

  export const { of: bound } = Bound;
}
