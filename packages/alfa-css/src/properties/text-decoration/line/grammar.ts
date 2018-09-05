import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Ident, Token, TokenType } from "../../../alphabet";
import { whitespace } from "../../../grammar";
import { TextDecorationLine } from "../types";

type Production<T extends Token> = Lang.Production<
  Token,
  TextDecorationLine,
  T
>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "none":
      case "underline":
      case "overline":
      case "line-through":
        return token.value;
    }

    return null;
  }
};

export const TextDecorationLineGrammar: Grammar<
  Token,
  TextDecorationLine
> = new Grammar([whitespace, ident], () => null);
