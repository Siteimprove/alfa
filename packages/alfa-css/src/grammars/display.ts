import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream } from "@siteimprove/alfa-lang";
import { Token, Whitespace, Ident } from "../alphabet";
import { Display } from "../properties/display";

type Production<T extends Token, R = never> = Lang.Production<Token, R, T>;

const whitespace: Production<Whitespace> = {
  token: "whitespace",
  prefix() {
    return null;
  },
  infix() {
    return null;
  }
};

const ident: Production<Ident, Display> = {
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
