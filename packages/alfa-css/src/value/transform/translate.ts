import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../syntax";
import { Unit } from "../../unit";
import { List } from "../collection";

import { Length, LengthPercentage, Numeric } from "../numeric";
import { PartiallyResolvable, Resolvable } from "../resolvable";
import { Value } from "../value";

import { Function } from "./function";

const { map, either, parseIf } = Parser;

/**
 * @public
 */
export class Translate<
    X extends LengthPercentage = LengthPercentage,
    Y extends LengthPercentage = LengthPercentage,
    Z extends Length = Length,
  >
  extends Function<"translate", Value.HasCalculation<[X, Y, Z]>>
  implements
    Resolvable<Translate.Canonical, Translate.Resolver>,
    PartiallyResolvable<Translate.PartiallyResolved, Translate.PartialResolver>
{
  public static of<
    X extends LengthPercentage = LengthPercentage,
    Y extends LengthPercentage = LengthPercentage,
    Z extends Length = Length,
  >(x: X, y: Y, z: Z): Translate<X, Y, Z> {
    return new Translate(x, y, z);
  }

  private readonly _x: X;
  private readonly _y: Y;
  private readonly _z: Z;

  private constructor(x: X, y: Y, z: Z) {
    super("translate", Value.hasCalculation(x, y, z));
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

  public resolve(resolver: Translate.Resolver): Translate.Canonical {
    return new Translate(
      LengthPercentage.resolve(resolver)(this._x),
      LengthPercentage.resolve(resolver)(this._y),
      this._z.resolve(resolver),
    );
  }

  public partiallyResolve(
    resolver: Translate.PartialResolver,
  ): Translate.PartiallyResolved {
    return new Translate(
      LengthPercentage.partiallyResolve(resolver)(this._x),
      LengthPercentage.partiallyResolve(resolver)(this._x),
      this._z.resolve(resolver),
    );
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
    if (!this._z.hasCalculation() && Numeric.isZero(this._z)) {
      return `translate(${this._x}${
        !this._y.hasCalculation() && Numeric.isZero(this._y)
          ? ""
          : `, ${this._y}`
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
    LengthPercentage.Canonical,
    LengthPercentage.Canonical,
    Length.Canonical
  >;

  export type PartiallyResolved = Translate<
    LengthPercentage.PartiallyResolved,
    LengthPercentage.PartiallyResolved,
    Length.Canonical
  >;

  export interface JSON extends Function.JSON<"translate"> {
    x: LengthPercentage.JSON;
    y: LengthPercentage.JSON;
    z: Length.JSON;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = LengthPercentage.PartialResolver &
    Length.Resolver;

  export function isTranslate<
    X extends LengthPercentage,
    Y extends LengthPercentage,
    Z extends Length,
  >(value: unknown): value is Translate<X, Y, Z> {
    return value instanceof Translate;
  }

  const _0 = Length.of(0, Unit.Length.Canonical);

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translate}
   */
  const parseTranslate = map(
    CSSFunction.parse(
      "translate",
      map(
        List.parseCommaSeparated(LengthPercentage.parse, 1, 2),
        (list) => list.values,
      ),
    ),

    ([_, [x, y]]) => Translate.of(x, y ?? _0, _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatex}
   */
  const parseTranslateX = map(
    CSSFunction.parse("translateX", LengthPercentage.parse),
    ([_, x]) => Translate.of(x, _0, _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-translatey}
   */
  const parseTranslateY = map(
    CSSFunction.parse("translateY", LengthPercentage.parse),
    ([_, y]) => Translate.of(_0, y, _0),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-translatez}
   */
  const parseTranslateZ: CSSParser<Translate> = map(
    CSSFunction.parse("translateZ", Length.parse),
    ([_, z]) => Translate.of(_0, _0, z),
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
          List.parseCommaSeparated(LengthPercentage.parse, 3, 3),
          (list) => list.values,
        ),
        () => "The z component of translate3d must be a length",
      ),
    ),
    // The type of z is ensured by parseIf.
    ([_, [x, y, z]]) => Translate.of(x, y, z as Length),
  );

  export const parse: CSSParser<Translate> = either(
    parseTranslate,
    parseTranslateX,
    parseTranslateY,
    parseTranslateZ,
    parseTranslate3d,
  );
}
