import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";

import { Number, Percentage } from "../numeric";

import { Format } from "./format";

const { pair, map, either, option, left, right, take, delimited } = Parser;

/**
 * @public
 */
export class RGB<
  C extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed,
  A extends Number.Fixed | Percentage.Fixed = Number.Fixed | Percentage.Fixed
> extends Format<"rgb"> {
  public static of<
    C extends Number.Fixed | Percentage.Fixed,
    A extends Number.Fixed | Percentage.Fixed
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return new RGB(red, green, blue, alpha);
  }

  private readonly _red: C;
  private readonly _green: C;
  private readonly _blue: C;
  private readonly _alpha: A;

  private constructor(red: C, green: C, blue: C, alpha: A) {
    super("rgb", false);
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

  public resolve(): RGB<C, A> {
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

  /**
   * {@link https://drafts.csswg.org/css-color/#funcdef-rgb}
   */
  export const parse: Parser<Slice<Token>, RGB, string> = map(
    right(
      Token.parseFunction((fn) => fn.value === "rgb" || fn.value === "rgba"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(
            pair(
              either(
                pair(
                  Percentage.parseBase,
                  take(
                    right(option(Token.parseWhitespace), Percentage.parseBase),
                    2
                  )
                ),
                pair(
                  Number.parseBase,
                  take(
                    right(option(Token.parseWhitespace), Number.parseBase),
                    2
                  )
                )
              ),
              option(
                right(
                  delimited(
                    option(Token.parseWhitespace),
                    Token.parseDelim("/")
                  ),
                  parseAlpha
                )
              )
            ),
            pair(
              either(
                pair(
                  Percentage.parseBase,
                  take(
                    right(
                      delimited(
                        option(Token.parseWhitespace),
                        Token.parseComma
                      ),
                      Percentage.parseBase
                    ),
                    2
                  )
                ),
                pair(
                  Number.parseBase,
                  take(
                    right(
                      delimited(
                        option(Token.parseWhitespace),
                        Token.parseComma
                      ),
                      Number.parseBase
                    ),
                    2
                  )
                )
              ),
              option(
                right(
                  delimited(option(Token.parseWhitespace), Token.parseComma),
                  parseAlpha
                )
              )
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [[red, [green, blue]], alpha] = result;

      return RGB.of(
        red,
        green,
        blue,
        alpha.getOrElse(() => Number.of(1))
      );
    }
  );
}
