import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { getSpecifiedProperty } from "../helpers/get-property";
import { TextIndentGrammar } from "./grammar";
import { TextIndent } from "./types";

const { dictionary, length } = Values;

/**
 * @see https://www.w3.org/TR/css-text/#propdef-text-indent
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
    return dictionary({ indent: length(0, "px") });
  },
  computed(style) {
    return getSpecifiedProperty(style, "textIndent");
  }
};
