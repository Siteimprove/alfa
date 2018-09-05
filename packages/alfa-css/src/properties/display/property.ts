import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../types";
import { DisplayGrammar } from "./grammar";
import { Display } from "./types";

/**
 * @see https://www.w3.org/TR/css-display/#propdef-display
 */
export const display: Property<Display> = {
  parse(input) {
    return parse(input, DisplayGrammar);
  },
  initial() {
    return ["inline", "flow"];
  },
  computed(getProperty) {
    return getProperty("display");
  }
};
