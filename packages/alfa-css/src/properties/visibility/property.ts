import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { VisibilityGrammar } from "./grammar";
import { Visibility } from "./types";

/**
 * @see https://drafts.csswg.org/css-box/#propdef-visibility
 */
export const visibility: Longhand<Visibility> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, VisibilityGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("visible");
  },
  computed(getProperty) {
    return getProperty("visibility");
  }
};
