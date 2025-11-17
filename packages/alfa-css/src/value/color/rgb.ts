import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Number, Percentage } from "../numeric/index.js";

import { Format } from "./format.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

// We cannot easily use Resolvable.Resolved because Percentage may resolve to
// anything depending on the base, here we want to keep them as percentages.
type ToCanonical<T extends Number | Percentage<"percentage">> = T extends Number
  ? Number.Canonical
  : T extends Percentage
    ? Percentage.Canonical
    : Number.Canonical | Percentage.Canonical;

/**
 * @public
 */
export class RGB<
  // These should actually use the aliases `Percentage.Canonical` instead.
  // However, that triggers
  // error TS2589: Type instantiation is excessively deep and possibly infinite.
  // in an unrelated place.
  // We are likely very close to the TS instantiation limit, and using aliases
  // triggers it.
  // This is probably a combination of the fact that percentages can resolve to
  // different things (creating more instantiations?) and the "color[]" type in
  // alfa-rules Questions that also get instantiated a lot (?) There might be
  // some combinatorics explosion of instantiations leading to this, especially
  // in nested interviews (?) It might be possible to solve it by giving the
  // correct depth indication to TS at interview build time and ease the
  // instantiation process (?)
  C extends Number.Canonical | Percentage.Canonical =
    | Number.Canonical
    | Percentage.Fixed<"percentage">,
  A extends Number.Canonical | Percentage.Canonical =
    | Number.Canonical
    | Percentage.Fixed<"percentage">,
> extends Triplet<"rgb", A> {
  public static of<
    C extends Number.Canonical | Percentage.Canonical,
    A extends Number.Canonical | Percentage.Canonical,
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A>;

  public static of<
    C extends Number | Percentage<"percentage">,
    A extends Number | Percentage<"percentage">,
  >(red: C, green: C, blue: C, alpha: A): RGB<ToCanonical<C>, ToCanonical<A>>;

  public static of<
    C extends Number | Percentage<"percentage">,
    A extends Number | Percentage<"percentage">,
  >(red: C, green: C, blue: C, alpha: A): RGB<ToCanonical<C>, ToCanonical<A>> {
    return new RGB(
      red.resolve() as ToCanonical<C>,
      green.resolve() as ToCanonical<C>,
      blue.resolve() as ToCanonical<C>,
      alpha.resolve() as ToCanonical<A>,
    );
  }

  private readonly _red: C;
  private readonly _green: C;
  private readonly _blue: C;

  protected constructor(red: C, green: C, blue: C, alpha: A) {
    super("rgb", alpha);
    this._red = red;
    this._green = green;
    this._blue = blue;
  }

  public get red(): C {
    return this._red;
  }

  public get green(): C {
    return this._green;
  }

  public get blue(): C {
    return this._blue;
  }

  public resolve(): RGB.Canonical {
    return new RGB(
      ...Format.resolve(this._red, this._green, this._blue, this._alpha),
    );
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof RGB &&
      value._red.equals(this._red) &&
      value._green.equals(this._green) &&
      value._blue.equals(this._blue) &&
      value._alpha.equals(this._alpha)
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._red)
      .writeHashable(this._green)
      .writeHashable(this._blue)
      .writeHashable(this._alpha);
  }

  public toJSON(): RGB.JSON {
    return {
      ...super.toJSON(),
      red: this._red.toJSON(),
      green: this._green.toJSON(),
      blue: this._blue.toJSON(),
    };
  }

  public toString(): string {
    return `rgb(${this._red} ${this._green} ${this._blue}${
      this._alpha.value === 1 ? "" : ` / ${this._alpha}`
    })`;
  }
}

/**
 * @public
 */
export namespace RGB {
  export type Canonical = RGB<Percentage.Canonical, Percentage.Canonical>;

  export interface JSON extends Triplet.JSON<"rgb"> {
    red: Number.Fixed.JSON | Percentage.Fixed.JSON;
    green: Number.Fixed.JSON | Percentage.Fixed.JSON;
    blue: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  export function isRGB<
    C extends Number.Canonical | Percentage.Canonical,
    A extends Number.Canonical | Percentage.Canonical,
  >(value: unknown): value is RGB<C, A> {
    return value instanceof RGB;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-rgb}
   */
  export const parse: CSSParser<RGB> = map(
    Function.parse(
      ["rgb", "rgba"],
      either(
        // Legacy syntax with percentage
        Triplet.parseTriplet([Percentage.parse<"percentage">], true),
        // Legacy syntax with number
        Triplet.parseTriplet([Number.parse], true),
        // Modern syntax
        Triplet.parseTriplet([either(Percentage.parse, Number.parse)]),
      ),
    ),
    ([, [red, green, blue, alpha]]) => RGB.of(red, green, blue, alpha),
  );
}
