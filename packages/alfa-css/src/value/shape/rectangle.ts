import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Length } from "../length";
import { Keyword } from "../keyword";
import { Value } from "../../value";
import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";

const { either, mapResult, option, pair, peek, right, separatedList } = Parser;

/**
 * @see https://drafts.fxtf.org/css-masking/#funcdef-clip-rect
 * @deprecated
 */
export class Rectangle<
  O extends Length | Rectangle.Auto = Length | Rectangle.Auto
> extends Value<"shape"> {
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

  public get type(): "shape" {
    return "shape";
  }

  public get format(): "rectangle" {
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
    this._top.hash(hash);
    this._right.hash(hash);
    this._bottom.hash(hash);
    this._left.hash(hash);
  }

  public toJSON(): Rectangle.JSON {
    return {
      type: "shape",
      format: "rectangle",
      top: this.top.toJSON(),
      right: this.right.toJSON(),
      bottom: this.bottom.toJSON(),
      left: this.left.toJSON(),
    };
  }

  public toString(): string {
    return `rect(${this.top}, ${this.right}, ${this.bottom}, ${this.left})`;
  }
}

export namespace Rectangle {
  export type Auto = Keyword<"auto">;

  export interface JSON extends Value.JSON<"shape"> {
    format: "rectangle";
    top: Length.JSON | Keyword.JSON;
    right: Length.JSON | Keyword.JSON;
    bottom: Length.JSON | Keyword.JSON;
    left: Length.JSON | Keyword.JSON;
  }

  export function isRectangle(value: unknown): value is Rectangle {
    return value instanceof Rectangle;
  }

  const parseLengthAuto = either(Length.parse, Keyword.parse("auto"));

  export const parse = mapResult<
    Slice<Token>,
    readonly [Function, Iterable<Length | Auto>],
    Rectangle,
    string
  >(
    Function.parse(
      "rect",
      either(
        // If there is the wrong separator, separatedList still return the first value.
        // Thus, it doesn't fail and the full parser fails at the closing parenthesis.
        // We need to peek to find the correct separator…
        right(
          peek(pair(parseLengthAuto, Token.parseWhitespace)),
          separatedList(parseLengthAuto, Token.parseWhitespace)
        ),
        separatedList(
          parseLengthAuto,
          pair(Token.parseComma, option(Token.parseWhitespace))
        )
      )
    ),
    ([_, result]) => {
      const values = [...result];

      return values.length === 4
        ? Ok.of(
            // Typescript does not remember the length of the array, so we can't use "...values" :-(
            Rectangle.of(values[0], values[1], values[2], values[3])
          )
        : Err.of("rect() must have exactly 4 arguments");
    }
  );
}
