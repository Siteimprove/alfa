import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Value } from "../../value";

import { Angle } from "../angle";
import { Number } from "../number";
import { Unit } from "../unit";

const { map, left, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Rotate<A extends Angle = Angle> extends Value<"transform"> {
  public static of<A extends Angle>(
    x: Number,
    y: Number,
    z: Number,
    angle: A
  ): Rotate<A> {
    return new Rotate(x, y, z, angle);
  }

  private readonly _x: Number;
  private readonly _y: Number;
  private readonly _z: Number;
  private readonly _angle: A;

  private constructor(x: Number, y: Number, z: Number, angle: A) {
    super();
    this._x = x;
    this._y = y;
    this._z = z;
    this._angle = angle;
  }

  public get type(): "transform" {
    return "transform";
  }

  public get kind(): "rotate" {
    return "rotate";
  }

  public get x(): Number {
    return this._x;
  }

  public get y(): Number {
    return this._y;
  }

  public get z(): Number {
    return this._z;
  }

  public get angle(): A {
    return this._angle;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Rotate &&
      value._x.equals(this._x) &&
      value._y.equals(this._y) &&
      value._z.equals(this._z) &&
      value._angle.equals(this._angle)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._x)
      .writeHashable(this._y)
      .writeHashable(this._z)
      .writeHashable(this._angle);
  }

  public toJSON(): Rotate.JSON {
    return {
      type: "transform",
      kind: "rotate",
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      z: this._z.toJSON(),
      angle: this._angle.toJSON(),
    };
  }

  public toString(): string {
    if (this._x.value === 0 && this._y.value === 0 && this._z.value === 1) {
      return `rotate(${this._angle})`;
    }

    return `rotate3d(${this._x}, ${this._y}, ${this._z}, ${this._angle})`;
  }
}

/**
 * @public
 */
export namespace Rotate {
  export interface JSON extends Value.JSON<"transform"> {
    kind: "rotate";
    x: Number.JSON;
    y: Number.JSON;
    z: Number.JSON;
    angle: Angle.JSON;
  }

  export function isRotate<A extends Angle>(
    value: unknown
  ): value is Rotate<A> {
    return value instanceof Rotate;
  }

  const parseAngleOrZero = either(
    Angle.parse,
    map(Number.parseZero, () => Angle.of<Unit.Angle>(0, "deg"))
  );

  const parseSeparator = delimited(
    option(Token.parseWhitespace),
    Token.parseComma
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-rotate}
   */
  const parseRotate = map(
    right(
      Token.parseFunction("rotate"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (angle) => Rotate.of(Number.of(0), Number.of(0), Number.of(1), angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatex}
   */
  const parseRotateX = map(
    right(
      Token.parseFunction("rotateX"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (angle) => Rotate.of(Number.of(1), Number.of(0), Number.of(0), angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateY = map(
    right(
      Token.parseFunction("rotateY"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (angle) => Rotate.of(Number.of(0), Number.of(1), Number.of(0), angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateZ = map(
    right(
      Token.parseFunction("rotateZ"),
      left(
        delimited(option(Token.parseWhitespace), parseAngleOrZero),
        Token.parseCloseParenthesis
      )
    ),
    (angle) => Rotate.of(Number.of(0), Number.of(0), Number.of(1), angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotate3d}
   */
  const parseRotate3d = map(
    right(
      Token.parseFunction("rotate3d"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            Number.parse,
            right(
              parseSeparator,
              pair(
                Number.parse,
                right(
                  parseSeparator,
                  pair(Number.parse, right(parseSeparator, parseAngleOrZero))
                )
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [x, [y, [z, angle]]] = result;

      return Rotate.of(x, y, z, angle);
    }
  );

  export const parse: Parser<Slice<Token>, Rotate, string> = either(
    parseRotate,
    parseRotateX,
    parseRotateY,
    parseRotateZ,
    parseRotate3d
  );
}
