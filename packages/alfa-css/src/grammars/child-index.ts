import * as Lang from "@siteimprove/alfa-lang";
// import { Grammar, Stream } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../alphabet";
import { ChildIndex } from "../types";

namespace ChildIndex {
  export const enum TokenType {
    NDimension,
    NIdent,
    NNumber
  }

  export namespace Tokens {
    interface Token<T extends TokenType> extends Lang.Token<T> {}

    export interface NDimension extends Token<TokenType.NDimension> {
      readonly unit: string;
      readonly value: number;
    }

    export interface NIdent extends Token<TokenType.NIdent> {
      readonly value: string;
    }

    export interface NNumber extends Token<TokenType.NNumber> {
      readonly value: number;
    }
  }

  export type Token = Tokens.NDimension | Tokens.NIdent | Tokens.NNumber;
}

function fromToken(token: Token): ChildIndex.Token | null {
  console.log(token);
  switch (token.type) {
    case TokenType.Dimension:
      if (token.integer === true && token.unit.toLowerCase() === "n") {
        return {
          type: ChildIndex.TokenType.NDimension,
          unit: "n",
          value: token.value
        };
      } else if (token.unit.toLowerCase().startsWith("n")) {
        return {
          value: token.value,
          unit: token.unit.toLowerCase(),
          type: ChildIndex.TokenType.NDimension
        };
      } else if (token.unit.toLowerCase().startsWith("-n")) {
        return {
          value: token.value,
          unit: token.unit.toLowerCase(),
          type: ChildIndex.TokenType.NDimension
        };
      }
      break;
    case TokenType.Ident:
      return {
        value: token.value,
        type: ChildIndex.TokenType.NIdent
      };
    case TokenType.Number:
      return {
        value: token.value,
        type: ChildIndex.TokenType.NNumber
      };
  }

  return null;
}

type Production<T extends Token> = Lang.Production<Token, ChildIndex, T>;

const dimension: Production<Tokens.Dimension> = {
  token: TokenType.Dimension,
  prefix(token, stream) {
    let a = 0;
    let b = 0;

    const childToken = fromToken(token);

    if (
      childToken === null ||
      childToken.type !== ChildIndex.TokenType.NDimension
    ) {
      return null;
    }

    a = childToken.value;

    if (childToken.unit !== "n") {
      const offset = childToken.unit.startsWith("-") ? 2 : 1;
      b = Number.parseInt(childToken.unit.substring(offset));
    }

    return { a, b };
  },
  infix(token, stream, expression, left) {
    return null;
  }
};

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token, stream) {
    const childToken = fromToken(token);

    if (
      childToken === null ||
      childToken.type !== ChildIndex.TokenType.NIdent
    ) {
      return null;
    }

    switch (childToken.value) {
      case "n":
        return {
          a: 1,
          b: 0
        };
      case "-n":
        return {
          a: -1,
          b: 0
        };
      case "even":
        return {
          a: 2,
          b: 0
        };
      case "odd":
        return {
          a: 2,
          b: 1
        };
    }

    return null;
  },
  infix(token, stream, expression, left) {
    return null;
  }
};

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token, stream) {
    const childToken = fromToken(token);

    if (
      childToken === null ||
      childToken.type !== ChildIndex.TokenType.NDimension
    ) {
      return null;
    }

    return {
      a: childToken.value,
      b: 0
    };
  },
  infix(token, stream, expression, left) {
    const childToken = fromToken(token);

    if (
      childToken === null ||
      childToken.type !== ChildIndex.TokenType.NNumber
    ) {
      return null;
    }

    return {
      a: left.a,
      b: childToken.value
    };
  }
};

export const ChildIndexGrammar: Lang.Grammar<
  Token,
  ChildIndex
> = new Lang.Grammar([[dimension, ident, number]], () => null);
