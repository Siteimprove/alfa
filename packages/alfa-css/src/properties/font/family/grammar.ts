import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../../alphabet";
import { Values, ValueType } from "../../../values";
import { FontFamily } from "../types";

type Production<T extends Token> = Lang.Production<Token, FontFamily, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "serif":
      case "sans-serif":
      case "cursive":
      case "fantasy":
      case "monospace":
        return Values.list(Values.keyword(token.value));
    }

    return Values.list(Values.string(token.value));
  },
  infix(token, stream, expression, left) {
    const last = left.value[left.value.length - 1];

    if (last.type === ValueType.Keyword) {
      return null;
    }

    left.value[left.value.length - 1] = Values.string(
      `${last.value} ${token.value}`
    );

    return left;
  }
};

const string: Production<Tokens.String> = {
  token: TokenType.String,
  prefix(token) {
    return Values.list(Values.string(token.value));
  }
};

const comma: Production<Tokens.Comma> = {
  token: TokenType.Comma,
  infix(token, stream, expression, left) {
    const right = expression();

    if (right === null) {
      return null;
    }

    left.value.push(...right.value);

    return left;
  }
};

export const FontFamilyGrammar: Grammar<Token, FontFamily> = new Grammar(
  [skip(TokenType.Whitespace), ident, string, comma],
  () => null
);
