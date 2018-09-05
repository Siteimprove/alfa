import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../../types";
import { TextDecorationStyle } from "../types";
import { TextDecorationStyleGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-style-property
 */
export const textDecorationStyle: Property<TextDecorationStyle> = {
  parse(input) {
    return parse(input, TextDecorationStyleGrammar);
  },
  initial() {
    return "none";
  },
  computed(getProperty, getParentProperty) {
    return getProperty("textDecorationStyle");
  }
};
