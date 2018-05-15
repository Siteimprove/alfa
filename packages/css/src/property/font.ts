import { parse } from "@alfa/lang";
import { FontSize, FontSizeGrammar } from "../grammar/font";
import { Property } from "../types";

export { FontSize };

/**
 * @see https://www.w3.org/TR/css-fonts/#font-size-prop
 */
export const FontSizeProperty: Property<FontSize> = {
  inherits: true,
  parse(input) {
    return parse(input, FontSizeGrammar);
  },
  initial() {
    return { type: "absolute", value: "medium" };
  },
  computed(own, parent) {
    const value = own.fontSize;
    const parentValue = parent.fontSize;

    if (value === undefined) {
      return null;
    }

    if (value.type === "absolute") {
      let factor: number;

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
        default:
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

      return {
        type: "length",
        value: Math.round(factor * 16),
        unit: "px"
      };
    }

    if (parentValue !== undefined && parentValue.type === "length") {
      if (value.type === "percentage") {
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
