import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values } from "../../../values";
import { FontFamily } from "../types";
import { FontFamilyGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-family
 */
export const fontFamily: Longhand<FontFamily> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, FontFamilyGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.list(Values.keyword("serif"));
  },
  computed(getProperty) {
    return getProperty("fontFamily");
  }
};
