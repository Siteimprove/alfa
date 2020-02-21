import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Number } from "../number";

const { map, left, right, pair, either, delimited, option } = Parser;

export class Scale implements Equatable, Serializable {
  public static of(x: Number, y: Number): Scale {
    return new Scale(x, y);
  }

  private readonly _x: Number;
  private readonly _y: Number;

  private constructor(x: Number, y: Number) {
    this._x = x;
    this._y = y;
  }

  public get type(): "scale" {
    return "scale";
  }

  public get x(): Number {
    return this._x;
  }

  public get y(): Number {
    return this._y;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Scale &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public toJSON(): Scale.JSON {
    return {
      type: "scale",
      x: this._x.toJSON(),
      y: this._y.toJSON()
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

export namespace Scale {
  export interface JSON {
    [key: string]: json.JSON;
    type: "scale";
    x: Number.JSON;
    y: Number.JSON;
  }

  export function isScale(value: unknown): value is Scale {
    return value instanceof Scale;
  }

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-scale
   */
  const parseScale = map(
    right(
      Token.parseFunction("scale"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            Number.parse,
            option(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                Number.parse
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    result => {
      const [x, y] = result;

      return Scale.of(x, y.getOr(x));
    }
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex
   */
  const parseScaleX = map(
    right(
      Token.parseFunction("scaleX"),
      left(
        delimited(option(Token.parseWhitespace), Number.parse),
        Token.parseCloseParenthesis
      )
    ),
    x => Scale.of(x, Number.of(1))
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley
   */
  const parseScaleY = map(
    right(
      Token.parseFunction("scaleY"),
      left(
        delimited(option(Token.parseWhitespace), Number.parse),
        Token.parseCloseParenthesis
      )
    ),
    y => Scale.of(Number.of(1), y)
  );

  export const parse = either(parseScale, either(parseScaleX, parseScaleY));
}
