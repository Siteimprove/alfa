import { parse } from "@siteimprove/alfa-lang";
import { FontWeightGrammar } from "../grammars/font-weight";
import { Property } from "../types";

export type FontWeight = number | "bolder" | "lighter";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-weight
 */
export const FontWeightProperty: Property<FontWeight> = {
  inherits: true,
  parse(input) {
    return parse(input, FontWeightGrammar);
  },
  initial() {
    return 400;
  },
  computed(getProperty, getParentProperty) {
    const value = getProperty("fontWeight");

    if (value !== "lighter" && value !== "bolder") {
      return value;
    }

    const parentValue = getParentProperty("fontWeight");
    const isBolder = value === "bolder";

    if (typeof parentValue !== "number") {
      return undefined;
    }

    if (parentValue >= 1 && parentValue <= 99) {
      return isBolder ? 400 : parentValue;
    }

    if (parentValue >= 100 && parentValue <= 349) {
      return isBolder ? 400 : 100;
    }

    if (parentValue >= 350 && parentValue <= 549) {
      return isBolder ? 700 : 100;
    }

    if (parentValue >= 550 && parentValue <= 749) {
      return isBolder ? 900 : 400;
    }

    if (parentValue >= 750 && parentValue <= 899) {
      return isBolder ? 900 : 700;
    }

    if (parentValue >= 900 && parentValue <= 999) {
      return isBolder ? parentValue : 700;
    }

    return 400;
  }
};
