import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Function, Token } from "../../syntax";

import { Keyword } from "../keyword";
import { Length } from "../numeric";

import { BasicShape } from "./basic-shape";

const { either, map, option, pair, take, right, delimited } = Parser;

/**
 * {@link https://drafts.fxtf.org/css-masking/#funcdef-clip-rect}
 *
 * @public
 * @deprecated Deprecated as of CSS Masking Module Level 1
 */
export class Rectangle<
  O extends Length.Fixed | Rectangle.Auto = Length.Fixed | Rectangle.Auto
> extends BasicShape<"rectangle"> {
  public static of<
    O extends Length.Fixed | Rectangle.Auto = Length.Fixed | Rectangle.Auto
  >(top: O, right: O, bottom: O, left: O): Rectangle<O> {
    return new Rectangle(top, right, bottom, left);
  }

  public readonly _top: O;
  public readonly _right: O;
  public readonly _bottom: O;
  public readonly _left: O;

  private constructor(top: O, right: O, bottom: O, left: O) {
    super("rectangle", false);
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;
  }

  public get top(): O {
    return this._top;
  }

  public get right(): O {
    return this._right;
  }

  public get bottom(): O {
    return this._bottom;
  }

  public get left(): O {
    return this._left;
  }

  public resolve(): Rectangle<O> {
    return this;
  }

  public equals(value: Rectangle): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Rectangle &&
      value._top.equals(this._top) &&
      value._right.equals(this._right) &&
      value._bottom.equals(this._bottom) &&
      value._left.equals(this._left)
    );
  }

  public hash(hash: Hash) {
    hash
      .writeHashable(this._top)
      .writeHashable(this._right)
      .writeHashable(this._bottom)
      .writeHashable(this._left);
  }

  public toJSON(): Rectangle.JSON {
    return {
      ...super.toJSON(),
      top: Rectangle.toJSON(this._top),
      right: Rectangle.toJSON(this._right),
      bottom: Rectangle.toJSON(this._bottom),
      left: Rectangle.toJSON(this._left),
    };
  }

  public toString(): string {
    return `rect(${this._top}, ${this._right}, ${this._bottom}, ${this._left})`;
  }
}

/**
 * @public
 * @deprecated Deprecated as of CSS Masking Module Level 1
 */
export namespace Rectangle {
  export type Auto = Keyword<"auto">;

  export interface JSON extends BasicShape.JSON<"rectangle"> {
    top: Length.Fixed.JSON | Keyword.JSON;
    right: Length.Fixed.JSON | Keyword.JSON;
    bottom: Length.Fixed.JSON | Keyword.JSON;
    left: Length.Fixed.JSON | Keyword.JSON;
  }

  /**
   * TODO remove this function
   * The `this` constraint in Length is throwing TypeScript off guard and causing
   * build errors. This is likely a TS problem that will hopefully be solved.
   *
   * {@link https://github.com/microsoft/TypeScript/issues/54407}
   * {@link https://github.com/Siteimprove/alfa/issues/1426}
   *
   * @internal
   */
  export function toJSON<O extends Length.Fixed | Auto>(
    offset: O
  ): Length.Fixed.JSON | Keyword.JSON {
    return Length.isLength(offset) ? offset.toJSON() : offset.toJSON();
  }

  export function isRectangle(value: unknown): value is Rectangle {
    return value instanceof Rectangle;
  }

  const parseLengthAuto = either(Length.parseBase, Keyword.parse("auto"));

  export const parse: Parser<Slice<Token>, Rectangle, string> = map(
    Function.parse(
      "rect",
      either(
        pair(
          parseLengthAuto,
          take(right(option(Token.parseWhitespace), parseLengthAuto), 3)
        ),
        pair(
          parseLengthAuto,
          take(
            right(
              delimited(option(Token.parseWhitespace), Token.parseComma),
              parseLengthAuto
            ),
            3
          )
        )
      )
    ),
    ([_, [top, [right, bottom, left]]]) =>
      Rectangle.of(top, right, bottom, left)
  );
}
