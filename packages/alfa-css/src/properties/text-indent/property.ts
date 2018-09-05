import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../types";
import { TextIndentGrammar } from "./grammar";
import { TextIndent } from "./types";

/**
 * @see https://www.w3.org/TR/css-text-3/#propdef-text-indent
 */
export const textIndent: Property<TextIndent> = {
  inherits: true,
  parse(input) {
    return parse(input, TextIndentGrammar);
  },
  initial() {
    return {
      type: "length",
      value: 0,
      unit: "px"
    };
  },
  computed(getProperty) {
    return getProperty("textIndent");
  }
};
