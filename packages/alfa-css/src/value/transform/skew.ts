import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction } from "../../syntax";
import { List } from "../collection";

import { Angle, Number } from "../numeric";
import { Resolvable } from "../resolvable";

import { Function } from "./function";

const { map, either } = Parser;

/**
 * @public
 */
export class Skew
  extends Function<"skew", false>
  implements Resolvable<Skew.Canonical, never>
{
  public static of(x: Angle, y: Angle): Skew {
    return new Skew(x.resolve(), y.resolve());
  }

  private readonly _x: Angle.Canonical;
  private readonly _y: Angle.Canonical;

  private constructor(x: Angle.Canonical, y: Angle.Canonical) {
    super("skew", false);
    this._x = x;
    this._y = y;
  }

  public get x(): Angle.Canonical {
    return this._x;
  }

  public get y(): Angle.Canonical {
    return this._y;
  }

  public resolve(): Skew {
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
  export type Canonical = Skew;

  export interface JSON extends Function.JSON<"skew"> {
    x: Angle.Fixed.JSON;
    y: Angle.Fixed.JSON;
  }

  export function isSkew(value: unknown): value is Skew {
    return value instanceof Skew;
  }

  const _0 = Angle.of(0, "deg");

  const parseAngleOrZero = either(
    Angle.parse,
    map(Number.parseZero, () => _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skew}
   */
  const parseSkew = map(
    CSSFunction.parse(
      "skew",
      map(
        List.parseCommaSeparated(parseAngleOrZero, 1, 2),
        (list) => list.values,
      ),
    ),
    ([_, [x, y]]) => Skew.of(x, y ?? _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewx}
   */
  const parseSkewX = map(
    CSSFunction.parse("skewX", parseAngleOrZero),
    ([_, x]) => Skew.of(x, _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewy}
   */
  const parseSkewY = map(
    CSSFunction.parse("skewY", parseAngleOrZero),
    ([_, y]) => Skew.of(_0, y),
  );

  export const parse = either(parseSkew, parseSkewX, parseSkewY);
}
