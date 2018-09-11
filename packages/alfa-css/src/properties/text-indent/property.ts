import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../types";
import { TextIndentGrammar } from "./grammar";
import { TextIndent } from "./types";

/**
 * @see https://www.w3.org/TR/css-text-3/#propdef-text-indent
 */
export const textIndent: Longhand<TextIndent> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, TextIndentGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
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
