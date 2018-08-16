import { parse } from "@siteimprove/alfa-lang";
import { ColorGrammar, Transparent } from "../grammars/color";
import { Property } from "../types";
import { Color } from "./color";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-color-property
 */
export const TextDecorationColorProperty: Property<Color> = {
  parse(input) {
    return parse(input, ColorGrammar);
  },
  initial() {
    return Transparent; // TODO: Should be currentColor when supported in colorGrammar
  },
  computed(getProperty, getParentProperty) {
    return getProperty("textDecorationColor");
  }
};
