import { parse } from "@siteimprove/alfa-lang";
import { clamp } from "@siteimprove/alfa-util";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { OpacityGrammar } from "./grammar";
import { Opacity } from "./types";

/**
 * @see https://www.w3.org/TR/css-color/#propdef-opacity
 */
export const opacity: Longhand<Opacity> = {
  parse(input) {
    const parser = parse(input, OpacityGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.number(1);
  },
  computed(getProperty) {
    return Values.number(clamp(getProperty("opacity").value, 0, 1));
  }
};
