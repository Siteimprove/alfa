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
    const isLighter = value === "lighter";

    switch (parentValue) {
      case 100:
      case 200:
      case 300:
        return isLighter ? 100 : 400;
      case 400:
      case 500:
        return isLighter ? 100 : 700;
      case 600:
      case 700:
        return isLighter ? 400 : 900;
      case 800:
      case 900:
        return isLighter ? 700 : 900;
    }

    return 400;
  }
};
