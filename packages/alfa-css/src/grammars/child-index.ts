import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../alphabet";
import { ChildIndex } from "../types";

namespace ChildIndex {
  export const enum TokenType {
    NDimension
  }

  export namespace Tokens {
    interface Token<T extends TokenType> extends Lang.Token<T> {}

    export interface NDimension extends Token<TokenType.NDimension> {
      // What do we need?
    }
  }

  export type Token = Tokens.NDimension;
}

function fromToken(token: Token): ChildIndex.Token | null {
  switch (token.type) {
    case TokenType.Dimension:
      if (token.integer === true && token.unit.toLowerCase() === "n") {
        return {
          type: ChildIndex.TokenType.NDimension
        };
      }
  }

  return null;
}

type Production<T extends Token> = Lang.Production<Token, ChildIndex, T>;

const dimension: Production<Tokens.Dimension> = {
  token: TokenType.Dimension
};

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident
};

const number: Production<Tokens.Number> = {
  token: TokenType.Number
};

export const ChildIndexGrammar: Lang.Grammar<
  Token,
  ChildIndex
> = new Lang.Grammar([[dimension, ident, number]], () => null);
