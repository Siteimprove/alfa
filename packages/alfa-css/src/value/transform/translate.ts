import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Value } from "../../value";

import { Length } from "../length";
import { Percentage } from "../percentage";

const { map, left, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Translate<
  X extends Length | Percentage = Length | Percentage,
  Y extends Length | Percentage = Length | Percentage,
  Z extends Length = Length
> extends Value<"transform"> {
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
    super();
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get type(): "transform" {
    return "transform";
  }

  public get kind(): "translate" {
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

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y).writeHashable(this._z);
  }

  public toJSON(): Translate.JSON {
    return {
      type: "transform",
      kind: "translate",
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

/**
 * @public
 */
export namespace Translate {
  export interface JSON extends Value.JSON<"transform"> {
    kind: "translate";
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
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translate}
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
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatex}
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
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatey}
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
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-translatez}
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
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-translate3d}
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

  export const parse: Parser<Slice<Token>, Translate, string> = either(
    parseTranslate,
    parseTranslateX,
    parseTranslateY,
    parseTranslateZ,
    parseTranslate3d
  );
}
