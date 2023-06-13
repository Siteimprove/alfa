import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Angle } from "../../calculation";
import { Token } from "../../syntax";
import { Unit } from "../../unit";

import { Number } from "../numeric";

import { Function } from "./function";

const { map, left, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Rotate<A extends Angle = Angle> extends Function<"rotate"> {
  public static of<A extends Angle>(
    x: Number.Fixed,
    y: Number.Fixed,
    z: Number.Fixed,
    angle: A
  ): Rotate<A> {
    return new Rotate(x, y, z, angle);
  }

  private readonly _x: Number.Fixed;
  private readonly _y: Number.Fixed;
  private readonly _z: Number.Fixed;
  private readonly _angle: A;

  private constructor(
    x: Number.Fixed,
    y: Number.Fixed,
    z: Number.Fixed,
    angle: A
  ) {
    super("rotate", false);
    this._x = x;
    this._y = y;
    this._z = z;
    this._angle = angle;
  }

  public get x(): Number.Fixed {
    return this._x;
  }

  public get y(): Number.Fixed {
    return this._y;
  }

  public get z(): Number.Fixed {
    return this._z;
  }

  public get angle(): A {
    return this._angle;
  }

  public resolve(): Rotate<A> {
    return this;
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
      ...super.toJSON(),
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
  export interface JSON extends Function.JSON<"rotate"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
    z: Number.Fixed.JSON;
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
            Number.parseBase,
            right(
              parseSeparator,
              pair(
                Number.parseBase,
                right(
                  parseSeparator,
                  pair(
                    Number.parseBase,
                    right(parseSeparator, parseAngleOrZero)
                  )
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
