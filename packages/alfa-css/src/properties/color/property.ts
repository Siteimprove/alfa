import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
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
    return Values.color(0, 0, 0, 1);
  },
  computed(getProperty) {
    return getProperty("color");
  }
};
