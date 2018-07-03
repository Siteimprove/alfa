import { parse } from "@siteimprove/alfa-lang";
import { clamp } from "@siteimprove/alfa-util";
import { OpacityGrammar } from "../grammars/opacity";
import { Property } from "../types";

export type Opacity = number;

/**
 * @see https://www.w3.org/TR/css-color/#propdef-opacity
 */
export const OpacityProperty: Property<Opacity> = {
  parse(input) {
    return parse(input, OpacityGrammar);
  },
  initial: 1,
  computed(own, parent) {
    return own.opacity === undefined ? null : clamp(own.opacity, 0, 1);
  }
};
