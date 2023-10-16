import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Comma, Function, type Parser as CSSParser, Token } from "../../syntax";

import { Keyword } from "../keyword";
import { Length } from "../numeric";
import { Value } from "../value";

import { BasicShape } from "./basic-shape";

const { either, map, option, separatedList } = Parser;

/**
 * {@link https://drafts.fxtf.org/css-masking/#funcdef-clip-rect}
 *
 * @public
 * @deprecated Deprecated as of CSS Masking Module Level 1
 */
export class Rectangle<
  O extends Length | Rectangle.Auto = Length | Rectangle.Auto
> extends BasicShape<"rectangle", Value.HasCalculation<[O, O, O, O]>> {
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
    super("rectangle", Value.hasCalculation(top, right, bottom, left));
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

  public resolve(resolver: Rectangle.Resolver): Rectangle.Canonical {
    return new Rectangle(
      this._top.resolve(resolver),
      this._right.resolve(resolver),
      this._bottom.resolve(resolver),
      this._left.resolve(resolver)
    );
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
  export type Canonical = Rectangle<Length.Canonical | Auto>;

  export type Auto = Keyword<"auto">;

  export interface JSON extends BasicShape.JSON<"rectangle"> {
    top: Length.JSON | Keyword.JSON;
    right: Length.JSON | Keyword.JSON;
    bottom: Length.JSON | Keyword.JSON;
    left: Length.JSON | Keyword.JSON;
  }

  export type Resolver = Length.Resolver;

  export function isRectangle(value: unknown): value is Rectangle {
    return value instanceof Rectangle;
  }

  const parseLengthAuto = either(Length.parse, Keyword.parse("auto"));

  export const parse: CSSParser<Rectangle> = map(
    Function.parse(
      "rect",
      either(
        separatedList(parseLengthAuto, option(Token.parseWhitespace), 4, 4),
        separatedList(parseLengthAuto, Comma.parse, 4, 4)
      )
    ),
    ([_, [top, right, bottom, left]]) => Rectangle.of(top, right, bottom, left)
  );
}
