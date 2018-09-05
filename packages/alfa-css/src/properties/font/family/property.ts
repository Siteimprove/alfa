import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../../types";
import { FontFamily } from "../types";
import { FontFamilyGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-family
 */
export const fontFamily: Property<FontFamily> = {
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
