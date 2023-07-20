import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../syntax";
import { List } from "../collection";

import { Length, LengthPercentage, Percentage } from "../numeric";

import { Function } from "./function";

const { map, either, parseIf } = Parser;

/**
 * @public
 */
export class Translate<
  X extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed,
  Y extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed,
  Z extends Length.Fixed = Length.Fixed
> extends Function<"translate"> {
  public static of<
    X extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed,
    Y extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed,
    Z extends Length.Fixed = Length.Fixed
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return new Translate(x, y, z);
  }

  private readonly _x: X;
  private readonly _y: Y;
  private readonly _z: Z;

  private constructor(x: X, y: Y, z: Z) {
    super("translate", false);
    this._x = x;
    this._y = y;
    this._z = z;
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

  public resolve(): Translate<X, Y, Z> {
    return this;
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
      ...super.toJSON(),
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
  export type Canonical = Translate<
    Length.Canonical | Percentage.Canonical,
    Length.Canonical | Percentage.Canonical,
    Length.Canonical
  >;

  export interface JSON extends Function.JSON<"translate"> {
    x: Length.Fixed.JSON | Percentage.Fixed.JSON;
    y: Length.Fixed.JSON | Percentage.Fixed.JSON;
    z: Length.Fixed.JSON;
  }

  export function isTranslate<
    X extends Length.Fixed | Percentage.Fixed,
    Y extends Length.Fixed | Percentage.Fixed,
    Z extends Length.Fixed
  >(value: unknown): value is Translate<X, Y, Z> {
    return value instanceof Translate;
  }

  const _0 = Length.of(0, "px");

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translate}
   */
  const parseTranslate = map(
    CSSFunction.parse(
      "translate",
      map(
        List.parseCommaSeparated(
          either(Length.parseBase, Percentage.parseBase),
          1,
          2
        ),
        (list) => list.values
      )
    ),

    ([_, [x, y]]) => Translate.of(x, y ?? _0, _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatex}
   */
  const parseTranslateX = map(
    CSSFunction.parse(
      "translateX",
      either(Length.parseBase, Percentage.parseBase)
    ),
    ([_, x]) => Translate.of(x, _0, _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatey}
   */
  const parseTranslateY = map(
    CSSFunction.parse(
      "translateY",
      either(Length.parseBase, Percentage.parseBase)
    ),
    ([_, y]) => Translate.of(_0, y, _0)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-translatez}
   */
  const parseTranslateZ = map(
    CSSFunction.parse("translateZ", Length.parseBase),
    ([_, z]) => Translate.of(_0, _0, z)
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-translate3d}
   */
  const parseTranslate3d = map(
    CSSFunction.parse(
      "translate3d",
      parseIf(
        (values: ReadonlyArray<LengthPercentage>) => Length.isLength(values[2]),
        map(
          List.parseCommaSeparated(
            either(Length.parseBase, Percentage.parseBase),
            3,
            3
          ),
          (list) => list.values
        ),
        () => "The z component of translate3d must be a length"
      )
    ),
    // The type of z is ensured by parseIf.
    ([_, [x, y, z]]) => Translate.of(x, y, z as Length.Fixed)
  );

  export const parse: CSSParser<Translate> = either(
    parseTranslate,
    parseTranslateX,
    parseTranslateY,
    parseTranslateZ,
    parseTranslate3d
  );
}
