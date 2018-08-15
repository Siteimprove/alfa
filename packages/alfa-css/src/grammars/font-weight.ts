import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Ident, Number, Token, TokenType } from "../alphabet";
import { whitespace } from "../grammar";
import { FontWeight } from "../properties/font-weight";

type Production<T extends Token> = Lang.Production<Token, FontWeight, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "normal":
        return { type: "absolute", value: 400 };
      case "bold":
        return { type: "absolute", value: 700 };
      case "bolder":
      case "lighter":
        return { type: "relative", value: token.value };
    }

    return null;
  }
};

const number: Production<Number> = {
  token: TokenType.Number,
  prefix(token) {
    switch (token.value) {
      case 100:
      case 200:
      case 300:
      case 400:
      case 500:
      case 600:
      case 700:
      case 800:
      case 900:
        return { type: "absolute", value: token.value };
    }
    return { type: "absolute", value: 400 };
  }
};

export const FontWeightGrammar: Grammar<Token, FontWeight> = new Grammar(
  [whitespace, ident, number],
  () => null
);
