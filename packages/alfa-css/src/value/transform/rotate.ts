import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
  Token,
} from "../../syntax";
import { Unit } from "../../unit";
import { List } from "../collection";

import { Angle, Number } from "../numeric";

import { Function } from "./function";

const { map, right, pair, either, delimited, option, parseIf } = Parser;

/**
 * @public
 */
export class Rotate<
  A extends Angle.Fixed = Angle.Fixed
> extends Function<"rotate"> {
  public static of<A extends Angle.Fixed>(
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
  export type Canonical = Rotate<Angle.Canonical>;

  export interface JSON extends Function.JSON<"rotate"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
    z: Number.Fixed.JSON;
    angle: Angle.Fixed.JSON;
  }

  export function isRotate<A extends Angle.Fixed>(
    value: unknown
  ): value is Rotate<A> {
    return value instanceof Rotate;
  }

  const _0 = Number.of(0);
  const _1 = Number.of(1);

  const parseAngleOrZero = either(
    Angle.parseBase,
    map(Number.parseZero, () => Angle.of<Unit.Angle>(0, "deg"))
  );

  const parseAxis = (name: string) =>
    map(CSSFunction.parse(name, parseAngleOrZero), ([_, angle]) => angle);

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-rotate}
   */
  const parseRotate = map(parseAxis("rotate"), (angle) =>
    Rotate.of(_0, _0, _1, angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatex}
   */
  const parseRotateX = map(parseAxis("rotateX"), (angle) =>
    Rotate.of(_1, _0, _0, angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateY = map(parseAxis("rotateY"), (angle) =>
    Rotate.of(_0, _1, _0, angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateZ = map(parseAxis("rotateZ"), (angle) =>
    Rotate.of(_0, _0, _1, angle)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotate3d}
   */
  const parseRotate3d = map(
    CSSFunction.parse(
      "rotate3d",
      pair(
        map(
          List.parseCommaSeparated(Number.parseBase, 3, 3),
          (list) => list.values
        ),
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          parseAngleOrZero
        )
      )
    ),
    (result) => {
      const [_, [[x, y, z], angle]] = result;

      return Rotate.of(x, y, z, angle);
    }
  );

  export const parse: CSSParser<Rotate> = either(
    parseRotate,
    parseRotateX,
    parseRotateY,
    parseRotateZ,
    parseRotate3d
  );
}
