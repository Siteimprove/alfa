import { Length, String, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Media } from "./media";
import { Resolver } from "./resolver";
import { Value } from "./value";
import { Slice } from "@siteimprove/alfa-slice";
import { Err, Result } from "@siteimprove/alfa-result";

const { delimited, either, map, mapResult, option, separatedPair } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-feature
 */
export abstract class Feature<N extends string = string, T = unknown>
  implements Media.Queryable<Feature.JSON> {
  protected readonly _value: Option<Value<T>>;

  protected constructor(value: Option<Value<T>>) {
    this._value = value;
  }

  public abstract get name(): N;

  public get value(): Option<Value<T>> {
    return this._value;
  }

  public get isKnown(): boolean {
    return true;
  }

  public abstract matches(device: Device): boolean;

  public equals(value: unknown): value is this {
    return (
      value instanceof Feature &&
      value.name === this.name &&
      value._value.equals(this._value)
    );
  }

  public toJSON(): Feature.JSON<N> {
    return {
      type: "feature",
      name: this.name,
      value: this._value.map((value) => value.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this.name}${this._value.map((value) => `: ${value}`).getOr("")}`;
  }
}

export namespace Feature {
  export interface JSON<N extends string = string> {
    [key: string]: json.JSON;
    type: "feature";
    name: N;
    value: Value.JSON | null;
  }

  export class Unknown extends Feature {
    public static of(value: Value, name: string): Unknown {
      return new Unknown(Option.of(value), name);
    }

    public static boolean(name: string): Unknown {
      return new Unknown(None, name);
    }

    private readonly _name: string;

    private constructor(value: Option<Value>, name: string) {
      super(value);
      this._name = name;
    }

    public get name(): string {
      return this._name;
    }

    public get isKnown(): false {
      return false;
    }

    public matches(): boolean {
      return false;
    }
  }

  export const { of: unknown, boolean: booleanUnknown } = Unknown;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#width
   */
  export class Width extends Feature<"width", Length> {
    public static of(value: Value<Length>): Width {
      return new Width(Option.of(value));
    }

    private static _boolean = new Width(None);

    public static boolean(): Width {
      return Width._boolean;
    }

    public get name(): "width" {
      return "width";
    }

    public matches(device: Device): boolean {
      const {
        viewport: { width },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => Resolver.length(length, device))
      );

      return width > 0
        ? value.some((value) => value.matches(Length.of(width, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  export const { of: width, boolean: booleanWidth } = Width;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#height
   */
  export class Height extends Feature<"height", Length> {
    public static of(value: Value<Length>): Height {
      return new Height(Option.of(value));
    }

    private static _boolean = new Width(None);

    public static boolean(): Width {
      return Height._boolean;
    }

    public get name(): "height" {
      return "height";
    }

    public matches(device: Device): boolean {
      const {
        viewport: { height },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => Resolver.length(length, device))
      );

      return height > 0
        ? value.some((value) => value.matches(Length.of(height, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  export const { of: height, boolean: booleanHeight } = Height;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#orientation
   */
  export class Orientation extends Feature<"orientation", String> {
    public static of(value: Value<String>): Orientation {
      return new Orientation(Option.of(value));
    }

    private static _boolean = new Orientation(None);

    public static boolean(): Orientation {
      return Orientation._boolean;
    }

    public get name(): "orientation" {
      return "orientation";
    }

    public matches(device: Device): boolean {
      return this._value.every((value) =>
        value.matches(String.of(device.viewport.orientation as string))
      );
    }
  }

  export const { of: orientation, boolean: booleanOrientation } = Orientation;

  /**
   * @see https://drafts.csswg.org/mediaqueries-5/#scripting
   */
  export class Scripting extends Feature<"scripting", String> {
    public static of(value: Value<String>): Scripting {
      return new Scripting(Option.of(value));
    }

    private static _boolean = new Scripting(None);

    public static boolean(): Scripting {
      return Scripting._boolean;
    }

    public get name(): "scripting" {
      return "scripting";
    }

    public matches(device: Device): boolean {
      return device.scripting.enabled
        ? this._value.every((value) => value.matches(String.of("enabled")))
        : this._value.some((value) => value.matches(String.of("none")));
    }
  }

  export const { of: scripting, boolean: booleanScripting } = Scripting;

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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parsePlain = map(
    separatedPair(
      parseName,
      delimited(option(Token.parseWhitespace), Token.parseColon),
      Value.parse
    ),
    ([name, value]) => {
      if (name.startsWith("min-") || name.startsWith("max-")) {
        const range = name.startsWith("min-")
          ? Value.minimumRange
          : Value.maximumRange;

        name = name.slice(4);

        switch (name) {
          case "width":
            if (value.type === "length") {
              return Feature.width(range(Value.bound(value, true)));
            } else {
              break;
            }

          case "height":
            if (value.type === "length") {
              return Feature.height(range(Value.bound(value, true)));
            } else {
              break;
            }
        }
      } else {
        switch (name) {
          case "width":
            if (value.type === "length") {
              return Feature.width(Value.discrete(value));
            } else {
              break;
            }

          case "height":
            if (value.type === "length") {
              return Feature.height(Value.discrete(value));
            } else {
              break;
            }

          case "orientation":
            if (value.type === "string") {
              return Feature.orientation(Value.discrete(value));
            } else {
              break;
            }

          case "scripting":
            if (value.type === "string") {
              return Feature.scripting(Value.discrete(value));
            } else {
              break;
            }
        }
      }

      return Feature.unknown(Value.discrete(value), name);
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseBoolean = map(parseName, (name) => {
    switch (name) {
      case "width":
        return Feature.booleanWidth();

      case "height":
        return Feature.booleanHeight();

      case "orientation":
        return Feature.booleanOrientation();

      case "scripting":
        return Feature.booleanScripting();

      default:
        return Feature.booleanUnknown(name);
    }
  });

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  export const parse = mapResult(
    delimited(
      Token.parseOpenParenthesis,
      delimited(
        option(Token.parseWhitespace),
        either(parsePlain, parseBoolean)
      ),
      Token.parseCloseParenthesis
    ),
    (feature) =>
      feature.isKnown
        ? Result.of(feature)
        : Err.of(`Unknown feature ${feature}`)
  );
}
