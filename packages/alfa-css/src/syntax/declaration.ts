import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Component } from "./component";
import { Token } from "./token";

const { or, not } = Predicate;

/**
 * @see https://drafts.csswg.org/css-syntax/#declaration
 */
export interface Declaration {
  name: string;
  value: Array<Token>;
  important: boolean;
}

export namespace Declaration {
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

    const declaration: Declaration = { name, value, important: false };

    return Ok.of([input, declaration] as const);
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
