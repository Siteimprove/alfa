import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../../alphabet";
import { Values } from "../../../values";
import { TextDecorationLine } from "../types";

type Production<T extends Token> = Lang.Production<
  Token,
  TextDecorationLine,
  T
>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "none":
      case "underline":
      case "overline":
      case "line-through":
        return Values.keyword(token.value);
    }

    return null;
  }
};

export const TextDecorationLineGrammar: Grammar<
  Token,
  TextDecorationLine
> = new Grammar([skip(TokenType.Whitespace), ident], () => null);
