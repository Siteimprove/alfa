import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../types";
import { ColorGrammar } from "./grammar";
import { Color } from "./types";

/**
 * @see https://www.w3.org/TR/css-color/#propdef-color
 */
export const color: Property<Color> = {
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
