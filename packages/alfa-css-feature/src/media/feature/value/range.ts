import { Comparable } from "@siteimprove/alfa-comparable";
import { Length, Number } from "@siteimprove/alfa-css";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as json from "@siteimprove/alfa-json";

import { Bound } from "./bound.js";
import { Discrete } from "./discrete.js";
import type { Value } from "./value.js";

/**
 * A range, with an optional minimum and maximum bound, both of which may be
 * inclusive or exclusive.
 *
 * @public
 */
export class Range<T = unknown>
  implements Value<T>, Serializable<Range.JSON<T>>
{
  public static of<T>(minimum: Bound<T>, maximum: Bound<T>): Range<T> {
    return new Range(Option.of(minimum), Option.of(maximum));
  }

  public static minimum<T>(minimum: Bound<T>): Range<T> {
    return new Range(Option.of(minimum), None);
  }

  public static maximum<T>(maximum: Bound<T>): Range<T> {
    return new Range(None, Option.of(maximum));
  }

  private readonly _minimum: Option<Bound<T>>;
  private readonly _maximum: Option<Bound<T>>;

  private constructor(minimum: Option<Bound<T>>, maximum: Option<Bound<T>>) {
    this._minimum = minimum;
    this._maximum = maximum;
  }

  public get minimum(): Option<Bound<T>> {
    return this._minimum;
  }

  public get maximum(): Option<Bound<T>> {
    return this._maximum;
  }

  public map<U>(mapper: Mapper<T, U>): Range<U> {
    return new Range(
      this._minimum.map((bound) => bound.map(mapper)),
      this._maximum.map((bound) => bound.map(mapper)),
    );
  }

  public toLength(): Range<T | Length<"px">> {
    return this.map((bound) =>
      Refinement.and(
        Number.isNumber,
        (value) => !value.hasCalculation() && value.value === 0,
      )(bound)
        ? Length.of(0, "px")
        : bound,
    );
  }

  public matches(value: T): boolean {
    if (!Comparable.isComparable<T>(value)) {
      return false;
    }

    // Since we need to match both bounds, we return false if one is not
    // matched and keep true for the default return at the end.
    for (const minimum of this._minimum) {
      if (minimum.isInclusive) {
        // value is inclusively larger than the minimum if it is not
        // strictly smaller than it.
        if (value.compare(minimum.value) < 0) {
          return false;
        }
      } else {
        if (value.compare(minimum.value) <= 0) {
          return false;
        }
      }
    }

    for (const maximum of this._maximum) {
      if (maximum.isInclusive) {
        if (value.compare(maximum.value) > 0) {
          return false;
        }
      } else {
        if (value.compare(maximum.value) >= 0) {
          return false;
        }
      }
    }

    return true;
  }

  public hasValue<U extends T>(
    refinement: Refinement<T, U>,
  ): this is Discrete<U> {
    return (
      this._minimum.every((bound) => refinement(bound.value)) &&
      this._maximum.every((bound) => refinement(bound.value))
    );
  }

  public toJSON(): Range.JSON<T> {
    return {
      type: "range",
      minimum: this._minimum.map((bound) => bound.toJSON()).getOr(null),
      maximum: this._maximum.map((bound) => bound.toJSON()).getOr(null),
    };
  }
}

/**
 * @public
 */
export namespace Range {
  export interface JSON<T> {
    [key: string]: json.JSON;
    type: "range";
    minimum: Bound.JSON<T> | null;
    maximum: Bound.JSON<T> | null;
  }

  export function isRange<T>(value: unknown): value is Range<T> {
    return value instanceof Range;
  }
}
