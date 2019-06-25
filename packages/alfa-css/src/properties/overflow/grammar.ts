import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { Overflow } from "./types";

type Production<T extends Token> = Lang.Production<Token, Overflow, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "visible":
      case "hidden":
      case "clip":
      case "scroll":
      case "auto":
        return Values.keyword(token.value);
    }

    return null;
  }
};

export const OverflowGrammar: Grammar<Token, Overflow> = new Grammar(
  [skip(TokenType.Whitespace), ident],
  () => null
);
