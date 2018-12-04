import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { ColorGrammar, Transparent } from "../../color/grammar";
import { Color } from "../../color/types";
import { getSpecifiedProperty } from "../../helpers/get-property";

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
  /**
   * @todo Should be currentColor when supported in colorGrammar
   */
  initial() {
    return Transparent;
  },
  computed(style) {
    return getSpecifiedProperty(style, "textDecorationColor");
  }
};
