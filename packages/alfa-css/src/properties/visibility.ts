import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../types";
import { VisibilityGrammar } from "../grammars/visibility";

export type Visibility = "visible" | "hidden" | "collapse";

/**
 * @see https://drafts.csswg.org/css-box/#propdef-visibility
 */
export const VisibilityProperty: Property<Visibility> = {
  inherits: true,
  parse(input) {
    return parse(input, VisibilityGrammar);
  },
  initial: "visible",
  computed(own, parent) {
    return own.visibility === undefined ? null : own.visibility;
  }
};
