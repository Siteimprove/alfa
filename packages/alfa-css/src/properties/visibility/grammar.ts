import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { Visibility } from "./types";

type Production<T extends Token> = Lang.Production<Token, Visibility, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "visible":
      case "hidden":
      case "collapse":
        return Values.keyword(token.value);
    }

    return null;
  }
};

export const VisibilityGrammar: Grammar<Token, Visibility> = new Grammar(
  [skip(TokenType.Whitespace), ident],
  () => null
);
