import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Ident, Token, TokenType } from "../../alphabet";
import { whitespace } from "../../grammar";
import { Display } from "./types";

type Production<T extends Token> = Lang.Production<Token, Display, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "block":
      case "inline":
      case "run-in":
        return [token.value, "flow"];

      case "flow":
      case "flow-root":
      case "table":
      case "flex":
      case "grid":
        return ["block", token.value];
      case "ruby":
        return ["inline", token.value];

      case "list-item":
        return ["block", "flow", token.value];

      case "contents":
      case "none":
        return token.value;

      case "inline-block":
        return ["inline", "flow-root"];
      case "inline-table":
        return ["inline", "table"];
      case "inline-flex":
        return ["inline", "flex"];
      case "inline-grid":
        return ["inline", "grid"];
    }

    return null;
  }
};

export const DisplayGrammar: Grammar<Token, Display> = new Grammar(
  [whitespace, ident],
  () => null
);
