import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { getSpecifiedProperty } from "../helpers/get-property";
import { DisplayGrammar } from "./grammar";
import { Display } from "./types";

const { tuple, keyword } = Values;

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
    return tuple(keyword("inline"), keyword("flow"));
  },
  computed(style) {
    return getSpecifiedProperty(style, "display");
  }
};
