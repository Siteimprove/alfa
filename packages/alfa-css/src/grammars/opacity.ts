import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Token, Number, Percentage } from "../alphabet";
import { whitespace } from "../grammar";
import { Opacity } from "../properties/opacity";

type Production<T extends Token> = Lang.Production<Token, Opacity, T>;

const number: Production<Number> = {
  token: "number",
  prefix(token) {
    return token.value;
  }
};

const percentage: Production<Percentage> = {
  token: "percentage",
  prefix(token) {
    return token.value;
  }
};

export const OpacityGrammar: Grammar<Token, Opacity> = new Grammar([
  whitespace,
  number,
  percentage
]);
