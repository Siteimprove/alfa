import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { Display } from "./types";

const { tuple, keyword } = Values;

type Production<T extends Token> = Lang.Production<Token, Display, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "block":
      case "inline":
      case "run-in":
        return tuple(keyword(token.value), keyword("flow"));

      case "flow":
      case "flow-root":
      case "table":
      case "flex":
      case "grid":
        return tuple(keyword("block"), keyword(token.value));
      case "ruby":
        return tuple(keyword("inline"), keyword(token.value));

      case "list-item":
        return tuple(keyword("block"), keyword("flow"), keyword(token.value));

      case "contents":
      case "none":
        return keyword(token.value);

      case "inline-block":
        return tuple(keyword("inline"), keyword("flow-root"));
      case "inline-table":
        return tuple(keyword("inline"), keyword("table"));
      case "inline-flex":
        return tuple(keyword("inline"), keyword("flex"));
      case "inline-grid":
        return tuple(keyword("inline"), keyword("grid"));
    }

    return null;
  }
};

export const DisplayGrammar: Grammar<Token, Display> = new Grammar(
  [skip(TokenType.Whitespace), ident],
  () => null
);
