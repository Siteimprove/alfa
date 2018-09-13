import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../../alphabet";
import { Values } from "../../../values";
import { TextDecorationStyle } from "../types";

type Production<T extends Token> = Lang.Production<
  Token,
  TextDecorationStyle,
  T
>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "none":
      case "solid":
      case "double":
      case "dotted":
      case "dashed":
      case "wavy":
        return Values.keyword(token.value);
    }

    return null;
  }
};

export const TextDecorationStyleGrammar: Grammar<
  Token,
  TextDecorationStyle
> = new Grammar([skip(TokenType.Whitespace), ident], () => null);
