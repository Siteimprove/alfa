import {
  Color,
  Current,
  Keyword,
  Length,
  Percentage,
  RGB,
  System,
  Token,
  Unit,
  Value,
} from "@siteimprove/alfa-css";
import { Hash } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Tuple } from "./value/tuple";

const { isKeyword } = Keyword;
const { either, map, option, separated } = Parser;

declare module "../property" {
  interface Longhands {
    "text-shadow": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"none"> | TextShadow;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | TextShadow<RGB<Percentage, Percentage> | Current | System, "px">;

const parseOffset = map(
  separated(Length.parse, Token.parseWhitespace),
  ([x, y]) => Tuple.of(x, y)
);

const parseLengths = separated(
  parseOffset,
  Token.parseWhitespace,
  option(Length.parse)
);

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("none"),
  map(
    separated(parseLengths, Token.parseWhitespace, option(Color.parse)),
    ([[offset, blur], color]) =>
      TextShadow.of(color, offset, blur.getOr(Length.of(0, "px")))
  ),
  map(
    separated(option(Color.parse), Token.parseWhitespace, parseLengths),
    ([color, [offset, blur]]) =>
      TextShadow.of(color, offset, blur.getOr(Length.of(0, "px")))
  )
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow}
 * @internal
 */
export default Property.register(
  "text-shadow",
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (shadow, style) =>
    shadow.map((shadow) => {
      if (isKeyword(shadow)) {
        return shadow;
      }

      const [x, y] = shadow.offset.values;

      return TextShadow.of(
        shadow.color.map(Resolver.color),
        Tuple.of(Resolver.length(x, style), Resolver.length(y, style)),
        Resolver.length(shadow.blur, style)
      );
    })
  )
);

class TextShadow<
  C extends Color = Color,
  U extends Unit.Length = Unit.Length
> extends Value<"text-shadow"> {
  public static of<
    C extends Color = Color,
    U extends Unit.Length = Unit.Length
  >(
    color: Option<C>,
    offset: Tuple<[Length<U>, Length<U>]>,
    blur: Length<U>
  ): TextShadow<C, U> {
    return new TextShadow<C, U>(color, offset, blur);
  }

  private readonly _color: Option<C>;
  private readonly _offset: Tuple<[Length<U>, Length<U>]>;
  private readonly _blur: Length<U>;

  private constructor(
    color: Option<C>,
    offset: Tuple<[Length<U>, Length<U>]>,
    blur: Length<U>
  ) {
    super();

    this._color = color;
    this._offset = offset;
    this._blur = blur;
  }

  public get type(): "text-shadow" {
    return "text-shadow";
  }

  public get color(): Option<C> {
    return this._color;
  }

  public get offset(): Tuple<[Length<U>, Length<U>]> {
    return this._offset;
  }

  public get blur(): Length<U> {
    return this._blur;
  }

  public equals(value: TextShadow): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof TextShadow &&
      value._color.equals(this._color) &&
      value._offset.equals(this._offset) &&
      value._blur.equals(this._blur)
    );
  }

  public hash(hash: Hash): void {
    this._color.hash(hash);
    this._offset.hash(hash);
    this._blur.hash(hash);
  }

  public toJSON(): TextShadow.JSON<C, U> {
    return {
      type: "text-shadow",
      color: this._color.toJSON(),
      offset: this._offset.toJSON(),
      blur: this._blur.toJSON(),
    };
  }

  public toString(): string {
    return `${this._color.getOr("")} ${this._offset} ${this._blur}`;
  }
}

namespace TextShadow {
  export interface JSON<
    C extends Color = Color,
    U extends Unit.Length = Unit.Length
  > extends Value.JSON<"text-shadow"> {
    color: Option.JSON<C>;
    offset: Tuple.JSON<[Length<U>, Length<U>]>;
    blur: Length.JSON<U>;
  }

  export function isTextShadow(value: unknown): value is TextShadow {
    return value instanceof TextShadow;
  }
}
