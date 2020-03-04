import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Ok } from "@siteimprove/alfa-result";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Component } from "./component";
import { Token } from "./token";

/**
 * @see https://drafts.csswg.org/css-syntax/#simple-block
 */
export interface Block {
  token: Token;
  value: Array<Token>;
}

export namespace Block {
  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-simple-block
   */
  export const consume: Parser<Slice<Token>, Block> = input => {
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
        return Ok.of([input.slice(1), { token, value }] as const);
      }

      const [remainder, component] = Component.consume(input).get();

      input = remainder;
      value.push(...component);
    }
  };
}
