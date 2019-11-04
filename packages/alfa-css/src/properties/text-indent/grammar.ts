import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Units } from "../../units";
import { Values } from "../../values";
import { TextIndent } from "./types";

type Production<T extends Token> = Lang.Production<Token, TextIndent, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  infix(token, stream, expression, left) {
    if (
      token.value === "hanging" &&
      left.value.hanging === undefined &&
      left.value.eachLine === undefined
    ) {
      left.value.hanging = Values.boolean(true);
      return left;
    }

    if (token.value === "each-line" && left.value.eachLine === undefined) {
      left.value.eachLine = Values.boolean(true);
      return left;
    }

    return null;
  }
};

const dimension: Production<Tokens.Dimension> = {
  token: TokenType.Dimension,
  prefix(token) {
    if (Units.isLength(token.unit)) {
      return Values.dictionary({
        indent: Values.length(token.value, token.unit)
      });
    }

    return null;
  }
};

const percentage: Production<Tokens.Percentage> = {
  token: TokenType.Percentage,
  prefix(token) {
    return Values.dictionary({ indent: Values.percentage(token.value) });
  }
};

export const TextIndentGrammar: Grammar<Token, TextIndent> = new Grammar(
  [skip(TokenType.Whitespace), ident, dimension, percentage],
  () => null
);
