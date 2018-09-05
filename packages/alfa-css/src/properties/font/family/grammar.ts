import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Comma, Ident, String, Token, TokenType } from "../../../alphabet";
import { whitespace } from "../../../grammar";
import { FontFamily } from "../types";

const { isArray } = Array;

type Production<T extends Token> = Lang.Production<Token, FontFamily, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    return token.value;
  },
  infix(token, stream, expression, left) {
    switch (left) {
      case "serif":
      case "sans-serif":
      case "cursive":
      case "fantatsy":
      case "monospace":
        return null;
    }

    return `${left} ${token.value}`;
  }
};

const string: Production<String> = {
  token: TokenType.String,
  prefix(token) {
    return token.value;
  }
};

const comma: Production<Comma> = {
  token: TokenType.Comma,
  infix(token, stream, expression, left) {
    const families = isArray(left) ? left : [left];

    const right = expression();

    if (right === null) {
      return null;
    }

    if (isArray(right)) {
      families.push(...right);
    } else {
      families.push(right);
    }

    return families;
  }
};

export const FontFamilyGrammar: Grammar<Token, FontFamily> = new Grammar(
  [whitespace, ident, string, comma],
  () => null
);
