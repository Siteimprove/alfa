import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "./token";

const { map, right, pair, delimited, option, either } = Parser;

/**
 * @see https://drafts.csswg.org/css-syntax/#anb
 */
export class Nth implements Iterable<Token>, Equatable, Serializable {
  public static of(step: number, offset: number = 0): Nth {
    return new Nth(step | 0, offset | 0);
  }

  private readonly _step: number;
  private readonly _offset: number;

  private constructor(step: number, offset: number) {
    this._step = step;
    this._offset = offset;
  }

  public get step(): number {
    return this._step;
  }

  public get offset(): number {
    return this._offset;
  }

  /**
   * Check if the given index matches the indices produced by this nth.
   *
   * @remarks
   * This is checked by solving the equation `an + b = i` for `n`, giving us
   * `n = (i - b) / a`. The index `i` is matched by this nth if the resulting
   * `n` is a non-negative integer.
   */
  public matches(index: number): boolean {
    // If the step is 0 then we just need to match the index against the offset.
    if (this._step === 0) {
      return this._offset === (index | 0);
    }

    const n = ((index | 0) - this._offset) / this._step;

    return n >= 0 && n === (n | 0);
  }

  public for(n: number): number {
    return this._step * (n | 0) + this._offset;
  }

  public *indices(): Iterable<number> {
    for (let n = 0; ; n++) {
      yield this.for(n);
    }
  }

  public *[Symbol.iterator](): Iterator<Token> {
    if (this._step !== 0) {
      yield Token.Dimension.of(this._step, "n", true, this._step < 0);
    }

    if (this._offset !== 0) {
      yield Token.Number.of(
        this._offset,
        true,
        this._offset < 0 || this._step !== 0
      );
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Nth &&
      value._step === this._step &&
      value._offset === this._offset
    );
  }

  public toJSON(): Nth.JSON {
    return {
      step: this._step,
      offset: this._offset,
    };
  }
}

export namespace Nth {
  export interface JSON {
    [key: string]: json.JSON;
    step: number;
    offset: number;
  }

  /**
   * @remarks
   * The An+B syntax isn't really meant for the tokens produced by the CSS lexer
   * and so the resulting parser ends up being quite complex.
   *
   * @see https://drafts.csswg.org/css-syntax/#anb-production
   */
  export const parse = either(
    // odd | even
    map(
      Token.parseIdent(
        (ident) => ident.value === "odd" || ident.value === "even"
      ),
      (ident) => Nth.of(2, ident.value === "even" ? 0 : 1)
    ),

    // <integer>
    map(
      Token.parseNumber((number) => number.isInteger),
      (number) => Nth.of(0, number.value)
    ),

    // <ndashdigit-dimension>
    map(
      Token.parseDimension(
        (dimension) => dimension.isInteger && /^n-\d+$/.test(dimension.unit)
      ),
      (dimension) => Nth.of(dimension.value, +dimension.unit.slice(1))
    ),

    // "+"? <ndashdigit-ident>
    right(
      option(Token.parseDelim("+")),
      map(
        Token.parseIdent((ident) => /^n-\d+$/.test(ident.value)),
        (ident) => Nth.of(1, +ident.value.slice(1))
      )
    ),

    // <dashndashdigit-ident>
    map(
      Token.parseIdent((ident) => /^-n-\d+$/.test(ident.value)),
      (ident) => Nth.of(-1, +ident.value.slice(2))
    ),

    // [<n-dimension> | "+"? n | -n] [["+" | "-"]? <signless-integer> | <signed-integer>]?
    map(
      pair(
        // <n-dimension> | "+"? n | -n
        either(
          // <n-dimension>
          map(
            Token.parseDimension(
              (dimension) => dimension.isInteger && dimension.unit === "n"
            ),
            (dimension) => dimension.value
          ),

          // "+"? n
          map(
            right(option(Token.parseDelim("+")), Token.parseIdent("n")),
            () => 1
          ),

          // -n
          map(Token.parseIdent("-n"), () => -1)
        ),

        // [["+" | "-"]? <signless-integer> | <signed-integer>]?
        option(
          either(
            map(
              pair(
                // ["+" | "-"]?
                delimited(
                  option(Token.parseWhitespace),
                  option(
                    either(
                      map(Token.parseDelim("+"), () => 1),
                      map(Token.parseDelim("-"), () => -1)
                    )
                  )
                ),

                // <signless-integer>
                Token.parseNumber(
                  (number) => number.isInteger && !number.isSigned
                )
              ),
              ([sign, number]) => sign.getOr(1) * number.value
            ),

            delimited(
              option(Token.parseWhitespace),
              map(
                Token.parseNumber((number) => number.isInteger),
                (number) => number.value
              )
            )
          )
        )
      ),
      ([step, offset]) => Nth.of(step, offset.getOr(0))
    ),

    // [<ndash-dimension> | "+"? n- | -n-] <signless-integer>
    map(
      pair(
        // <ndash-dimension> | "+"? n- | -n-
        either(
          // <ndash-dimension>
          map(
            Token.parseDimension(
              (dimension) => dimension.isInteger && dimension.unit === "n-"
            ),
            (dimension) => dimension.value
          ),

          // "+"? n-
          map(
            right(option(Token.parseDelim("+")), Token.parseIdent("n-")),
            () => 1
          ),

          // -n-
          map(Token.parseIdent("-n-"), () => -1)
        ),

        // <signless-integer>
        delimited(
          option(Token.parseWhitespace),
          map(
            Token.parseNumber((number) => number.isInteger && !number.isSigned),
            (number) => number.value
          )
        )
      ),
      ([step, offset]) => Nth.of(step, -1 * offset)
    )
  );
}
