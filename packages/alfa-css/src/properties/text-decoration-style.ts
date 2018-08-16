import { parse } from "@siteimprove/alfa-lang";
import { TextDecorationStyleGrammar } from "../grammars/text-decoration-style";
import { Property } from "../types";

export type TextDecorationStyle =
  | "none"
  | "underline"
  | "overline"
  | "line-through"
  | "inherit";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-style-property
 */
export const TextDecorationStyleProperty: Property<TextDecorationStyle> = {
  parse(input) {
    return parse(input, TextDecorationStyleGrammar);
  },
  initial() {
    return "none";
  },
  computed(getProperty, getParentProperty) {
    const value = getProperty("textDecorationStyle");
    if (value === "inherit") {
      return getParentProperty("textDecorationStyle");
    }

    return value;
  }
};
