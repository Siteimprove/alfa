import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction, Token } from "../../syntax/index.js";
import { List } from "../collection/index.js";

import { Angle, Number } from "../numeric/index.js";
import type { Resolvable } from "../resolvable.js";

import { Function } from "./function.js";

const { map, right, pair, either, delimited, option } = Parser;

/**
 * @public
 */
export class Rotate
  extends Function<"rotate", false>
  implements Resolvable<Rotate.Canonical, never>
{
  public static of<A extends Angle>(
    x: Number,
    y: Number,
    z: Number,
    angle: A,
  ): Rotate {
    return new Rotate(x.resolve(), y.resolve(), z.resolve(), angle.resolve());
  }

  private readonly _x: Number.Canonical;
  private readonly _y: Number.Canonical;
  private readonly _z: Number.Canonical;
  private readonly _angle: Angle.Canonical;

  private constructor(
    x: Number.Canonical,
    y: Number.Canonical,
    z: Number.Canonical,
    angle: Angle.Canonical,
  ) {
    super("rotate", false);
    this._x = x;
    this._y = y;
    this._z = z;
    this._angle = angle;
  }

  public get x(): Number.Canonical {
    return this._x;
  }

  public get y(): Number.Canonical {
    return this._y;
  }

  public get z(): Number.Canonical {
    return this._z;
  }

  public get angle(): Angle.Canonical {
    return this._angle;
  }

  public resolve(): Rotate {
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
  export type Canonical = Rotate;
  export interface JSON extends Function.JSON<"rotate"> {
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
    z: Number.Fixed.JSON;
    angle: Angle.Fixed.JSON<"deg">;
  }

  export function isRotate(value: unknown): value is Rotate {
    return value instanceof Rotate;
  }

  const _0 = Number.of(0);
  const _1 = Number.of(1);

  const parseAngleOrZero = either(
    Angle.parse,
    map(Number.parseZero, () => Angle.of(0, "deg")),
  );

  const parseAxis = (name: string) =>
    map(CSSFunction.parse(name, parseAngleOrZero), ([_, angle]) => angle);

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-rotate}
   */
  const parseRotate = map(parseAxis("rotate"), (angle) =>
    Rotate.of(_0, _0, _1, angle),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatex}
   */
  const parseRotateX = map(parseAxis("rotateX"), (angle) =>
    Rotate.of(_1, _0, _0, angle),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateY = map(parseAxis("rotateY"), (angle) =>
    Rotate.of(_0, _1, _0, angle),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotatey}
   */
  const parseRotateZ = map(parseAxis("rotateZ"), (angle) =>
    Rotate.of(_0, _0, _1, angle),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-rotate3d}
   */
  const parseRotate3d = map(
    CSSFunction.parse(
      "rotate3d",
      pair(
        map(
          List.parseCommaSeparated(Number.parse, 3, 3),
          (list) => list.values,
        ),
        right(
          delimited(option(Token.parseWhitespace), Token.parseComma),
          parseAngleOrZero,
        ),
      ),
    ),
    (result) => {
      const [_, [[x, y, z], angle]] = result;

      return Rotate.of(x, y, z, angle);
    },
  );

  export const parse = either(
    parseRotate,
    parseRotateX,
    parseRotateY,
    parseRotateZ,
    parseRotate3d,
  );
}
