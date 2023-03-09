import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Component } from "./component";
import { Token } from "./token";

const {
  delimited,
  flatMap,
  option,
  peek,
  right,
  left,
  pair,
  map,
  zeroOrMore,
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
  export const consume: Parser<Slice<Token>, Function, string> = (input) =>
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
                  () => "Dummy error message since this should never fail"
                )
              )
            ),
            option(Token.parseCloseParenthesis)
          ),
          (components) => components.flatMap((component) => [...component])
        )
      ),
      ([{ value: name }, value]) => Function.of(name, value)
    )(input);

  export const parse = <T>(
    name?: string,
    body?: Parser<Slice<Token>, T, string>
  ) =>
    flatMap(
      right(
        peek(
          Token.parseFunction((fn) => name === undefined || fn.value === name)
        ),
        Function.consume
      ),
      (fn) => (input) => {
        if (body === undefined) {
          return Result.of([input, [fn, undefined as never] as const]);
        }

        const result = delimited(
          // whitespace just inside the parentheses are OK.
          option(Token.parseWhitespace),
          body
        )(Slice.of(fn.value));

        if (result.isErr()) {
          return result;
        }

        const [remainder, value] = result.get();

        if (remainder.length > 0) {
          // remainder is not empty, so remainder.get(0) is Some.
          return Err.of(`Unexpected token ${remainder.get(0).getUnsafe()}`);
        }

        return Result.of([input, [fn, value] as const]);
      }
    );
}
