import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../types";
import { ContentGrammar } from "./grammar";
import { Content } from "./types";

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
    return "normal";
  },
  computed(getProperty) {
    return getProperty("content");
  }
};
