import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Units } from "../../units";
import { Values } from "../../values";
import { LineHeight } from "./types";

type Production<T extends Token> = Lang.Production<Token, LineHeight, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "normal":
        return Values.keyword(token.value);
    }

    return null;
  }
};

const dimension: Production<Tokens.Dimension> = {
  token: TokenType.Dimension,
  prefix(token) {
    if (Units.isLength(token.unit)) {
      return Values.length(token.value, token.unit);
    }

    return null;
  }
};

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token) {
    return Values.percentage(token.value);
  }
};

const percentage: Production<Tokens.Percentage> = {
  token: TokenType.Percentage,
  prefix(token) {
    return Values.percentage(token.value);
  }
};

export const LineHeightGrammar: Grammar<Token, LineHeight> = new Grammar(
  [skip(TokenType.Whitespace), ident, number, dimension, percentage],
  () => null
);
