import { Comparable } from "@siteimprove/alfa-comparable";
import {
  Length,
  Number,
  Percentage,
  String,
  Token,
} from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

const { delimited, either, map, option, separatedPair } = Parser;

export interface Value<T = unknown>
  extends Functor<T>,
    Serializable<Value.JSON> {
  map<U>(mapper: Mapper<T, U>): Value<U>;
  matches(value: T): boolean;
  toJSON(): Value.JSON;
}

export namespace Value {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export class Discrete<T> implements Value<T>, Serializable<Discrete.JSON<T>> {
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
  }

  export const { of: discrete } = Discrete;

  export class Range<T> implements Value<T>, Serializable<Range.JSON<T>> {
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
        this._maximum.map((bound) => bound.map(mapper))
      );
    }

    public matches(value: T): boolean {
      if (!Comparable.isComparable<T>(value)) {
        return false;
      }

      for (const minimum of this._minimum) {
        if (minimum.isInclusive) {
          if (value.compare(minimum.value) <= 0) {
            return false;
          }
        } else {
          if (value.compare(minimum.value) < 0) {
            return false;
          }
        }
      }

      for (const maximum of this._maximum) {
        if (maximum.isInclusive) {
          if (value.compare(maximum.value) >= 0) {
            return false;
          }
        } else {
          if (value.compare(maximum.value) > 0) {
            return false;
          }
        }
      }

      return true;
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
  }

  export const {
    of: range,
    minimum: minimumRange,
    maximum: maximumRange,
  } = Range;

  export class Bound<T> implements Functor<T>, Serializable<Bound.JSON<T>> {
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

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-value
   */
  export const parse = either(
    either(
      map(Token.parseNumber(), (number) => Number.of(number.value)),
      map(Token.parseIdent(), (ident) => String.of(ident.value.toLowerCase()))
    ),
    either(
      map(
        separatedPair(
          Token.parseNumber((number) => number.isInteger),
          delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
          Token.parseNumber((number) => number.isInteger)
        ),
        ([left, right]) => Percentage.of(left.value / right.value)
      ),
      Length.parse
    )
  );
}
