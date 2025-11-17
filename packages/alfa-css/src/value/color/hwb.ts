import type { Hash } from "@siteimprove/alfa-hash";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Angle, Number, Percentage } from "../numeric/index.js";
import { hwbToRgb } from "./converters.js";

import { Format } from "./format.js";
import { RGB } from "./rgb.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-color/#the-hwb-notation}
 *
 * @public
 */
export class HWB extends Triplet<"hwb"> {
  public static of(
    hue: Number | Angle,
    whiteness: Percentage<"percentage">,
    blackness: Percentage<"percentage">,
    alpha: Number | Percentage<"percentage">,
  ): HWB {
    return new HWB(
      hue.resolve(),
      whiteness.resolve(),
      blackness.resolve(),
      alpha.resolve(),
    );
  }

  private readonly _hue: HWB.Hue;
  private readonly _whiteness: HWB.Component;
  private readonly _blackness: HWB.Component;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    hue: HWB.Hue,
    whiteness: HWB.Component,
    blackness: HWB.Component,
    alpha: Triplet.Alpha,
  ) {
    super("hwb", alpha);
    this._hue = hue;
    this._whiteness = whiteness;
    this._blackness = blackness;

    const degrees = Angle.isAngle(hue) ? hue.withUnit("deg").value : hue.value;

    const [red, green, blue] = hwbToRgb(
      Real.modulo(degrees, 360),
      whiteness.value,
      blackness.value,
    );

    this._red = Percentage.of<"percentage">(red);
    this._green = Percentage.of<"percentage">(green);
    this._blue = Percentage.of<"percentage">(blue);
  }

  public get hue(): HWB.Hue {
    return this._hue;
  }

  public get whiteness(): HWB.Component {
    return this._whiteness;
  }

  public get blackness(): HWB.Component {
    return this._blackness;
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
      value instanceof HWB &&
      value._hue.equals(this._hue) &&
      value._whiteness.equals(this._whiteness) &&
      value._blackness.equals(this._blackness) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._hue)
      .writeHashable(this._whiteness)
      .writeHashable(this._blackness)
      .writeHashable(this._alpha);
  }

  public toJSON(): HWB.JSON {
    return {
      ...super.toJSON(),
      hue: this._hue.toJSON(),
      whiteness: this._whiteness.toJSON(),
      blackness: this._blackness.toJSON(),
    };
  }

  public toString(): string {
    return `hsl(${this._hue} ${this._whiteness} ${this._blackness}${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace HWB {
  export interface JSON extends Triplet.JSON<"hwb"> {
    hue: Number.Fixed.JSON | Angle.Fixed.JSON;
    whiteness: Percentage.Fixed.JSON;
    blackness: Percentage.Fixed.JSON;
  }

  /** @internal */
  export type Hue = Number.Canonical | Angle.Canonical;
  /** @internal */
  export type Component = Percentage.Canonical;

  export function isHWB(value: unknown): value is HWB {
    return value instanceof HWB;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-hue}
   */
  const parseHue = either(Number.parse, Angle.parse);

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-hsl}
   */
  export const parse: CSSParser<HWB> = map(
    Function.parse(
      "hwb",
      Triplet.parseTriplet([parseHue, Percentage.parse<"percentage">]),
    ),
    ([, [hue, whiteness, blackness, alpha]]) =>
      HWB.of(hue, whiteness, blackness, alpha),
  );
}
