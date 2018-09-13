import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values } from "../../../values";
import { TextDecorationLine } from "../types";
import { TextDecorationLineGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-line-property
 */
export const textDecorationLine: Longhand<TextDecorationLine> = {
  parse(input) {
    const parser = parse(input, TextDecorationLineGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("none");
  },
  computed(getProperty) {
    return getProperty("textDecorationLine");
  }
};
