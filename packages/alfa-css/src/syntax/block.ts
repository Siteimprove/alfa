import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Option } from "@siteimprove/alfa-option";
import { Component } from "./component";
import { Token } from "./token";

const { isOpenParenthesis } = Token.OpenParenthesis;
const { isOpenSquareBracket } = Token.OpenSquareBracket;
const { isOpenCurlyBracket } = Token.OpenCurlyBracket;

/**
 * {@link https://drafts.csswg.org/css-syntax/#simple-block}
 *
 * @public
 */
export class Block implements Iterable<Token>, Equatable, Serializable {
  public static of(token: Block.Open, value: Iterable<Token>): Block {
    return new Block(token, Array.from(value));
  }

  private readonly _token: Block.Open;
  private readonly _value: Array<Token>;

  private constructor(token: Block.Open, value: Array<Token>) {
    this._token = token;
    this._value = value;
  }

  public get token(): Block.Open {
    return this._token;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public *[Symbol.iterator](): Iterator<Token> {
    // <open>
    yield this._token;

    // <value>
    yield* this._value;

    // <close>
    yield this._token.mirror;
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
    return (
      this._token.toString() +
      this._value.join("") +
      this._token.mirror.toString()
    );
  }
}

/**
 * @public
 */
export namespace Block {
  export interface JSON {
    [key: string]: json.JSON;
    token: Token.JSON;
    value: Array<Token.JSON>;
  }

  /**
   * The tokens that are allowed to open a block.
   */
  export type Open =
    | Token.OpenParenthesis
    | Token.OpenSquareBracket
    | Token.OpenCurlyBracket;

  /**
   * The tokens that are allowed to close a block.
   */
  export type Close =
    | Token.CloseParenthesis
    | Token.CloseSquareBracket
    | Token.CloseCurlyBracket;

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-simple-block}
   */
  export const consume: Parser<Slice<Token>, Block, string> = (input) => {
    return input
      .first()
      .filter(
        (token): token is Open =>
          isOpenParenthesis(token) ||
          isOpenSquareBracket(token) ||
          isOpenCurlyBracket(token)
      )
      .andThen((token) => {
        const value: Array<Token> = [];

        input = input.rest();

        while (input.length > 0) {
          const next = input.first();

          if (next.isSome() && next.get().type === token.mirror.type) {
            input = input.rest();
            break;
          }

          const [remainder, component] = Component.consume(input).get();

          input = remainder;
          value.push(...component);
        }

        return Option.of(
          Ok.of<[Slice<Token>, Block]>([input, Block.of(token, value)])
        );
      })
      .getOr(Err.of("Expected open parenthesis or bracket"));
  };
}
