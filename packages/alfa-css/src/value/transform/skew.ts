import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Angle } from "../angle";
import { Number } from "../number";
import { Unit } from "../unit";

const { map, left, right, pair, either, delimited, option } = Parser;

export class Skew<X extends Angle = Angle, Y extends Angle = Angle>
  implements Equatable, Serializable {
  public static of<X extends Angle, Y extends Angle>(x: X, y: Y): Skew<X, Y> {
    return new Skew(x, y);
  }

  private readonly _x: X;
  private readonly _y: Y;

  private constructor(x: X, y: Y) {
    this._x = x;
    this._y = y;
  }

  public get type(): "skew" {
    return "skew";
  }

  public get x(): X {
    return this._x;
  }

  public get y(): Y {
    return this._y;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Skew &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public toJSON(): Skew.JSON {
    return {
      type: "skew",
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

export namespace Skew {
  export interface JSON {
    [key: string]: json.JSON;
    type: "skew";
    x: Angle.JSON;
    y: Angle.JSON;
  }

  export function isSkew<X extends Angle, Y extends Angle>(
    value: unknown
  ): value is Skew<X, Y> {
    return value instanceof Skew;
  }

  const parseAngleOrZero = either(
    Angle.parse,
    map(Number.parseZero, () => Angle.of<Unit.Angle>(0, "deg"))
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-skew
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

      return Skew.of<Angle, Angle>(
        x,
        y.getOrElse(() => Angle.of(0, "deg"))
      );
    }
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-skewx
   */
  const parseSkewX = map(
    right(
      Token.parseFunction("skewX"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (x) => Skew.of<Angle, Angle>(x, Angle.of(0, "deg"))
  );

  /**
   * @see https://drafts.csswg.org/css-transforms/#funcdef-transform-skewy
   */
  const parseSkewY = map(
    right(
      Token.parseFunction("skewY"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (y) => Skew.of<Angle, Angle>(Angle.of(0, "deg"), y)
  );

  export const parse = either(parseSkew, either(parseSkewX, parseSkewY));
}
