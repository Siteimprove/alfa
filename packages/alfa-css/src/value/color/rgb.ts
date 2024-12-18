import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import { Keyword } from "../textual/keyword.js";

import { Number, Percentage } from "../numeric/index.js";

import { Format } from "./format.js";

const { pair, map, either, option, right, take, delimited } = Parser;

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
> extends Format<"rgb"> {
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
  private readonly _alpha: A;

  protected constructor(red: C, green: C, blue: C, alpha: A) {
    super("rgb");
    this._red = red;
    this._green = green;
    this._blue = blue;
    this._alpha = alpha;
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

  public get alpha(): A {
    return this._alpha;
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
      alpha: this._alpha.toJSON(),
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

  export interface JSON extends Format.JSON<"rgb"> {
    red: Number.Fixed.JSON | Percentage.Fixed.JSON;
    green: Number.Fixed.JSON | Percentage.Fixed.JSON;
    blue: Number.Fixed.JSON | Percentage.Fixed.JSON;
    alpha: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  export function isRGB<
    C extends Number.Canonical | Percentage.Canonical,
    A extends Number.Canonical | Percentage.Canonical,
  >(value: unknown): value is RGB<C, A> {
    return value instanceof RGB;
  }

  /**
   * @remarks
   * While the three R, G, B components must be either all numbers or all
   * percentage, the alpha component can be either independently.
   *
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlphaLegacy = either(Number.parse, Percentage.parse<"percentage">);
  const parseAlphaModern = either<
    Slice<Token>,
    Number | Percentage<"percentage">,
    string
  >(
    Number.parse,
    Percentage.parse<"percentage">,
    map(Keyword.parse("none"), () => Percentage.of<"percentage">(0)),
  );

  /**
   * Parses either a number/percentage or the keyword "none", reduces "none" to
   * the correct type, or fails if it is not allowed.
   */
  const parseItem = <C extends Number | Percentage<"percentage">>(
    parser: CSSParser<C>,
    ifNone?: C,
  ) =>
    either(
      parser,
      ifNone !== undefined
        ? map(Keyword.parse("none"), () => ifNone)
        : () => Err.of("none is not accepted in legacy rbg syntax"),
    );

  /**
   * Parses 3 items.
   * In legacy syntax, they must be separated by a comma, in modern syntax by
   * whitespace.
   */
  const parseTriplet = <C extends Number | Percentage<"percentage">>(
    parser: CSSParser<C>,
    separator: CSSParser<any>,
    ifNone?: C,
  ) =>
    map(
      pair(
        parseItem(parser, ifNone),
        take(right(separator, parseItem(parser, ifNone)), 2),
      ),
      ([r, [g, b]]) => [r, g, b] as const,
    );

  const parseLegacyTriplet = <C extends Number | Percentage<"percentage">>(
    parser: CSSParser<C>,
  ) =>
    parseTriplet(
      parser,
      delimited(option(Token.parseWhitespace), Token.parseComma),
    );

  const parseLegacy = pair(
    either(
      parseLegacyTriplet(Percentage.parse<"percentage">),
      parseLegacyTriplet(Number.parse),
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseComma),
        parseAlphaLegacy,
      ),
    ),
  );

  const parseModernTriplet = <C extends Number | Percentage<"percentage">>(
    parser: CSSParser<C>,
    ifNone: C,
  ) => parseTriplet(parser, option(Token.parseWhitespace), ifNone);

  const parseModern = pair(
    either(
      parseModernTriplet(Percentage.parse, Percentage.of<"percentage">(0)),
      parseModernTriplet(Number.parse, Number.of(0)),
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
        parseAlphaModern,
      ),
    ),
  );

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-rgb}
   */
  export const parse: CSSParser<RGB> = map(
    Function.parse(
      (fn) => fn.value === "rgb" || fn.value === "rgba",
      either(parseLegacy, parseModern),
    ),
    (result) => {
      const [, [[red, green, blue], alpha]] = result;

      return RGB.of(
        red,
        green,
        blue,
        alpha.getOrElse(() => Number.of(1)),
      );
    },
  );
}
