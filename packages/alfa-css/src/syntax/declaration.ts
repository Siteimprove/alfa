import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Component } from "./component";
import { Token } from "./token";

const { or, not } = Predicate;

/**
 * @see https://drafts.csswg.org/css-syntax/#declaration
 */
export class Declaration implements Equatable, Serializable {
  public static of(
    name: string,
    value: Array<Token>,
    important = false
  ): Declaration {
    return new Declaration(name, value, important);
  }

  private readonly _name: string;
  private readonly _value: Array<Token>;
  private readonly _important: boolean;

  private constructor(name: string, value: Array<Token>, important: boolean) {
    this._name = name;
    this._value = value;
    this._important = important;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): Array<Token> {
    return this._value;
  }

  public get important(): boolean {
    return this._important;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Declaration &&
      value._name === this._name &&
      value._important === this._important &&
      value._value.length === this._value.length &&
      value._value.every((token, i) => token.equals(this._value[i]))
    );
  }

  public toJSON(): Declaration.JSON {
    return {
      name: this._name,
      value: this._value.map((token) => token.toJSON()),
      important: this._important,
    };
  }

  public toString(): string {
    return `${this._name}: ${this._value}${
      this._important ? " !important" : ""
    }`;
  }
}

export namespace Declaration {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: Array<Token.JSON>;
    important: boolean;
  }

  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-declaration
   */
  export const consume: Parser<Slice<Token>, Declaration, string> = (input) => {
    const name = input.get(0).get().toString();

    input = input.slice(1);

    const value: Array<Token> = [];

    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    if (input.get(0).every(not(Token.isColon))) {
      return Err.of("Expected a colon");
    }

    input = input.slice(1);

    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    while (input.length !== 0) {
      const [remainder, component] = Component.consume(input).get();

      input = remainder;
      value.push(...component);
    }

    let important = false;

    if (value.length >= 2) {
      const fst = value[value.length - 2];
      const snd = value[value.length - 1];

      if (
        fst.type === "delim" &&
        fst.value === 0x21 &&
        snd.type === "ident" &&
        snd.value.toLowerCase() === "important"
      ) {
        value.splice(value.length - 2, 2);
        important = true;
      }
    }

    if (value.length >= 1) {
      const lst = value[value.length - 1];

      if (lst.type === "whitespace") {
        value.pop();
      }
    }

    return Ok.of([input, Declaration.of(name, value, important)] as const);
  };

  /**
   * @see https://drafts.csswg.org/css-syntax/#parse-a-declaration
   */
  export const parse: Parser<Slice<Token>, Declaration, string> = (input) => {
    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    let next = input.get(0);

    if (next.every(not(Token.isIdent))) {
      return Err.of("Expected an ident");
    }

    return consume(input);
  };

  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-list-of-declarations
   */
  export const consumeList: Parser<
    Slice<Token>,
    Iterable<Declaration>,
    string
  > = (input) => {
    const declarations: Array<Declaration> = [];

    while (true) {
      const next = input.get(0);

      if (next.isNone()) {
        return Ok.of([input, declarations] as const);
      }

      input = input.slice(1);

      if (next.some(or(Token.isWhitespace, Token.isSemicolon))) {
        continue;
      }

      if (next.some(Token.isIdent)) {
        const tokens: Array<Token> = [next.get()];

        while (input.get(0).some(not(Token.isSemicolon))) {
          const [remainder, component] = Component.consume(input).get();

          input = remainder;
          tokens.push(...component);
        }

        const result = consume(Slice.of(tokens));

        if (result.isOk()) {
          declarations.push(result.get()[1]);
        }
      } else {
        while (input.get(0).some(not(Token.isSemicolon))) {
          const [remainder] = Component.consume(input).get();

          input = remainder;
        }
      }
    }
  };

  /**
   * @see https://drafts.csswg.org/css-syntax/#parse-a-list-of-declarations
   */
  export const parseList: Parser<
    Slice<Token>,
    Iterable<Declaration>,
    string
  > = (input) => consumeList(input);
}
