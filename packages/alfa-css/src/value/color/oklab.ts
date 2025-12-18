import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Number, Percentage } from "../numeric/index.js";

import { CIE } from "./converters.js";
import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-color/#specifying-oklab-oklch}
 *
 * @public
 */
export class Oklab extends Triplet<"oklab"> {
  public static of(
    lightness: Number | Percentage<"number">,
    a: Number | Percentage<"number">,
    b: Number | Percentage<"number">,
    alpha: Number | Percentage<"percentage">,
  ): Oklab {
    const l = lightness.resolve();
    const aa = a.resolve({ percentageBase: Number.of(0.4) });
    const bb = b.resolve({ percentageBase: Number.of(0.4) });

    return new Oklab(
      Number.of(
        // Lightness clamping happens at parse time, we can't do it until we've
        // resolved calculations.
        Real.clamp(l.value, 0, 1),
      ),
      Number.isNumber(aa) ? aa : Number.of(aa.value * 0.4),
      Number.isNumber(bb) ? bb : Number.of(bb.value * 0.4),
      alpha.resolve(),
    );
  }

  private readonly _lightness: Oklab.Component;
  private readonly _a: Oklab.Component;
  private readonly _b: Oklab.Component;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    lightness: Oklab.Component,
    a: Oklab.Component,
    b: Oklab.Component,
    alpha: Triplet.Alpha,
  ) {
    super("oklab", alpha);
    this._lightness = lightness;
    this._a = a;
    this._b = b;

    const [red, green, blue] = CIE.oklabToRgb([
      lightness.value,
      a.value,
      b.value,
    ]);

    this._red = Percentage.of<"percentage">(red);
    this._green = Percentage.of<"percentage">(green);
    this._blue = Percentage.of<"percentage">(blue);
  }

  public get lightness(): Oklab.Component {
    return this._lightness;
  }

  public get a(): Oklab.Component {
    return this._a;
  }

  public get b(): Oklab.Component {
    return this._b;
  }

  public get red(): Percentage.Canonical {
    return this._red;
  }

  public get green(): Percentage.Canonical {
    return this._green;
  }

  public get blue(): Percentage.Canonical {
    return this._blue;
  }

  public resolve(): RGB.Canonical {
    return RGB.of(
      ...Format.resolve(this.red, this.green, this.blue, this.alpha),
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Oklab &&
      value._lightness.equals(this._lightness) &&
      value._a.equals(this._a) &&
      value._b.equals(this._b) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._lightness)
      .writeHashable(this._a)
      .writeHashable(this._b)
      .writeHashable(this._alpha);
  }

  public toJSON(): Oklab.JSON {
    return {
      ...super.toJSON(),
      lightness: this._lightness.toJSON(),
      a: this._a.toJSON(),
      b: this._b.toJSON(),
    };
  }

  public toString(): string {
    return `oklab(${this._lightness} ${this._a} ${this._b} ${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace Oklab {
  export interface JSON extends Triplet.JSON<"oklab"> {
    lightness: Number.Fixed.JSON;
    a: Number.Fixed.JSON;
    b: Number.Fixed.JSON;
  }

  /**
   * Since the percentages are not 1-based, we rather use numbers to avoid
   * miss-scaling when we use the values.
   *
   * @internal
   */
  export type Component = Number.Canonical;

  export function isLab(value: unknown): value is Oklab {
    return value instanceof Oklab;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<Oklab> = map(
    Function.parse(
      "oklab",
      Triplet.parseTriplet([
        either(Percentage.parse<"percentage">, Number.parse),
      ]),
    ),
    ([, [lightness, a, b, alpha]]) => Oklab.of(lightness, a, b, alpha),
  );
}
