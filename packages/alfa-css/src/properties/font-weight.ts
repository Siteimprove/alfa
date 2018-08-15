import { parse } from "@siteimprove/alfa-lang";
import { FontWeightGrammar } from "../grammars/font-weight";
import { Property } from "../types";

export type FontWeight = Readonly<
  // https://www.w3.org/TR/css-fonts/#absolute-size-value
  | {
      type: "absolute";
      value: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    }
  | {
      type: "relative";
      value: "bolder" | "lighter";
    }
>;

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-family
 */
export const FontWeightProperty: Property<FontWeight> = {
  inherits: true,
  parse(input) {
    return parse(input, FontWeightGrammar);
  },
  initial() {
    return { type: "absolute", value: 400 };
  },
  computed(getProperty) {
    return getProperty("fontWeight");
  }
};
