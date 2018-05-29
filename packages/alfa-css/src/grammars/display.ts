import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Token, Ident } from "../alphabet";
import { whitespace } from "../grammar";
import { Display } from "../properties/display";

type Production<T extends Token> = Lang.Production<Token, Display, T>;

const ident: Production<Ident> = {
  token: "ident",
  prefix(token) {
    switch (token.value) {
      case "block":
      case "inline":
      case "run-in":
        return { outside: token.value, inside: "flow" };

      case "flow":
      case "flow-root":
      case "table":
      case "flex":
      case "grid":
        return { outside: "block", inside: token.value };
      case "ruby":
        return { outside: "inline", inside: token.value };

      case "list-item":
        return { outside: "block", inside: "flow", marker: true };

      case "contents":
      case "none":
        return { box: token.value };

      case "inline-block":
        return { outside: "inline", inside: "flow-root" };
      case "inline-table":
        return { outside: "inline", inside: "table" };
      case "inline-flex":
        return { outside: "inline", inside: "flex" };
      case "inline-grid":
        return { outside: "inline", inside: "grid" };
    }

    return null;
  }
};

export const DisplayGrammar: Grammar<Token, Display> = new Grammar([
  whitespace,
  ident
]);
