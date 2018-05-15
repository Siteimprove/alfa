import * as Lang from "@alfa/lang";
import { Grammar, Stream } from "@alfa/lang";
import { Token, Whitespace, Ident, Dimension, Percentage } from "../alphabet";
import { RelativeLength, AbsoluteLength } from "../units";

export type FontSize = Readonly<
  // https://www.w3.org/TR/css-fonts-3/#absolute-size-value
  | {
      type: "absolute";
      value:
        | "xx-small"
        | "x-small"
        | "small"
        | "medium"
        | "large"
        | "x-large"
        | "xx-large";
    }
  // https://www.w3.org/TR/css-fonts-3/#relative-size-value
  | { type: "relative"; value: "larger" | "smaller" }
  // https://www.w3.org/TR/css-fonts-3/#length-percentage-size-value
  | { type: "length"; value: number; unit: AbsoluteLength }
  | { type: "percentage"; value: number; unit?: RelativeLength }
>;

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

const ident: Production<Ident, FontSize> = {
  token: "ident",
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

const dimension: Production<Dimension, FontSize> = {
  token: "dimension",
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

const percentage: Production<Percentage, FontSize> = {
  token: "percentage",
  prefix(token) {
    return { type: "percentage", value: token.value };
  }
};

export const FontSizeGrammar: Grammar<Token, FontSize> = new Grammar([
  whitespace,
  ident,
  dimension,
  percentage
]);
