import { parse } from "@siteimprove/alfa-lang";
import { Property } from "../../../types";
import { FontSize } from "../types";
import { FontSizeGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-size
 */
export const fontSize: Property<FontSize> = {
  inherits: true,
  parse(input) {
    return parse(input, FontSizeGrammar);
  },
  initial() {
    return { type: "absolute", value: "medium" };
  },
  computed(getProperty, getParentProperty) {
    const value = getProperty("fontSize");
    const parentValue = getParentProperty("fontSize");

    if (value === undefined) {
      return undefined;
    }

    if (value.type === "absolute") {
      let factor = 1;

      switch (value.value) {
        case "xx-small":
          factor = 3 / 5;
          break;
        case "x-small":
          factor = 3 / 4;
          break;
        case "small":
          factor = 8 / 9;
          break;
        case "medium":
          factor = 1;
          break;
        case "large":
          factor = 6 / 5;
          break;
        case "x-large":
          factor = 3 / 2;
          break;
        case "xx-large":
          factor = 2;
      }

      let base = 16;

      if (getProperty("fontFamily") === "monospace") {
        base = 13;
      }

      return {
        type: "length",
        value: Math.round(factor * base),
        unit: "px"
      };
    }

    if (parentValue !== undefined && parentValue.type === "length") {
      if (value.type === "percentage") {
        if (value.unit === undefined) {
          return {
            type: "length",
            value: parentValue.value * value.value,
            unit: parentValue.unit
          };
        }

        switch (value.unit) {
          case "em":
            return {
              type: "length",
              value: parentValue.value * value.value,
              unit: parentValue.unit
            };
        }
      }

      if (value.type === "relative") {
        switch (value.value) {
          case "smaller":
            return {
              type: "length",
              value: parentValue.value / 1.2,
              unit: parentValue.unit
            };
          case "larger":
            return {
              type: "length",
              value: parentValue.value * 1.2,
              unit: parentValue.unit
            };
        }
      }
    }

    return value;
  }
};
