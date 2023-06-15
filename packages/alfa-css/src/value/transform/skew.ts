import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Unit } from "../../unit";

import { Angle, Number } from "../numeric";

import { Function } from "./function";

const { map, left, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Skew<
  X extends Angle.Fixed = Angle.Fixed,
  Y extends Angle.Fixed = Angle.Fixed
> extends Function<"skew"> {
  public static of<X extends Angle.Fixed, Y extends Angle.Fixed>(
    x: X,
    y: Y
  ): Skew<X, Y> {
    return new Skew(x, y);
  }

  private readonly _x: X;
  private readonly _y: Y;

  private constructor(x: X, y: Y) {
    super("skew", false);
    this._x = x;
    this._y = y;
  }

  public get x(): X {
    return this._x;
  }

  public get y(): Y {
    return this._y;
  }

  public resolve(): Skew<X, Y> {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Skew &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y);
  }

  public toJSON(): Skew.JSON {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
    };
  }

  public toString(): string {
    if (this._y.value === 0) {
      return `skewX(${this._x})`;
    }

    if (this._x.value === 0) {
      return `skewY(${this._y})`;
    }

    return `skew(${this._x}, ${this._y})`;
  }
}

/**
 * @public
 */
export namespace Skew {
  export interface JSON extends Function.JSON<"skew"> {
    x: Angle.Fixed.JSON;
    y: Angle.Fixed.JSON;
  }

  export function isSkew<X extends Angle.Fixed, Y extends Angle.Fixed>(
    value: unknown
  ): value is Skew<X, Y> {
    return value instanceof Skew;
  }

  const parseAngleOrZero = either(
    Angle.parseBase,
    map(Number.parseZero, () => Angle.of<Unit.Angle>(0, "deg"))
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skew}
   */
  const parseSkew = map(
    right(
      Token.parseFunction("skew"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            parseAngleOrZero,
            option(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                parseAngleOrZero
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [x, y] = result;

      return Skew.of<Angle.Fixed, Angle.Fixed>(
        x,
        y.getOrElse(() => Angle.of(0, "deg"))
      );
    }
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewx}
   */
  const parseSkewX = map(
    right(
      Token.parseFunction("skewX"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (x) => Skew.of<Angle.Fixed, Angle.Fixed>(x, Angle.of(0, "deg"))
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewy}
   */
  const parseSkewY = map(
    right(
      Token.parseFunction("skewY"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (y) => Skew.of<Angle.Fixed, Angle.Fixed>(Angle.of(0, "deg"), y)
  );

  export const parse: Parser<Slice<Token>, Skew, string> = either(
    parseSkew,
    parseSkewX,
    parseSkewY
  );
}
