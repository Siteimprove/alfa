import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Component } from "./component";
import { Token } from "./token";

const { flatMap, peek, right } = Parser;

/**
 * @see https://drafts.csswg.org/css-syntax/#function
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

export namespace Function {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: Array<Token.JSON>;
  }

  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-function
   */
  export const consume: Parser<Slice<Token>, Function> = (input) => {
    const name = input.get(0).filter(Token.isFunction).get().value;
    const value: Array<Token> = [];

    input = input.slice(1);

    while (input.length > 0) {
      const next = input.get(0).get();

      if (Token.isCloseParenthesis(next)) {
        input = input.slice(1);
        break;
      }

      const [remainder, component] = Component.consume(input).get();

      input = remainder;
      value.push(...component);
    }

    return Result.of([input, Function.of(name, value)]);
  };

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

        const result = body(Slice.of(fn.value));

        if (result.isErr()) {
          return result;
        }

        const [remainder, value] = result.get();

        if (remainder.length > 0) {
          return Err.of(`Unexpected token ${remainder.get(0).get()}`);
        }

        return Result.of([input, [fn, value] as const]);
      }
    );
}
