import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../types";
import { FontWeight } from "../types";
import { FontWeightGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-weight
 */
export const fontWeight: Longhand<FontWeight> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, FontWeightGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
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

    return isBolder ? parentValue : 700;
  }
};
