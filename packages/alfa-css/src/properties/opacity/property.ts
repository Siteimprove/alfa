import { parse } from "@siteimprove/alfa-lang";
import { clamp } from "@siteimprove/alfa-util";
import { Longhand } from "../../types";
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
    return 1;
  },
  computed(getProperty) {
    const opacity = getProperty("opacity");
    return opacity === undefined ? opacity : clamp(opacity, 0, 1);
  }
};
