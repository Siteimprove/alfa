import {
  Angle,
  Length,
  Number,
  Percentage,
  String,
  Token,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";
import { None, Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Media } from "../media";
import { Resolver } from "../resolver";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

const { isLength } = Length;

const { delimited, either, map, mapResult, option, pair, right } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-feature
 */
export class Feature<
  N extends string = string,
  T extends Feature.Value = Feature.Value
> implements Media.Queryable {
  public static of<
    N extends string = string,
    T extends Feature.Value = Feature.Value
  >(name: N, value: Option<T> = None): Feature<N, T> {
    return new Feature(name, value);
  }

  protected readonly _name: N;
  protected readonly _value: Option<T>;

  protected constructor(name: N, value: Option<T>) {
    this._name = name;
    this._value = value;
  }

  public get name(): N {
    return this._name;
  }

  public get value(): Option<T> {
    return this._value;
  }

  public get type(): "feature" {
    return "feature";
  }

  public matches(device: Device): boolean {
    switch (this._name) {
      case "scripting":
        return device.scripting.enabled
          ? this._value.every(
              (value) => value.type === "string" && value.value === "enabled"
            )
          : this._value.some(
              (value) => value.type === "string" && value.value === "none"
            );

      case "max-width":
        return this._value.some(
          (value) =>
            isLength(value) &&
            device.viewport.width <= Resolver.length(value, device).value
        );

      case "min-width":
        return this._value.some(
          (value) =>
            isLength(value) &&
            device.viewport.width >= Resolver.length(value, device).value
        );

      case "max-height":
        return this._value.some(
          (value) =>
            isLength(value) &&
            device.viewport.height <= Resolver.length(value, device).value
        );

      case "min-height":
        return this._value.some(
          (value) =>
            isLength(value) &&
            device.viewport.height >= Resolver.length(value, device).value
        );
    }

    return false;
  }

  public equals(value: Feature): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Feature &&
      value._name === this._name &&
      value._value.equals(this._value)
    );
  }

  public hash(hash: Hash) {
    Hash.writeString(hash, this._name);
    this._value.hash(hash);
  }

  public toJSON(): Feature.JSON {
    return {
      type: "feature",
      name: this._name,
      value: this._value.map((value) => value.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this._name}${this._value.map((value) => `: ${value}`).getOr("")}`;
  }
}

import { Orientation } from "./orientation";

export namespace Feature {
  export interface JSON {
    [key: string]: json.JSON;
    type: "feature";
    name: string;
    value: Value.JSON | null;
  }

  export type Value = Number | String | Length | Angle | Percentage;

  export namespace Value {
    export type JSON =
      | Number.JSON
      | String.JSON
      | Length.JSON
      | Angle.JSON
      | Percentage.JSON;
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
  }
  export const { fromValue: orientation, isOrientation } = Orientation;

  export function from(
    name: string,
    value: Option<Feature.Value>
  ): Result<Feature, string> {
    switch (name) {
      case "orientation":
        return orientation(value);
      default:
        return Err.of("Unknown feature");
    }
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-name
   */
  const parseName = map(Token.parseIdent(), (ident) =>
    ident.value.toLowerCase()
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-value
   */
  const parseValue = either(
    either(
      map(Token.parseNumber(), (number) => Number.of(number.value)),
      map(Token.parseIdent(), (ident) => String.of(ident.value.toLowerCase()))
    ),
    either(
      map(
        pair(
          Token.parseNumber((number) => number.isInteger),
          right(
            delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
            Token.parseNumber((number) => number.isInteger)
          )
        ),
        (result) => {
          const [left, right] = result;

          return Percentage.of(left.value / right.value);
        }
      ),
      Length.parse
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parsePlain: Parser<Slice<Token>, Feature, string> = mapResult(
    pair(
      parseName,
      right(
        delimited(option(Token.parseWhitespace), Token.parseColon),
        parseValue
      )
    ),
    (result) => {
      const [name, value] = result;

      return name === "orientation"
        ? from(name, Option.of(value))
        : (Ok.of(Feature.of(name, Option.of(value))) as Result<
            Feature,
            string
          >);
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseBoolean = map(parseName, (name) =>
    Feature.of<string, never>(name)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  export const parse = delimited(
    Token.parseOpenParenthesis,
    delimited(option(Token.parseWhitespace), either(parsePlain, parseBoolean)),
    Token.parseCloseParenthesis
  );
}
