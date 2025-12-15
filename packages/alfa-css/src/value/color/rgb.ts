import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser } from "../../syntax/index.js";

import { Number, Percentage } from "../numeric/index.js";

import { Format } from "./format.js";
import { Triplet } from "./triplet.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-color/#rgb-functions}
 *
 * @public
 */
export class RGB extends Triplet<"rgb"> {
  public static of(
    red: Number | Percentage<"percentage">,
    green: Number | Percentage<"percentage">,
    blue: Number | Percentage<"percentage">,
    alpha: Number | Percentage<"percentage">,
  ): RGB {
    return new RGB(
      red.resolve(),
      green.resolve(),
      blue.resolve(),
      alpha.resolve(),
    );
  }

  private readonly _red: RGB.Component;
  private readonly _green: RGB.Component;
  private readonly _blue: RGB.Component;

  protected constructor(
    red: RGB.Component,
    green: RGB.Component,
    blue: RGB.Component,
    alpha: Triplet.Alpha,
  ) {
    super("rgb", alpha);
    this._red = red;
    this._green = green;
    this._blue = blue;
  }

  public get red(): RGB.Component {
    return this._red;
  }

  public get green(): RGB.Component {
    return this._green;
  }

  public get blue(): RGB.Component {
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
  export type Canonical = RGB;

  /** @internal */
  export type Component = Number.Canonical | Percentage.Canonical;

  export interface JSON extends Triplet.JSON<"rgb"> {
    red: Number.Fixed.JSON | Percentage.Fixed.JSON;
    green: Number.Fixed.JSON | Percentage.Fixed.JSON;
    blue: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  export function isRGB(value: unknown): value is RGB {
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
