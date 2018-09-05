import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../types";
import { ContentGrammar } from "./grammar";
import { Content } from "./types";

/**
 * @see https://www.w3.org/TR/css-content/#propdef-content
 */
export const content: Property<Content> = {
  parse(input) {
    return parse(input, ContentGrammar);
  },
  initial() {
    return "normal";
  },
  computed(getProperty) {
    return getProperty("content");
  }
};
