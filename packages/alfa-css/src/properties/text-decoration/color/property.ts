import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../types";
import { ColorGrammar, Transparent } from "../../color/grammar";
import { Color } from "../../color/types";

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-color-property
 */
export const textDecorationColor: Longhand<Color> = {
  parse(input) {
    const parser = parse(input, ColorGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Transparent; // TODO: Should be currentColor when supported in colorGrammar
  },
  computed(getProperty) {
    return getProperty("textDecorationColor");
  }
};
