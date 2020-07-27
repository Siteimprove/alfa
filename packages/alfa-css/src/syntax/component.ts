import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Block } from "./block";
import { Token } from "./token";

/**
 * @see https://drafts.csswg.org/css-syntax/#component-value
 */
export class Component implements Iterable<Token>, Equatable, Serializable {
  public static of(value: Array<Token>): Component {
    return new Component(value);
  }

  private readonly _value: Array<Token>;

  private constructor(value: Array<Token>) {
    this._value = value;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Component &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public *[Symbol.iterator](): Iterator<Token> {
    yield* this._value;
  }

  public toJSON(): Component.JSON {
    return this._value.map((token) => token.toJSON());
  }

  public toString(): string {
    return this._value.join("");
  }
}

export namespace Component {
  export type JSON = Array<Token.JSON>;

  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-component-value
   */
  export const consume: Parser<Slice<Token>, Component> = (input) => {
    const next = input.get(0).get();

    const value = [next];

    // If we encounter a the opening of a block as marked by a (, [, or { token,
    // consume a block and use it as the component value.
    // https://drafts.csswg.org/css-syntax/#consume-a-simple-block
    if (
      Token.isOpenParenthesis(next) ||
      Token.isOpenSquareBracket(next) ||
      Token.isOpenCurlyBracket(next)
    ) {
      const [remainder, block] = Block.consume(input).get();

      input = remainder;
      value.push(...block.value);
    }

    // Otherwise, if we encounter a function, consume a function and use it as
    // the component value.
    // https://drafts.csswg.org/css-syntax/#consume-a-function
    else if (Token.isFunction(next)) {
      input = input.slice(1);

      while (true) {
        const next = input.get(0);

        if (next.isNone()) {
          break;
        }

        if (next.some(Token.isCloseParenthesis)) {
          input = input.slice(1);
          value.push(next.get());
          break;
        }

        const [remainder, component] = Component.consume(input).get();

        input = remainder;
        value.push(...component);
      }
    }

    // Otherwise, we simply advance the input.
    else {
      input = input.slice(1);
    }

    return Ok.of([input, Component.of(value)] as const);
  };

  /**
   * @see https://drafts.csswg.org/css-syntax/#parse-component-value
   */
  export const parse: Parser<Slice<Token>, Component, string> = (input) => {
    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    if (input.length === 0) {
      return Err.of("Unexpected end of input");
    }

    const component = consume(input);

    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    if (input.length !== 0) {
      return Err.of("Expected end of input");
    }

    return component;
  };
}
