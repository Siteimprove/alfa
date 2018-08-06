import { parse } from "@siteimprove/alfa-lang";
import { ColorGrammar } from "../grammars/color";
import { Property } from "../types";

export type Color = Readonly<{
  red: number;
  green: number;
  blue: number;
  alpha: number;
}>;

/**
 * @see https://www.w3.org/TR/css-color/#propdef-color
 */
export const ColorProperty: Property<Color> = {
  inherits: true,
  parse(input) {
    return parse(input, ColorGrammar);
  },
  initial() {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  },
  computed(getProperty) {
    return getProperty("color");
  }
};
