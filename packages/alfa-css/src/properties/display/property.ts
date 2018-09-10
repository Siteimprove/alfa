import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../types";
import { DisplayGrammar } from "./grammar";
import { Display } from "./types";

/**
 * @see https://www.w3.org/TR/css-display/#propdef-display
 */
export const display: Longhand<Display> = {
  parse(input) {
    const parser = parse(input, DisplayGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return ["inline", "flow"];
  },
  computed(getProperty) {
    return getProperty("display");
  }
};
