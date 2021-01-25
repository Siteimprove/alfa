import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Length } from "../length";
import { Keyword } from "../keyword";
import { Value } from "../../value";
import { Token } from "../../syntax/token";
import { Slice } from "@siteimprove/alfa-slice";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { FourSides } from "../four-sides";

const { either, left, map, option, pair, peek, right, separatedList } = Parser;

/**
 * @see https://drafts.fxtf.org/css-masking/#funcdef-clip-rect
 * @deprecated
 */
export class Rectangle<
  O extends Length | Rectangle.Auto = Length | Rectangle.Auto
> extends Value<"shape"> {
  public static of<O extends Length | Rectangle.Auto = Length | Rectangle.Auto>(
    offset: FourSides<O>
  ): Rectangle<O> {
    return new Rectangle(offset);
  }

  private readonly _offset: FourSides<O>;

  private constructor(offset: FourSides<O>) {
    super();
    this._offset = offset;
  }

  public get offset(): FourSides<O> {
    return this._offset;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get format(): "rectangle" {
    return "rectangle";
  }

  public get top(): O {
    return this._offset.top;
  }

  public get right(): O {
    return this._offset.right;
  }

  public get bottom(): O {
    return this._offset.bottom;
  }

  public get left(): O {
    return this._offset.left;
  }

  public equals(value: Rectangle): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Rectangle &&
      value.top.equals(this.top) &&
      value.right.equals(this.right) &&
      value.bottom.equals(this.bottom) &&
      value.left.equals(this.left)
    );
  }

  public hash(hash: Hash) {
    this.top.hash(hash);
    this.right.hash(hash);
    this.bottom.hash(hash);
    this.left.hash(hash);
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

  export const parse: Parser<Slice<Token>, Rectangle, string> = (input) =>
    right(
      Token.parseFunction((fn) => fn.value === "rect"),
      left(
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
        ),
        Token.parseCloseParenthesis
      )
    )(input).flatMap(([remainder, result]) => {
      const values = [...result];

      const err: Result<[Slice<Token>, Rectangle], string> = Err.of(
        "rect() must have exactly 4 arguments"
      );

      if (values.length !== 4) {
        return err;
      }
      return Ok.of<[Slice<Token>, Rectangle]>([
        remainder,
        Rectangle.of(FourSides.of(values[0], values[1], values[2], values[3])),
      ]);
    });
}
