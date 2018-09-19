import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { Opacity } from "./types";

type Production<T extends Token> = Lang.Production<Token, Opacity, T>;

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token) {
    return Values.number(token.value);
  }
};

const percentage: Production<Tokens.Percentage> = {
  token: TokenType.Percentage,
  prefix(token) {
    return Values.percentage(token.value);
  }
};

export const OpacityGrammar: Grammar<Token, Opacity> = new Grammar(
  [skip(TokenType.Whitespace), number, percentage],
  () => null
);
