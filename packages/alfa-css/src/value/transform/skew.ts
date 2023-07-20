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
  export type Canonical = Skew<Angle.Canonical, Angle.Canonical>;
  export interface JSON extends Function.JSON<"skew"> {
    x: Angle.Fixed.JSON;
    y: Angle.Fixed.JSON;
  }

  export function isSkew<X extends Angle.Fixed, Y extends Angle.Fixed>(
    value: unknown
  ): value is Skew<X, Y> {
    return value instanceof Skew;
  }

  const _0 = Angle.of(0, "deg");

  const parseAngleOrZero = either(
    Angle.parseBase,
    map(Number.parseZero, () => _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skew}
   */
  const parseSkew = map(
    CSSFunction.parse(
      "skew",
      map(
        List.parseCommaSeparated(parseAngleOrZero, 1, 2),
        (list) => list.values
      )
    ),
    ([_, [x, y]]) => Skew.of(x, y ?? _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewx}
   */
  const parseSkewX = map(
    CSSFunction.parse("skewX", parseAngleOrZero),
    ([_, x]) => Skew.of(x, _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-skewy}
   */
  const parseSkewY = map(
    CSSFunction.parse("skewY", parseAngleOrZero),
    ([_, y]) => Skew.of(_0, y)
  );

  export const parse: CSSParser<Skew> = either(
    parseSkew,
    parseSkewX,
    parseSkewY
  );
}
