import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { getSpecifiedProperty } from "../helpers/get-property";
import { ContentGrammar } from "./grammar";
import { Content } from "./types";

const { keyword } = Values;

/**
 * @see https://www.w3.org/TR/css-content/#propdef-content
 */
export const content: Longhand<Content> = {
  parse(input) {
    const parser = parse(input, ContentGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return keyword("normal");
  },
  computed(style) {
    return getSpecifiedProperty(style, "content");
  }
};
