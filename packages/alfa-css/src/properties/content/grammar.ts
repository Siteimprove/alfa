import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values, ValueType } from "../../values";
import { Content } from "./types";

type Production<T extends Token> = Lang.Production<Token, Content, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "normal":
      case "none":
        return Values.keyword(token.value);
    }

    return null;
  }
};

const string: Production<Tokens.String> = {
  token: TokenType.String,
  prefix(token) {
    return Values.list(Values.string(token.value));
  },
  infix(token, stream, expression, left) {
    if (left.type === ValueType.List) {
      left.value.push(Values.string(token.value));
      return left;
    }

    return null;
  }
};

export const ContentGrammar: Grammar<Token, Content> = new Grammar(
  [skip(TokenType.Whitespace), ident, string],
  () => null
);
