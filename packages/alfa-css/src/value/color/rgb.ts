import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Number } from "../number";
import { Percentage } from "../percentage";

const { pair, map, either, option, left, right, take, delimited } = Parser;

export class RGB<
  C extends Number | Percentage = Number | Percentage,
  A extends Number | Percentage = Number | Percentage
> implements Equatable, Hashable, Serializable {
  public static of<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(red: C, green: C, blue: C, alpha: A): RGB<C, A> {
    return new RGB(red, green, blue, alpha);
  }

  private readonly _red: C;
  private readonly _green: C;
  private readonly _blue: C;
  private readonly _alpha: A;

  private constructor(red: C, green: C, blue: C, alpha: A) {
    this._red = red;
    this._green = green;
    this._blue = blue;
    this._alpha = alpha;
  }

  public get type(): "color" {
    return "color";
  }

  public get format(): "rgb" {
    return "rgb";
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
    this._red.hash(hash);
    this._green.hash(hash);
    this._blue.hash(hash);
    this._alpha.hash(hash);
  }

  public toJSON(): RGB.JSON {
    return {
      type: "color",
      format: "rgb",
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

export namespace RGB {
  export interface JSON {
    [key: string]: json.JSON;
    type: "color";
    format: "rgb";
    red: Number.JSON | Percentage.JSON;
    green: Number.JSON | Percentage.JSON;
    blue: Number.JSON | Percentage.JSON;
    alpha: Number.JSON | Percentage.JSON;
  }

  export function isRGB<
    C extends Number | Percentage,
    A extends Number | Percentage
  >(value: unknown): value is RGB<C, A> {
    return value instanceof RGB;
  }

  /**
   * @see https://drafts.csswg.org/css-color/#typedef-alpha-value
   */
  const parseAlpha = either(Number.parse, Percentage.parse);

  /**
   * @see https://drafts.csswg.org/css-color/#funcdef-rgb
   */
  export const parse = map(
    right(
      Token.parseFunction((fn) => fn.value === "rgb" || fn.value === "rgba"),
      left(
        delimited(
          option(Token.parseWhitespace),
          either(
            pair(
              either(
                pair(
                  Percentage.parse,
                  take(
                    right(option(Token.parseWhitespace), Percentage.parse),
                    2
                  )
                ),
                pair(
                  Number.parse,
                  take(right(option(Token.parseWhitespace), Number.parse), 2)
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
                  Percentage.parse,
                  take(
                    right(
                      delimited(
                        option(Token.parseWhitespace),
                        Token.parseComma
                      ),
                      Percentage.parse
                    ),
                    2
                  )
                ),
                pair(
                  Number.parse,
                  take(
                    right(
                      delimited(
                        option(Token.parseWhitespace),
                        Token.parseComma
                      ),
                      Number.parse
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
