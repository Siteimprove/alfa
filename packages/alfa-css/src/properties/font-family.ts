import { parse } from "@siteimprove/alfa-lang";
import { FontFamilyGrammar } from "../grammars/font-family";
import { Property } from "../types";

export type FontFamily = string | Array<string>;

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-family
 */
export const FontFamilyProperty: Property<FontFamily> = {
  inherits: true,
  parse(input) {
    return parse(input, FontFamilyGrammar);
  },
  initial() {
    return "serif";
  },
  computed(getProperty) {
    return getProperty("fontFamily");
  }
};
