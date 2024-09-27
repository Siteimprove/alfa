import type { Hash } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction } from "../../syntax/index.js";

import { List } from "../collection/index.js";
import { Number, Percentage } from "../numeric/index.js";
import type { Resolvable } from "../resolvable.js";

import { Function } from "./function.js";

const { map, either } = Parser;

// We cannot easily use Resolvable.Resolved because Percentage may resolve to
// anything depending on the base, here we want to keep them as percentages.
type ToCanonical<T extends Number | Percentage<"percentage">> = T extends Number
  ? Number.Canonical
  : T extends Percentage
    ? Percentage.Canonical
    : Number.Canonical | Percentage.Canonical;

/**
 * Class representing a transformation that resizes an element in either 2D or 3D space.
 * Is parsed from either a scale() or scale3d() transform function or a value of the scale property.
 *
 * @public
 */
export class Scale<
    X extends Number.Canonical | Percentage.Canonical =
      | Number.Canonical
      | Percentage.Fixed<"percentage">,
    Y extends Number.Canonical | Percentage.Canonical =
      | Number.Canonical
      | Percentage.Fixed<"percentage">,
    Z extends Number.Canonical | Percentage.Canonical =
      | Number.Canonical
      | Percentage.Fixed<"percentage">,
  >
  extends Function<"scale", false>
  implements Resolvable<Scale.Canonical, never>
{
  public static of<
    X extends Number.Canonical | Percentage.Canonical,
    Y extends Number.Canonical | Percentage.Canonical,
  >(x: X, y: Y): Scale<X, Y, never>;

  public static of<
    X extends Number | Percentage<"percentage">,
    Y extends Number | Percentage<"percentage">,
  >(x: X, y: Y): Scale<ToCanonical<X>, ToCanonical<Y>>;

  public static of<
    X extends Number.Canonical | Percentage.Canonical,
    Y extends Number.Canonical | Percentage.Canonical,
    Z extends Number.Canonical | Percentage.Canonical,
  >(x: X, y: Y, z: Z): Scale<X, Y, Z>;

  public static of<
    X extends Number | Percentage<"percentage">,
    Y extends Number | Percentage<"percentage">,
    Z extends Number | Percentage<"percentage">,
  >(x: X, y: Y, z: Z): Scale<ToCanonical<X>, ToCanonical<Y>, ToCanonical<Z>>;

  public static of<
    X extends Number | Percentage<"percentage">,
    Y extends Number | Percentage<"percentage">,
    Z extends Number | Percentage<"percentage">,
  >(x: X, y: Y, z?: Z) {
    return new Scale(x.resolve(), y.resolve(), z?.resolve());
  }

  private readonly _x: X;
  private readonly _y: Y;
  private readonly _z: Option<Z>;

  private constructor(x: X, y: Y, z?: Z) {
    super("scale", false);
    this._x = x;
    this._y = y;
    this._z = Option.from(z);
  }

  public get kind(): "scale" {
    return "scale";
  }

  public get x(): X {
    return this._x;
  }

  public get y(): Y {
    return this._y;
  }

  public get z(): Option<Z> {
    return this._z;
  }

  public resolve(): Scale.Canonical {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Scale &&
      value._x.equals(this._x) &&
      value._y.equals(this._y) &&
      value._z.equals(this._z)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y).writeHashable(this._z);
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
      ...(this._z.isSome() ? { z: this._z.get().toJSON() } : {}),
    };
  }

  public toString(): string {
    if (this._z.isSome()) {
      return `scale3d(${this._x}, ${this._y}, ${this._z})`;
    }

    if (this._x.value === this._y.value) {
      return `scale(${this._x})`;
    }

    if (this._y.value === 1) {
      return `scaleX(${this._x})`;
    }

    if (this._x.value === 1) {
      return `scaleY(${this._y})`;
    }

    return `scale(${this._x}, ${this._y})`;
  }
}

/**
 * @public
 */
export namespace Scale {
  export type Canonical = Scale;

  export interface JSON extends Function.JSON<"scale"> {
    x: Number.Fixed.JSON | Percentage.Fixed.JSON;
    y: Number.Fixed.JSON | Percentage.Fixed.JSON;
    z: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  export function isScale(value: unknown): value is Scale {
    return value instanceof Scale;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scale}
   */
  const parseScaleFunc = map(
    CSSFunction.parse(
      "scale",
      map(
        List.parseCommaSeparated(either(Number.parse, Percentage.parse), 1, 2),
        (list) => list.values,
      ),
    ),
    ([_, [x, y]]) => Scale.of(x, y ?? x),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-scale3d}
   */
  const parseScale3dFunc = map(
    CSSFunction.parse(
      "scale3d",
      map(
        List.parseCommaSeparated(either(Number.parse, Percentage.parse), 3, 3),
        (list) => list.values,
      ),
    ),
    ([_, [x, y, z]]) => Scale.of(x, y, z),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex}
   */
  const parseScaleXFunc = map(
    CSSFunction.parse("scaleX", either(Number.parse, Percentage.parse)),
    ([_, x]) => Scale.of(x, Number.of(1)),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley}
   */
  const parseScaleYFunc = map(
    CSSFunction.parse("scaleY", either(Number.parse, Percentage.parse)),
    ([_, y]) => Scale.of(Number.of(1), y),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-scalez}
   */
  const parseScaleZFunc = map(
    CSSFunction.parse("scaleZ", either(Number.parse, Percentage.parse)),
    ([_, z]) => Scale.of(Number.of(1), Number.of(1), z),
  );

  export const parse = either(
    parseScaleFunc,
    parseScaleXFunc,
    parseScaleYFunc,
    parseScale3dFunc,
    parseScaleZFunc,
  );

  /**
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/scale}
   */
  export const parseProp = map(
    List.parseSpaceSeparated(either(Number.parse, Percentage.parse), 1, 3),
    (list) => {
      const [x, y, z] = list.values;
      return Scale.of(x, y ?? x, z);
    },
  );
}
