import { Comparable } from "@siteimprove/alfa-comparable";
import { Length, Number } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

export interface Value<T = unknown>
  extends Functor<T>,
    Serializable<Value.JSON> {
  map<U>(mapper: Mapper<T, U>): Value<U>;
  matches(value: T): boolean;
  hasValue<U extends T>(refinement: Refinement<T, U>): this is Value<U>;
  toJSON(): Value.JSON;
}

export namespace Value {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export class Discrete<T = unknown>
    implements Value<T>, Serializable<Discrete.JSON<T>>
  {
    public static of<T>(value: T): Discrete<T> {
      return new Discrete(value);
    }

    private readonly _value: T;

    private constructor(value: T) {
      this._value = value;
    }

    public get value(): T {
      return this._value;
    }

    public map<U>(mapper: Mapper<T, U>): Discrete<U> {
      return new Discrete(mapper(this._value));
    }

    public matches(value: T): boolean {
      return Equatable.equals(this._value, value);
    }

    public hasValue<U extends T>(
      refinement: Refinement<T, U>,
    ): this is Discrete<U> {
      return refinement(this._value);
    }

    public toJSON(): Discrete.JSON<T> {
      return {
        type: "discrete",
        value: Serializable.toJSON(this._value),
      };
    }
  }

  export namespace Discrete {
    export interface JSON<T> {
      [key: string]: json.JSON;
      type: "discrete";
      value: Serializable.ToJSON<T>;
    }

    export function isDiscrete<T>(value: unknown): value is Discrete<T> {
      return value instanceof Discrete;
    }
  }

  export const { of: discrete, isDiscrete } = Discrete;

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

  export const {
    of: range,
    minimum: minimumRange,
    maximum: maximumRange,
    isRange,
  } = Range;

  export class Bound<T = unknown>
    implements Functor<T>, Serializable<Bound.JSON<T>>
  {
    public static of<T>(value: T, isInclusive: boolean): Bound<T> {
      return new Bound(value, isInclusive);
    }

    private readonly _value: T;
    private readonly _isInclusive: boolean;

    private constructor(value: T, isInclusive: boolean) {
      this._value = value;
      this._isInclusive = isInclusive;
    }

    public get value(): T {
      return this._value;
    }

    public get isInclusive(): boolean {
      return this._isInclusive;
    }

    public map<U>(mapper: Mapper<T, U>): Bound<U> {
      return new Bound(mapper(this._value), this._isInclusive);
    }

    public hasValue<U extends T>(
      refinement: Refinement<T, U>,
    ): this is Bound<U> {
      return refinement(this._value);
    }

    public toJSON(): Bound.JSON<T> {
      return {
        value: Serializable.toJSON(this._value),
        isInclusive: this._isInclusive,
      };
    }
  }

  export namespace Bound {
    export interface JSON<T> {
      [key: string]: json.JSON;
      value: Serializable.ToJSON<T>;
      isInclusive: boolean;
    }
  }

  export const { of: bound } = Bound;
}
