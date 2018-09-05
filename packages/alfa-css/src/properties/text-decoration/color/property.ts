import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../../types";
import { ColorGrammar, Transparent } from "../../color/grammar";
import { Color } from "../../color/types";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-color-property
 */
export const textDecorationColor: Property<Color> = {
  parse(input) {
    return parse(input, ColorGrammar);
  },
  initial() {
    return Transparent; // TODO: Should be currentColor when supported in colorGrammar
  },
  computed(getProperty) {
    return getProperty("textDecorationColor");
  }
};
