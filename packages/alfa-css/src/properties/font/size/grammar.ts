import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import {
  Dimension,
  Ident,
  Percentage,
  Token,
  TokenType
} from "../../../alphabet";
import { whitespace } from "../../../grammar";
import { FontSize } from "../types";

type Production<T extends Token> = Lang.Production<Token, FontSize, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    switch (token.value) {
      case "xx-small":
      case "x-small":
      case "small":
      case "medium":
      case "large":
      case "x-large":
      case "xx-large":
        return { type: "absolute", value: token.value };
      case "smaller":
      case "larger":
        return { type: "relative", value: token.value };
    }

    return null;
  }
};

const dimension: Production<Dimension> = {
  token: TokenType.Dimension,
  prefix(token) {
    switch (token.unit) {
      // Absolute lengths
      case "cm":
      case "mm":
      case "Q":
      case "in":
      case "pc":
      case "pt":
      case "px":
        return { type: "length", value: token.value, unit: token.unit };

      // Relative lengths
      case "em":
      case "ex":
      case "ch":
      case "rem":
      case "vw":
      case "vh":
      case "vmin":
      case "vmax":
        return { type: "percentage", value: token.value, unit: token.unit };
    }

    return null;
  }
};

const percentage: Production<Percentage> = {
  token: TokenType.Percentage,
  prefix(token) {
    return { type: "percentage", value: token.value };
  }
};

export const FontSizeGrammar: Grammar<Token, FontSize> = new Grammar(
  [whitespace, ident, dimension, percentage],
  () => null
);
