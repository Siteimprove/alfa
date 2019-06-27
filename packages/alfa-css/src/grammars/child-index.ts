import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import * as alphabet from "../alphabet";
import { Token, Tokens, TokenType } from "../alphabet";
import { ChildIndex } from "../types";

namespace ChildIndex {
  export const enum TokenType {
    Ident,
    Number,
    DashNDashDigitIdent,
    Integer,
    NDashDigitDimension,
    NDashDigitIdent,
    NDashDimension,
    NDimension,
    SignedInteger,
    SignlessInteger
  }

  export namespace Tokens {
    interface Token<T extends TokenType> extends Lang.Token<T> {}

    export interface DashNDashDigitIdent
      extends Token<TokenType.DashNDashDigitIdent> {
      readonly value: string;
    }

    export interface Integer extends Token<TokenType.Integer> {
      readonly value: number;
    }

    export interface NDashDigitDimension
      extends Token<TokenType.NDashDigitDimension> {
      readonly unit: string;
      readonly value: number;
    }

    export interface NDashDigitIdent extends Token<TokenType.NDashDigitIdent> {
      readonly value: string;
    }

    export interface NDashDimension extends Token<TokenType.NDashDimension> {
      readonly unit: string;
      readonly value: number;
    }

    export interface NDimension extends Token<TokenType.NDimension> {
      readonly value: number;
    }

    export interface SignedInteger extends Token<TokenType.SignedInteger> {
      readonly value: number;
    }

    export interface SignlessInteger extends Token<TokenType.SignlessInteger> {
      readonly value: number;
    }
  }

  export type Token =
    | alphabet.Tokens.Ident
    | alphabet.Tokens.Number
    | Tokens.DashNDashDigitIdent
    | Tokens.NDashDigitDimension
    | Tokens.NDashDigitIdent
    | Tokens.NDashDimension
    | Tokens.NDimension;
}

function fromToken(token: Token): ChildIndex.Token | null {
  console.log("Converting ", token);
  switch (token.type) {
    case TokenType.Dimension:
      if (token.integer === true && token.unit.toLowerCase() === "n") {
        return {
          type: ChildIndex.TokenType.NDimension,
          value: token.value
        };
      }

      if (
        token.integer === true &&
        token.unit.toLowerCase().match("n-[0-9]+") !== null
      ) {
        return {
          unit: token.unit,
          type: ChildIndex.TokenType.NDashDigitDimension,
          value: token.value
        };
      }

      if (token.integer === true && token.unit.toLowerCase().startsWith("n")) {
        return {
          unit: token.unit,
          type: ChildIndex.TokenType.NDashDimension,
          value: token.value
        };
      }
      break;

    case TokenType.Ident:
      if (token.value.toLowerCase().match("-n-[0-9]+") !== null) {
        return {
          type: ChildIndex.TokenType.DashNDashDigitIdent,
          value: token.value
        };
      }

      if (token.value.toLowerCase().match("n-[0-9]+") !== null) {
        return {
          type: ChildIndex.TokenType.NDashDigitIdent,
          value: token.value
        };
      }

      return token;

    case TokenType.Number:
      return token;
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

    if (childToken === null) {
      return null;
    }

    switch (childToken.type) {
      case ChildIndex.TokenType.NDimension:
        a = childToken.value;
        break;

      case ChildIndex.TokenType.NDashDimension:
        a = childToken.value;
        b = Number.parseInt(childToken.unit.substring(1));
        break;

      case ChildIndex.TokenType.NDashDigitDimension:
        a = childToken.value !== null ? childToken.value : 1;
        if (childToken.unit.length > 1) {
          b = Number.parseInt(childToken.unit.substring(1));
        }
    }

    return { a, b };
  }
};

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token, stream) {
    let a = 0;
    let b = 0;

    const childToken = fromToken(token);

    if (childToken === null) {
      return null;
    }

    switch (childToken.type) {
      case ChildIndex.TokenType.NDashDigitIdent:
        a = 1;
        b = Number.parseInt(childToken.value.substring(1));
        break;
      case ChildIndex.TokenType.DashNDashDigitIdent:
        a = -1;
        b = Number.parseInt(childToken.value.substring(2));
        break;
      case TokenType.Ident:
        switch (token.value.toLowerCase()) {
          case "n":
            a = 1;
            b = 0;
            break;
          case "-n":
            a = -1;
            b = 0;
            break;
          case "even":
            a = 2;
            b = 0;
            break;
          case "odd":
            a = 2;
            b = 1;
            break;
          default:
            return null;
        }
        break;
      default:
        return null;
    }

    return { a, b };
  },
  infix(token, stream, expression, left) {
    let a = 0;
    let b = 0;

    const childToken = fromToken(token);

    if (childToken === null) {
      return null;
    }

    switch (childToken.type) {
      case ChildIndex.TokenType.NDashDigitIdent:
        a = 0;
        b = Number.parseInt(childToken.value.substring(2));
        break;
      default:
        return null;
    }

    return { a, b };
  }
};

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token, stream) {
    const childToken = fromToken(token);

    if (childToken === null || childToken.type !== TokenType.Number) {
      return null;
    }

    return {
      a: 0,
      b: childToken.value
    };
  },
  infix(token, stream, expression, left) {
    const childToken = fromToken(token);

    if (childToken === null || childToken.type !== TokenType.Number) {
      return null;
    }

    return {
      a: left.a,
      b: childToken.value
    };
  }
};

export const ChildIndexGrammar: Grammar<Token, ChildIndex> = new Lang.Grammar(
  [skip(TokenType.Whitespace), [dimension, ident, number]],
  () => null
);
