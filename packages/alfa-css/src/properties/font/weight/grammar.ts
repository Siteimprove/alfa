import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../../alphabet";
import { Values } from "../../../values";
import { FontWeight } from "../types";

type Production<T extends Token> = Lang.Production<Token, FontWeight, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "normal":
      case "bold":
        return Values.keyword(token.value);

      case "bolder":
      case "lighter":
        return Values.keyword(token.value);
    }

    return null;
  }
};

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token) {
    if (token.value >= 1 && token.value <= 1000) {
      return Values.number(token.value);
    }

    return null;
  }
};

export const FontWeightGrammar: Grammar<Token, FontWeight> = new Grammar(
  [skip(TokenType.Whitespace), ident, number],
  () => null
);
