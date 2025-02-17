import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import type * as json from "@siteimprove/alfa-json";

import { Component } from "./component.js";
import type { Parser as CSSParser } from "./parser.js";
import { Token } from "./token.js";

const { either, pair, left, map, takeUntil } = Parser;

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

  protected constructor(token: Block.Open, value: Array<Token>) {
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
   * Consumes components delimited by parentheses, square brackets or curly
   * brackets.
   *
   * @remarks
   * The compiler doesn't check if the delimiter types match, that needs to be
   * ensured by the caller of the function.
   */
  function consumeDelimited(open: CSSParser<Open>, closed: CSSParser<Close>) {
    return map(
      left(
        pair(
          open,
          // eta expansion is necessary for `this` binding to resolve correctly
          takeUntil((input) => Component.consume(input), closed),
        ),
        closed,
      ),
      ([open, components]) =>
        Block.of(
          open,
          components.flatMap((component) => [...component]),
        ),
    );
  }

  const consumeParentheses = consumeDelimited(
    Token.parseOpenParenthesis,
    Token.parseCloseParenthesis,
  );
  const consumeSquareBrackets = consumeDelimited(
    Token.parseOpenSquareBracket,
    Token.parseCloseSquareBracket,
  );
  const consumeCurlyBracket = consumeDelimited(
    Token.parseOpenCurlyBracket,
    Token.parseCloseCurlyBracket,
  );

  /**
   * {@link https://drafts.csswg.org/css-syntax/#consume-a-simple-block}
   */
  export const consume: CSSParser<Block> = either(
    consumeParentheses,
    consumeSquareBrackets,
    consumeCurlyBracket,
  );
}
