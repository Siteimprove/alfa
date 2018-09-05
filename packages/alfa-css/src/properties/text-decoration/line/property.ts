import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../../types";
import { TextDecorationLine } from "../types";
import { TextDecorationLineGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-line-property
 */
export const textDecorationLine: Property<TextDecorationLine> = {
  parse(input) {
    return parse(input, TextDecorationLineGrammar);
  },
  initial() {
    return "none";
  },
  computed(getProperty, getParentProperty) {
    return getProperty("textDecorationLine");
  }
};
