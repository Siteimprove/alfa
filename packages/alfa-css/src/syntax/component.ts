import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Block } from "./block.js";
import { Function } from "./function.js";
import type { Parser as CSSParser } from "./parser.js";
import { Token } from "./token.js";

const { delimited, option, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-syntax/#component-value}
 *
 * @public
 */
export class Component implements Iterable<Token>, Equatable, Serializable {
  public static of(value: Iterable<Token>): Component {
    return new Component(Array.from(value));
  }

  private readonly _value: Array<Token>;

  protected constructor(value: Array<Token>) {
    this._value = value;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public *[Symbol.iterator](): Iterator<Token> {
    yield* this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Component &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public toJSON(): Component.JSON {
    return this._value.map((token) => token.toJSON());
  }

  public toString(): string {
    return this._value.join("");
  }
}

/**
 * @public
 */
export namespace Component {
  export type JSON = Array<Token.JSON>;

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-component-value}
   *
   * @remarks
   * This function is a hot path and is therefore implemented without using
   * the `either` parser combinator using token lookahead instead.
   * Any changes to this function should be benchmarked.
   */
  export const consume: CSSParser<Component> = (input) => {
    if (input.isEmpty()) {
      return Err.of("Unexpected end of file");
    }

    const first = input.getUnsafe(0);

    if (Token.isFunction(first)) {
      return map(Function.consume, (value) => Component.of(value))(input);
    }

    if (
      Token.isOpenParenthesis(first) ||
      Token.isOpenSquareBracket(first) ||
      Token.isOpenCurlyBracket(first)
    ) {
      return map(Block.consume, (value) => Component.of(value))(input);
    }

    // Single token case
    return Result.of<[Slice<Token>, Component], string>([
      input.rest(),
      Component.of([first]),
    ]);
  };

  /**
   * {@link https://drafts.csswg.org/css-syntax/#parse-component-value}
   */
  export const parse = delimited(option(Token.parseWhitespace), consume);
}
