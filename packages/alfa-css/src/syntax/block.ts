import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Ok } from "@siteimprove/alfa-result";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

import { Component } from "./component";
import { Token } from "./token";

/**
 * @see https://drafts.csswg.org/css-syntax/#simple-block
 */
export class Block implements Equatable, Serializable {
  public static of(token: Token, value: Array<Token>): Block {
    return new Block(token, value);
  }

  private readonly _token: Token;
  private readonly _value: Array<Token>;

  private constructor(token: Token, value: Array<Token>) {
    this._token = token;
    this._value = value;
  }

  public get token(): Token {
    return this._token;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Block &&
      value._token.equals(this._token) &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public toJSON(): Block.JSON {
    return {
      token: this._token.toJSON(),
      value: this._value.map((token) => token.toJSON()),
    };
  }

  public toString(): string {
    let string = this._token.toString() + this._value.join("");

    if (Token.isOpenParenthesis(this._token)) {
      string += ")";
    }

    if (Token.isOpenSquareBracket(this._token)) {
      string += "]";
    }

    if (Token.isOpenCurlyBracket(this._token)) {
      string += "}";
    }

    return string;
  }
}

export namespace Block {
  export interface JSON {
    [key: string]: json.JSON;
    token: Token.JSON;
    value: Array<Token.JSON>;
  }

  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-simple-block
   */
  export const consume: Parser<Slice<Token>, Block> = (input) => {
    const token = input.get(0).get();
    const value: Array<Token> = [];

    let isEndingToken: Predicate<Token>;

    if (Token.isOpenParenthesis(token)) {
      isEndingToken = Token.isCloseParenthesis;
    }

    if (Token.isOpenSquareBracket(token)) {
      isEndingToken = Token.isOpenSquareBracket;
    }

    if (Token.isOpenCurlyBracket(token)) {
      isEndingToken = Token.isCloseCurlyBracket;
    }

    input = input.slice(1);

    while (true) {
      const next = input.get(0);

      if (next.isNone() || isEndingToken!(next.get())) {
        return Ok.of([input.slice(1), Block.of(token, value)] as const);
      }

      const [remainder, component] = Component.consume(input).get();

      input = remainder;
      value.push(...component);
    }
  };
}
