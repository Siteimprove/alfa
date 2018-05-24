import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Token, Ident, String } from "../alphabet";
import { whitespace } from "../grammar";
import { Content } from "../properties/content";

const { isArray } = Array;

type Production<T extends Token> = Lang.Production<Token, Content, T>;

const ident: Production<Ident> = {
  token: "ident",
  prefix(token) {
    switch (token.value) {
      case "normal":
      case "none":
        return token.value;
    }

    return null;
  }
};

const string: Production<String> = {
  token: "string",
  prefix(token) {
    return [token.value];
  },
  infix(token, stream, expression, left) {
    if (isArray(left)) {
      left.push(token.value);
      return left;
    }

    return null;
  }
};

export const ContentGrammar: Grammar<Token, Content> = new Grammar([
  whitespace,
  ident,
  string
]);
