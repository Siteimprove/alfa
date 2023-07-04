import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Number, Percentage } from "../numeric";
import type { Value } from "../value";

import { Format } from "./format";

const { pair, map, either, option, left, right, take, delimited } = Parser;

/**
 * @public
 */
export class RGB<
  C extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed,
  A extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed,
  CALC extends boolean = boolean
> extends Format<"rgb", CALC> {
  public static of<
    C extends Number.Fixed | Percentage.Fixed,
    A extends Number.Fixed | Percentage.Fixed
  >(
    red: C,
    green: C,
    blue: C,
    alpha: A
  ): RGB<C, A, Value.HasCalculation<[C, A]>> {
    const calculation = [red, green, blue, alpha].some((value) =>
      value.hasCalculation()
    ) as Value.HasCalculation<[C, A]>;
    return new RGB(red, green, blue, alpha, calculation);
  }

  private readonly _red: C;
  private readonly _green: C;
  private readonly _blue: C;
  private readonly _alpha: A;

  private constructor(red: C, green: C, blue: C, alpha: A, calculation: CALC) {
    super("rgb", calculation);
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
    // @ts-ignore
    return this;
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
  export type Canonical = RGB<
    Percentage.Canonical,
    Percentage.Canonical,
    false
  >;
  export interface JSON extends Format.JSON<"rgb"> {
    red: Number.Fixed.JSON | Percentage.Fixed.JSON;
    green: Number.Fixed.JSON | Percentage.Fixed.JSON;
    blue: Number.Fixed.JSON | Percentage.Fixed.JSON;
    alpha: Number.Fixed.JSON | Percentage.Fixed.JSON;
  }

  export function isRGB<
    C extends Number.Fixed | Percentage.Fixed,
    A extends Number.Fixed | Percentage.Fixed
  >(value: unknown): value is RGB<C, A> {
    return value instanceof RGB;
  }

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-alpha-value}
   */
  const parseAlpha = either(Number.parseBase, Percentage.parseBase);

  const parseLegacyTriplet = <C extends Number.Fixed | Percentage.Fixed>(
    parser: Parser<Slice<Token>, C, string>
  ) =>
    map(
      pair(
        parser,
        take(
          right(
            delimited(option(Token.parseWhitespace), Token.parseComma),
            parser
          ),
          2
        )
      ),
      ([r, [g, b]]) => [r, g, b] as const
    );

  const parseLegacy = pair(
    either(
      parseLegacyTriplet(Percentage.parseBase),
      parseLegacyTriplet(Number.parseBase)
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseComma),
        parseAlpha
      )
    )
  );

  const parseModernTriplet = <C extends Number.Fixed | Percentage.Fixed>(
    parser: Parser<Slice<Token>, C, string>
  ) =>
    map(
      pair(parser, take(right(option(Token.parseWhitespace), parser), 2)),
      ([r, [g, b]]) => [r, g, b] as const
    );

  const parseModern = pair(
    either(
      parseModernTriplet(Percentage.parseBase),
      parseModernTriplet(Number.parseBase)
    ),
    option(
      right(
        delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
        parseAlpha
      )
    )
  );

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-rgb}
   */
  export const parse: Parser<Slice<Token>, RGB, string> = map(
    right(
      Token.parseFunction((fn) => fn.value === "rgb" || fn.value === "rgba"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(parseModern, parseLegacy)
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [[red, green, blue], alpha] = result;

      return RGB.of(
        red,
        green,
        blue,
        alpha.getOrElse(() => Number.of(1))
      );
    }
  );
}
