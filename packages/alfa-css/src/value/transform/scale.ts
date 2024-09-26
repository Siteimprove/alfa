import type { Hash } from "@siteimprove/alfa-hash";
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
 * Class representing either a scale() function value of the transform property or the value of the scale property.
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
  >
  extends Function<"scale", false>
  implements Resolvable<Scale.Canonical, never>
{
  public static of<
    X extends Number.Canonical | Percentage.Canonical,
    Y extends Percentage.Canonical,
  >(x: X, y: Y): Scale<X, Y>;

  public static of<
    X extends Number | Percentage<"percentage">,
    Y extends Number | Percentage<"percentage">,
  >(x: X, y: Y): Scale<ToCanonical<X>, ToCanonical<Y>>;

  public static of<
    X extends Number | Percentage<"percentage">,
    Y extends Number | Percentage<"percentage">,
  >(x: X, y: Y) {
    return new Scale(
      x.resolve() as ToCanonical<X>,
      y.resolve() as ToCanonical<Y>,
    );
  }

  private readonly _x: X;
  private readonly _y: Y;

  private constructor(x: X, y: Y) {
    super("scale", false);
    this._x = x;
    this._y = y;
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

  public resolve(): Scale.Canonical {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Scale &&
      value._x.equals(this._x) &&
      value._y.equals(this._y)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._x).writeHashable(this._y);
  }

  public toJSON(): Scale.JSON {
    return {
      ...super.toJSON(),
      x: this._x.toJSON(),
      y: this._y.toJSON(),
    };
  }

  public toString(): string {
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
  }

  export function isScale(value: unknown): value is Scale {
    return value instanceof Scale;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scale}
   */
  const parseScale = map(
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
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex}
   */
  const parseScaleX = map(
    CSSFunction.parse("scaleX", either(Number.parse, Percentage.parse)),
    ([_, x]) => Scale.of(x, Number.of(1)),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley}
   */
  const parseScaleY = map(
    CSSFunction.parse("scaleY", either(Number.parse, Percentage.parse)),
    ([_, y]) => Scale.of(Number.of(1), y),
  );

  export const parse = either(parseScale, parseScaleX, parseScaleY);
}
