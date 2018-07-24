import { parse } from "@siteimprove/alfa-lang";
import { ContentGrammar } from "../grammars/content";
import { Property } from "../types";

export type ContentList = Array<string>;

export type Content = "normal" | "none" | ContentList;

/**
 * @see https://www.w3.org/TR/css-content/#propdef-content
 */
export const ContentProperty: Property<Content> = {
  parse(input) {
    return parse(input, ContentGrammar);
  },
  initial() {
    return "normal";
  },
  computed(own, parent) {
    return own.content === undefined ? null : own.content;
  }
};
