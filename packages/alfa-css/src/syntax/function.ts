import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import type * as json from "@siteimprove/alfa-json";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { Component } from "./component.js";
import type { Parser as CSSParser } from "./parser.js";
import { Token } from "./token.js";

const {
  delimited,
  flatMap,
  option,
  peek,
  right,
  left,
  pair,
  map,
  takeUntil,
  either,
  end,
} = Parser;

/**
 * {@link https://drafts.csswg.org/css-syntax/#function}
 *
 * @public
 */
export class Function implements Iterable<Token>, Equatable, Serializable {
  public static of(name: string, value: Iterable<Token>): Function {
    return new Function(name, Array.from(value));
  }

  private readonly _name: string;
  private readonly _value: Array<Token>;

  private constructor(name: string, value: Array<Token>) {
    this._name = name;
    this._value = value;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public *[Symbol.iterator](): Iterator<Token> {
    // <name>(
    yield Token.Function.of(this._name);

    // <value>
    yield* this._value;

    // )
    yield Token.CloseParenthesis.of();
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Function &&
      value._name === this._name &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public toJSON(): Function.JSON {
    return {
      name: this._name,
      value: this._value.map((token) => token.toJSON()),
    };
  }

  public toString(): string {
    return `${this._name}(${this._value.join("")})`;
  }
}

/**
 * @public
 */
export namespace Function {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: Array<Token.JSON>;
  }

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-function}
   */
  export const consume: CSSParser<Function> = (input) =>
    // eta expansion is necessary for `this` binding to resolve correctly
    map(
      pair(
        Token.parseFunction(),
        map(
          left(
            takeUntil(
              Component.consume,
              either(
                Token.parseCloseParenthesis,
                end<Slice<Token>, string>(
                  () => "Dummy error message since this should never fail",
                ),
              ),
            ),
            option(Token.parseCloseParenthesis),
          ),
          (components) => components.flatMap((component) => [...component]),
        ),
      ),
      ([{ value: name }, value]) => Function.of(name, value),
    )(input);

  export const parse = <T>(
    query?: string | Predicate<Token.Function>,
    body?: CSSParser<T> | Thunk<CSSParser<T>>,
  ) =>
    flatMap(
      right(peek(Token.parseFunction(query)), Function.consume),
      (fn) => (input) => {
        if (body === undefined) {
          return Result.of([input, [fn, undefined as never] as const]);
        }

        // Sadly, JS alone is not capable of differentiating one function from
        // another. So, at run time we can't differentiate a parser from a
        // thunk.
        // We have to rely on exception to handle that.
        let parse: CSSParser<T>;
        try {
          parse = (body as Thunk<CSSParser<T>>)();
          // In the off case where `body` is a parser that never looks at its
          // input, the previous call might not throw.
          if (Result.isResult(parse)) {
            throw new Error("It was a parser after all");
          }
        } catch (err) {
          parse = body as CSSParser<T>;
        }

        const result = delimited(
          // whitespace just inside the parentheses are OK.
          option(Token.parseWhitespace),
          parse,
        )(Slice.of(fn.value));

        if (result.isErr()) {
          return result;
        }

        // the previous check ensures the result is Ok
        const [remainder, value] = result.getUnsafe();

        if (remainder.length > 0) {
          // remainder is not empty, so remainder.get(0) is Some.
          return Err.of(`Unexpected token ${remainder.get(0).getUnsafe()}`);
        }

        return Result.of([input, [fn, value] as const]);
      },
    );
}
