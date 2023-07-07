import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Function, Token } from "../../syntax";
import { Keyword } from "../keyword";

import { Number, Percentage } from "../numeric";

import { Format } from "./format";

const { pair, map, either, option, right, take, delimited } = Parser;

// We cannot easily use Resolvable.Resolved because Percentage may resolve to
// anything depending on the base, here we want to keep them as percentages.
type ToCanonical<T extends Number | Percentage> = T extends Number
  ? Number.Canonical
  : T extends Percentage
  ? Percentage.Canonical
  : Number.Canonical | Percentage.Canonical;

/**
 * @public
 */
export class RGB<
  // These should actually use the aliases `.Canonical` instead.
  // However, that triggers
  // error TS2589: Type instantiation is excessively deep and possibly infinite.
  // in an unrelated place.
  // We are likely very close to the TS instantiation limit, and using aliases
  // triggers it.
  C extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed,
  A extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed
> extends Format<"rgb"> {
  public static of<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(red: C, green: C, blue: C, alpha: A): RGB<ToCanonical<C>, ToCanonical<A>> {
    return new RGB(
      red.resolve() as ToCanonical<C>,
      green.resolve() as ToCanonical<C>,
      blue.resolve() as ToCanonical<C>,
      alpha.resolve() as ToCanonical<A>
    );
  }

  private readonly _red: C;
  private readonly _green: C;
  private readonly _blue: C;
  private readonly _alpha: A;

  private constructor(red: C, green: C, blue: C, alpha: A) {
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
      ...Format.resolve(this._red, this._green, this._blue, this._alpha)
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
    A extends Number.Canonical | Percentage.Canonical
  >(value: unknown): value is RGB<C, A> {
    return value instanceof RGB;
  }

  /**
   * @remarks
   * While the three R, G, B component must be either all numbers or all
   * percentage, the alpha component can be either independently.
   *
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlphaLegacy = either(Number.parse, Percentage.parse);
  const parseAlphaModern = either<Slice<Token>, Number | Percentage, string>(
    Number.parse,
    Percentage.parse,
    map(Keyword.parse("none"), () => Number.of(0))
  );

  /**
   * Parses either a number/percentage or the keyword "none", reduce "none" to
   * the correct type, or fail if it is not allowed.
   */
  const parseItem = <C extends Number | Percentage>(
    parser: Parser<Slice<Token>, C, string>,
    ifNone?: C
  ) =>
    either(
      parser,
      ifNone !== undefined
        ? map(Keyword.parse("none"), () => ifNone)
        : () => Err.of("none is not accepted in legacy rbg syntax")
    );

  /**
   * Parses 3 items.
   * In legacy syntax, they must be separated by a comma, in modern syntax by
   * whitespace.
   */
  const parseTriplet = <C extends Number | Percentage>(
    parser: Parser<Slice<Token>, C, string>,
    separator: Parser<Slice<Token>, any, string>,
    ifNone?: C
  ) =>
    map(
      pair(
        parseItem(parser, ifNone),
        take(right(separator, parseItem(parser, ifNone)), 2)
      ),
      ([r, [g, b]]) => [r, g, b] as const
    );

  const parseLegacyTriplet = <C extends Number | Percentage>(
    parser: Parser<Slice<Token>, C, string>
  ) =>
    parseTriplet(
      parser,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    );

  const parseLegacy = pair(
    either(
      parseLegacyTriplet(Percentage.parse),
      parseLegacyTriplet(Number.parse)
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseComma),
        parseAlphaLegacy
      )
    )
  );

  const parseModernTriplet = <C extends Number | Percentage>(
    parser: Parser<Slice<Token>, C, string>,
    ifNone: C
  ) => parseTriplet(parser, option(Token.parseWhitespace), ifNone);

  const parseModern = pair(
    either(
      parseModernTriplet(Percentage.parse, Percentage.of(0)),
      parseModernTriplet(Number.parse, Number.of(0))
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
        parseAlphaModern
      )
    )
  );

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-rgb}
   */
  export const parse: Parser<Slice<Token>, RGB, string> = map(
    Function.parse(
      (fn) => fn.value === "rgb" || fn.value === "rgba",
      either(parseLegacy, parseModern)
    ),
    (result) => {
      const [, [[red, green, blue], alpha]] = result;

      return RGB.of(
        red,
        green,
        blue,
        alpha.getOrElse(() => Number.of(1))
      );
    }
  );
}
