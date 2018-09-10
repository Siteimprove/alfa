import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../types";
import { ColorGrammar } from "./grammar";
import { Color } from "./types";

/**
 * @see https://www.w3.org/TR/css-color/#propdef-color
 */
export const color: Longhand<Color> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, ColorGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  },
  computed(getProperty) {
    return getProperty("color");
  }
};
