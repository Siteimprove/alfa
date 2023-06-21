import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Number } from "../numeric";

import { Function } from "./function";

const { map, left, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Scale extends Function<"scale"> {
  public static of(x: Number.Fixed, y: Number.Fixed): Scale {
    return new Scale(x, y);
  }

  private readonly _x: Number.Fixed;
  private readonly _y: Number.Fixed;

  private constructor(x: Number.Fixed, y: Number.Fixed) {
    super("scale", false);
    this._x = x;
    this._y = y;
  }

  public get kind(): "scale" {
    return "scale";
  }

  public get x(): Number.Fixed {
    return this._x;
  }

  public get y(): Number.Fixed {
    return this._y;
  }

  public resolve(): Scale {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Scale &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y);
  }

  public toJSON(): Scale.JSON {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
    };
  }

  public toString(): string {
    if (this._x.value === this._y.value) {
      return `scale(${this._x})`;
    }

    if (this._y.value === 1) {
      return `scaleX(${this._x})`;
    }

    if (this._x.value === 1) {
      return `scaleY(${this._y})`;
    }

    return `scale(${this._x}, ${this._y})`;
  }
}

/**
 * @public
 */
export namespace Scale {
  export interface JSON extends Function.JSON<"scale"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
  }

  export function isScale(value: unknown): value is Scale {
    return value instanceof Scale;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scale}
   */
  const parseScale = map(
    right(
      Token.parseFunction("scale"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            Number.parseBase,
            option(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                Number.parseBase
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [x, y] = result;

      return Scale.of(x, y.getOr(x));
    }
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex}
   */
  const parseScaleX = map(
    right(
      Token.parseFunction("scaleX"),
      left(
        delimited(option(Token.parseWhitespace), Number.parseBase),
        Token.parseCloseParenthesis
      )
    ),
    (x) => Scale.of(x, Number.of(1))
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley}
   */
  const parseScaleY = map(
    right(
      Token.parseFunction("scaleY"),
      left(
        delimited(option(Token.parseWhitespace), Number.parseBase),
        Token.parseCloseParenthesis
      )
    ),
    (y) => Scale.of(Number.of(1), y)
  );

  export const parse: Parser<Slice<Token>, Scale, string> = either(
    parseScale,
    parseScaleX,
    parseScaleY
  );
}
