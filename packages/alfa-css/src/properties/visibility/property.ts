import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../types";
import { VisibilityGrammar } from "./grammar";
import { Visibility } from "./types";

/**
 * @see https://drafts.csswg.org/css-box/#propdef-visibility
 */
export const visibility: Property<Visibility> = {
  inherits: true,
  parse(input) {
    return parse(input, VisibilityGrammar);
  },
  initial() {
    return "visible";
  },
  computed(getProperty) {
    return getProperty("visibility");
  }
};
