import { Value } from "../../value";
import { Length } from "../length";
import { Keyword } from "../keyword";
import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";

const { either, left, right, separatedList } = Parser;

export class Rectangle extends Value<"shape"> {
  public static of(
    top: Length | Keyword<"auto">,
    right: Length | Keyword<"auto">,
    bottom: Length | Keyword<"auto">,
    left: Length | Keyword<"auto">
  ) {
    return new Rectangle(top, right, bottom, left);
  }

  private readonly _top: Length | Keyword<"auto">;
  private readonly _right: Length | Keyword<"auto">;
  private readonly _bottom: Length | Keyword<"auto">;
  private readonly _left: Length | Keyword<"auto">;

  private constructor(
    top: Length | Keyword<"auto">,
    right: Length | Keyword<"auto">,
    bottom: Length | Keyword<"auto">,
    left: Length | Keyword<"auto">
  ) {
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

  public get top(): Length | Keyword<"auto"> {
    return this._top;
  }

  public get right(): Length | Keyword<"auto"> {
    return this._right;
  }

  public get bottom(): Length | Keyword<"auto"> {
    return this._bottom;
  }

  public get left(): Length | Keyword<"auto"> {
    return this._left;
  }

  public equals(value: unknown): value is this {
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
      top: this._top.toJSON(),
      right: this._right.toJSON(),
      bottom: this._bottom.toJSON(),
      left: this._left.toJSON(),
    };
  }

  public toString(): string {
    return `rect(${this._top.toString()}, ${this._right.toString()}, ${this._bottom.toString()}, ${this._left.toString()})`;
  }
}

export namespace Rectangle {
  export interface JSON extends Value.JSON {
    type: "shape";
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
          separatedList(parseLengthAuto, Token.parseComma),
          separatedList(parseLengthAuto, Token.parseWhitespace)
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
        Rectangle.of(values[0], values[1], values[2], values[3]),
      ]);
    });
}
