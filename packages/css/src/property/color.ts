import { parse } from "@siteimprove/alfa-lang";
import { Color, ColorGrammar } from "../grammar/color";
import { Property } from "../types";

export { Color };

/**
 * @see https://www.w3.org/TR/css-color/#the-color-property
 */
export const ColorProperty: Property<Color> = {
  inherits: true,
  parse(input) {
    return parse(input, ColorGrammar);
  },
  initial() {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  },
  computed(own, parent) {
    return own.color || null;
  }
};
