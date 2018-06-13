import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Token, TokenType, Ident } from "../alphabet";
import { whitespace } from "../grammar";
import { Visibility } from "../properties/visibility";

type Production<T extends Token> = Lang.Production<Token, Visibility, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "visible":
      case "hidden":
      case "collapse":
        return token.value;
    }

    return null;
  }
};

export const VisibilityGrammar: Grammar<Token, Visibility> = new Grammar([
  whitespace,
  ident
]);
