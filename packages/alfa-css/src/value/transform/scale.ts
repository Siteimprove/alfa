import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction } from "../../syntax/index.js";

import { List } from "../collection/index.js";
import { Number } from "../numeric/index.js";
import type { Resolvable } from "../resolvable.js";

import { Function } from "./function.js";

const { map, either } = Parser;

/**
 * @public
 */
export class Scale
  extends Function<"scale", false>
  implements Resolvable<Scale.Canonical, never>
{
  public static of(x: Number, y: Number): Scale {
    return new Scale(x.resolve(), y.resolve());
  }

  private readonly _x: Number.Canonical;
  private readonly _y: Number.Canonical;

  private constructor(x: Number.Canonical, y: Number.Canonical) {
    super("scale", false);
    this._x = x;
    this._y = y;
  }

  public get kind(): "scale" {
    return "scale";
  }

  public get x(): Number.Canonical {
    return this._x;
  }

  public get y(): Number.Canonical {
    return this._y;
  }

  public resolve(): Scale {
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
    x: Number.Fixed.JSON;
    y: Number.Fixed.JSON;
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
      map(List.parseCommaSeparated(Number.parse, 1, 2), (list) => list.values),
    ),
    ([_, [x, y]]) => Scale.of(x, y ?? x),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scalex}
   */
  const parseScaleX = map(CSSFunction.parse("scaleX", Number.parse), ([_, x]) =>
    Scale.of(x, Number.of(1)),
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-scaley}
   */
  const parseScaleY = map(CSSFunction.parse("scaleY", Number.parse), ([_, y]) =>
    Scale.of(Number.of(1), y),
  );

  export const parse = either(parseScale, parseScaleX, parseScaleY);
}
