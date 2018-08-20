import { parse } from "@siteimprove/alfa-lang";
import { TextDecorationLineGrammar } from "../grammars/text-decoration-line";
import { Property } from "../types";

export type TextDecorationLine =
  | "none"
  | "underline"
  | "overline"
  | "line-through"
  | "blink";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-line-property
 */
export const TextDecorationLineProperty: Property<TextDecorationLine> = {
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
