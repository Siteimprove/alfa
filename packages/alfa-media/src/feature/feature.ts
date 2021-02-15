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
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Media } from "../media";
import { Resolver } from "../resolver";

const { isLength } = Length;

const { delimited, either, map, mapResult, option, pair, right } = Parser;

const { isString } = String;

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
      // case "orientation":
      //   return this._value.some(
      //     (value) =>
      //       value.type === "string" &&
      //       value.value === device.viewport.orientation
      //   );

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

  type Features = {
    orientation: [Orientation.Value, Orientation];
  };

  export function from<K extends keyof Features>(
    name: K,
    value: Option<Features[K][0]>
  ): Result<Features[K][1], string>;

  export function from(name: string, value: Option<Value>): Err<string>;

  export function from(
    name: string,
    value: Option<Value>
  ): Result<Feature, string> {
    switch (name) {
      case "orientation":
        return value.every(Orientation.validate)
          ? Ok.of(Orientation.myof(value))
          : Err.of("Orientation must be landscape or portrait");
      default:
        return Err.of("Unknown feature");
    }
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
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
        ? Feature.from(name, Option.of(value))
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

class Orientation extends Feature<"orientation", Orientation.Value> {
  public static myof(value: Option<Orientation.Value>): Orientation {
    return new Orientation(value);
  }

  private constructor(value: Option<Orientation.Value>) {
    super("orientation", value);
  }

  public static validate(value: Feature.Value): value is Orientation.Value {
    return (
      isString(value) &&
      (value.value === "landscape" || value.value === "portrait")
    );
  }

  public matches(device: Device): boolean {
    return this._value.every(
      (value) => value.value === device.viewport.orientation
    );
  }
}

namespace Orientation {
  export type Value = String<"landscape"> | String<"portrait">;

  export function isOrientation(value: unknown): value is Orientation {
    return value instanceof Orientation;
  }
}
