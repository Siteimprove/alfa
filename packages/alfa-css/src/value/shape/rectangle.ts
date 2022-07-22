import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";
import { Value } from "../../value";

import { Keyword } from "../keyword";
import { Length } from "../numeric/length";

const { either, map, option, pair, take, right, delimited } = Parser;

/**
 * {@link https://drafts.fxtf.org/css-masking/#funcdef-clip-rect}
 *
 * @public
 * @deprecated Deprecated as of CSS Masking Module Level 1
 */
export class Rectangle<
  O extends Length | Rectangle.Auto = Length | Rectangle.Auto
> extends Value<"basic-shape"> {
  public static of<O extends Length | Rectangle.Auto = Length | Rectangle.Auto>(
    top: O,
    right: O,
    bottom: O,
    left: O
  ): Rectangle<O> {
    return new Rectangle(top, right, bottom, left);
  }

  public readonly _top: O;
  public readonly _right: O;
  public readonly _bottom: O;
  public readonly _left: O;

  private constructor(top: O, right: O, bottom: O, left: O) {
    super();
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._left = left;
  }

  public get type(): "basic-shape" {
    return "basic-shape";
  }

  public get kind(): "rectangle" {
    return "rectangle";
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
      type: "basic-shape",
      kind: "rectangle",
      top: this._top.toJSON(),
      right: this._right.toJSON(),
      bottom: this._bottom.toJSON(),
      left: this._left.toJSON(),
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

  export interface JSON extends Value.JSON<"basic-shape"> {
    kind: "rectangle";
    top: Length.JSON | Keyword.JSON;
    right: Length.JSON | Keyword.JSON;
    bottom: Length.JSON | Keyword.JSON;
    left: Length.JSON | Keyword.JSON;
  }

  export function isRectangle(value: unknown): value is Rectangle {
    return value instanceof Rectangle;
  }

  const parseLengthAuto = either(Length.parse, Keyword.parse("auto"));

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
