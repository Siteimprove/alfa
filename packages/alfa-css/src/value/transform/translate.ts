import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Length } from "../length";
import { Percentage } from "../percentage";
import { Transform } from "../transform";

const { map, left, right, pair, either, delimited, option } = Parser;

export class Translate<
  X extends Length | Percentage = Length | Percentage,
  Y extends Length | Percentage = Length | Percentage,
  Z extends Length = Length
> implements Equatable, Serializable {
  public static of<
    X extends Length | Percentage,
    Y extends Length | Percentage,
    Z extends Length
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return new Translate(x, y, z);
  }

  private readonly _x: X;
  private readonly _y: Y;
  private readonly _z: Z;

  private constructor(x: X, y: Y, z: Z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get type(): "translate" {
    return "translate";
  }

  public get x(): X {
    return this._x;
  }

  public get y(): Y {
    return this._y;
  }

  public get z(): Z {
    return this._z;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Translate &&
      value._x.equals(this._x) &&
      value._y.equals(this._y) &&
      value._z.equals(this._z)
    );
  }

  public toJSON(): Translate.JSON {
    return {
      type: "translate",
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      z: this._z.toJSON(),
    };
  }

  public toString(): string {
    if (this._z.value === 0) {
      return `translate(${this._x}${
        this._y.value === 0 ? "" : `, ${this._y}`
      })`;
    }

    return `translate3d(${this._x}, ${this._y}, ${this._z})`;
  }
}

export namespace Translate {
  export interface JSON {
    [key: string]: json.JSON;
    type: "translate";
    x: Length.JSON | Percentage.JSON;
    y: Length.JSON | Percentage.JSON;
    z: Length.JSON;
  }

  export function isTranslate<
    X extends Length | Percentage,
    Y extends Length | Percentage,
    Z extends Length
  >(value: unknown): value is Translate<X, Y, Z> {
    return value instanceof Translate;
  }

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-translate
   */
  const parseTranslate = map(
    right(
      Token.parseFunction("translate"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            either(Length.parse, Percentage.parse),
            option(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                either(Length.parse, Percentage.parse)
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [x, y] = result;

      return Translate.of<Length | Percentage, Length | Percentage, Length>(
        x,
        y.getOrElse(() => Length.of(0, "px")),
        Length.of(0, "px")
      );
    }
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-translatex
   */
  const parseTranslateX = map(
    right(
      Token.parseFunction("translateX"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(Length.parse, Percentage.parse)
        ),
        Token.parseCloseParenthesis
      )
    ),
    (x) =>
      Translate.of<Length | Percentage, Length | Percentage, Length>(
        x,
        Length.of(0, "px"),
        Length.of(0, "px")
      )
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-translatey
   */
  const parseTranslateY = map(
    right(
      Token.parseFunction("translateY"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(Length.parse, Percentage.parse)
        ),
        Token.parseCloseParenthesis
      )
    ),
    (y) =>
      Translate.of<Length | Percentage, Length | Percentage, Length>(
        Length.of(0, "px"),
        y,
        Length.of(0, "px")
      )
  );

  /**
   * @see https://drafts.csswg.org/css-transforms-2/#funcdef-translatez
   */
  const parseTranslateZ = map(
    right(
      Token.parseFunction("translateZ"),
      left(
        delimited(option(Token.parseWhitespace), Length.parse),
        Token.parseCloseParenthesis
      )
    ),
    (z) =>
      Translate.of<Length | Percentage, Length | Percentage, Length>(
        Length.of(0, "px"),
        Length.of(0, "px"),
        z
      )
  );

  /**
   * @see https://drafts.csswg.org/css-transforms-2/#funcdef-translate3d
   */
  const parseTranslate3d = map(
    right(
      Token.parseFunction("translate3d"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            either(Length.parse, Percentage.parse),
            pair(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                either(Length.parse, Percentage.parse)
              ),
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                Length.parse
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [x, [y, z]] = result;

      return Translate.of(x, y, z);
    }
  );

  export const parse = either(
    parseTranslate,
    either(
      either(parseTranslateX, parseTranslateY),
      either(parseTranslateZ, parseTranslate3d)
    )
  );
}
