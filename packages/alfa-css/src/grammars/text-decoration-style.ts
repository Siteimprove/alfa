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
      case "none":
      case "solid":
      case "double":
      case "dotted":
      case "dashed":
      case "wavy":
        return token.value;
    }

    return null;
  }
};

export const TextDecorationStyleGrammar: Grammar<
  Token,
  TextDecorationStyle
> = new Grammar([whitespace, ident], () => null);
