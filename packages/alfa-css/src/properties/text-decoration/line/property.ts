import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values } from "../../../values";
import { getSpecifiedProperty } from "../../helpers/get-property";
import { TextDecorationLine } from "../types";
import { TextDecorationLineGrammar } from "./grammar";

const { keyword } = Values;

/**
 * @see https://www.w3.org/TR/css-text-decor-3/#text-decoration-line-property
 */
export const textDecorationLine: Longhand<TextDecorationLine> = {
  parse(input) {
    const parser = parse(input, TextDecorationLineGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return keyword("none");
  },
  computed(style) {
    return getSpecifiedProperty(style, "textDecorationLine");
  }
};
