import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Ident, Number, Token, TokenType } from "../../../alphabet";
import { whitespace } from "../../../grammar";
import { FontWeight } from "../types";

type Production<T extends Token> = Lang.Production<Token, FontWeight, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "normal":
        return 400;
      case "bold":
        return 700;
      case "bolder":
      case "lighter":
        return token.value;
    }

    return null;
  }
};

const number: Production<Number> = {
  token: TokenType.Number,
  prefix(token) {
    if (token.value > 0 && token.value <= 1000) {
      return token.value;
    }
    return null;
  }
};

export const FontWeightGrammar: Grammar<Token, FontWeight> = new Grammar(
  [whitespace, ident, number],
  () => null
);
