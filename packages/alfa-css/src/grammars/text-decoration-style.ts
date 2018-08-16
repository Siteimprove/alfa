import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Ident, Token, TokenType } from "../alphabet";
import { whitespace } from "../grammar";
import { TextDecorationStyle } from "../properties/text-decoration-style";

type Production<T extends Token> = Lang.Production<
  Token,
  TextDecorationStyle,
  T
>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "initial":
        return "none";
      case "none":
      case "underline":
      case "overline":
      case "line-through":
      case "inherit":
        return token.value;
    }

    return null;
  }
};

export const TextDecorationStyleGrammar: Grammar<
  Token,
  TextDecorationStyle
> = new Grammar([whitespace, ident], () => null);
