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
 * {@link https://drafts.csswg.org/css-color/#specifying-Lab-lch}
 *
 * @public
 */
export class Lab extends Triplet<"lab"> {
  public static of(
    lightness: Number | Percentage<"number">,
    a: Number | Percentage<"number">,
    b: Number | Percentage<"number">,
    alpha: Number | Percentage<"percentage">,
  ): Lab {
    const l = lightness.resolve({ percentageBase: Number.of(100) });
    const aa = a.resolve({ percentageBase: Number.of(125) });
    const bb = b.resolve({ percentageBase: Number.of(125) });

    return new Lab(
      Number.of(
        // Lightness clamping happens at parse time, we can't do it until we've
        // resolved calculations.
        Real.clamp(Number.isNumber(l) ? l.value : l.value * 100, 0, 100),
      ),
      Number.isNumber(aa) ? aa : Number.of(aa.value * 125),
      Number.isNumber(bb) ? bb : Number.of(bb.value * 125),
      alpha.resolve(),
    );
  }

  private readonly _lightness: Lab.Component;
  private readonly _a: Lab.Component;
  private readonly _b: Lab.Component;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    lightness: Lab.Component,
    a: Lab.Component,
    b: Lab.Component,
    alpha: Triplet.Alpha,
  ) {
    super("lab", alpha);
    this._lightness = lightness;
    this._a = a;
    this._b = b;

    const [red, green, blue] = CIE.labToRgb([
      lightness.value,
      a.value,
      b.value,
    ]);

    this._red = Percentage.of<"percentage">(red);
    this._green = Percentage.of<"percentage">(green);
    this._blue = Percentage.of<"percentage">(blue);
  }

  public get lightness(): Lab.Component {
    return this._lightness;
  }

  public get a(): Lab.Component {
    return this._a;
  }

  public get b(): Lab.Component {
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
      value instanceof Lab &&
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

  public toJSON(): Lab.JSON {
    return {
      ...super.toJSON(),
      lightness: this._lightness.toJSON(),
      a: this._a.toJSON(),
      b: this._b.toJSON(),
    };
  }

  public toString(): string {
    return `lab(${this._lightness} ${this._a} ${this._b} ${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace Lab {
  export interface JSON extends Triplet.JSON<"lab"> {
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

  export function isLab(value: unknown): value is Lab {
    return value instanceof Lab;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<Lab> = map(
    Function.parse(
      "lab",
      Triplet.parseTriplet([
        either(Percentage.parse<"percentage">, Number.parse),
      ]),
    ),
    ([, [lightness, a, b, alpha]]) => Lab.of(lightness, a, b, alpha),
  );
}
