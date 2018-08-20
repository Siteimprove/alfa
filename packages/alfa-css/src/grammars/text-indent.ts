import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Dimension, Ident, Percentage, Token, TokenType } from "../alphabet";
import { whitespace } from "../grammar";
import { TextIndent } from "../properties/text-indent";

type Production<T extends Token> = Lang.Production<Token, TextIndent, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  infix(token, stream, expression, left) {
    if (
      token.value === "hanging" &&
      left.hanging === undefined &&
      left.eachLine === undefined
    ) {
      left.hanging = true;
      return left;
    }

    if (token.value === "each-line" && left.eachLine === undefined) {
      left.eachLine = true;
      return left;
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
        return {
          type: "percentage",
          value: token.value,
          unit: token.unit
        };
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

export const TextIndentGrammar: Grammar<Token, TextIndent> = new Grammar(
  [whitespace, ident, dimension, percentage],
  () => null
);
