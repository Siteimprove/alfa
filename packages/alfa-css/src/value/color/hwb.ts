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

// We cannot easily use Resolvable.Resolved because Percentage may resolve to
// anything depending on the base, here we want to keep them as percentages.
type ToCanonical<T extends Angle | Number | Percentage<"percentage">> =
  T extends Angle
    ? Angle.Canonical
    : T extends Number
      ? Number.Canonical
      : T extends Percentage
        ? Percentage.Canonical
        : Angle.Canonical | Number.Canonical | Percentage.Canonical;

/**
 * {@link https://drafts.csswg.org/css-color/#the-hwb-notation}
 *
 * @public
 */
export class HWB<
  H extends Number.Fixed | Angle.Fixed = Number.Fixed | Angle.Fixed,
  A extends Number.Fixed | Percentage.Fixed<"percentage"> =
    | Number.Fixed
    | Percentage.Fixed<"percentage">,
> extends Triplet<"hwb", A> {
  public static of<
    H extends Number.Canonical | Angle.Canonical,
    A extends Number.Canonical | Percentage.Canonical,
    W extends Percentage<"percentage">,
    B extends Percentage<"percentage">,
  >(hue: H, whiteness: W, blackness: B, alpha: A): HWB<H, A>;

  public static of<
    H extends Number | Angle,
    A extends Number | Percentage<"percentage">,
    W extends Percentage<"percentage">,
    B extends Percentage<"percentage">,
  >(
    hue: H,
    whiteness: W,
    blackness: B,
    alpha: A,
  ): HWB<ToCanonical<H>, ToCanonical<A>>;

  public static of<
    H extends Number | Angle,
    A extends Number | Percentage<"percentage">,
    W extends Percentage<"percentage">,
    B extends Percentage<"percentage">,
  >(
    hue: H,
    whiteness: W,
    blackness: B,
    alpha: A,
  ): HWB<ToCanonical<H>, ToCanonical<A>> {
    return new HWB(
      hue.resolve() as ToCanonical<H>,
      whiteness.resolve(),
      blackness.resolve(),
      alpha.resolve() as ToCanonical<A>,
    );
  }

  private readonly _hue: H;
  private readonly _whiteness: Percentage.Canonical;
  private readonly _blackness: Percentage.Canonical;
  private readonly _red: Percentage.Canonical;
  private readonly _green: Percentage.Canonical;
  private readonly _blue: Percentage.Canonical;

  protected constructor(
    hue: H,
    whiteness: Percentage.Canonical,
    blackness: Percentage.Canonical,
    alpha: A,
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

  public get hue(): H {
    return this._hue;
  }

  public get whiteness(): Percentage.Canonical {
    return this._whiteness;
  }

  public get blackness(): Percentage.Canonical {
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

  export function isHWB<
    H extends Number.Fixed | Angle.Fixed,
    A extends Number.Fixed | Percentage.Fixed,
  >(value: unknown): value is HWB<H, A> {
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
