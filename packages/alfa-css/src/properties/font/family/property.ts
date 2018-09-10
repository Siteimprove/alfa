import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../types";
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
    return "serif";
  },
  computed(getProperty) {
    return getProperty("fontFamily");
  }
};
