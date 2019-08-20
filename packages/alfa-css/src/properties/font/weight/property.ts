import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values, ValueType } from "../../../values";
import {
  getComputedProperty,
  getSpecifiedProperty
} from "../../helpers/get-property";
import { FontWeight, RelativeFontWeight } from "../types";
import { FontWeightGrammar } from "./grammar";

const { number } = Values;

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-weight
 */
export const fontWeight: Longhand<FontWeight, Values.Number> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, FontWeightGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return number(400);
  },
  computed(style, device) {
    const { value, source } = getSpecifiedProperty(style, "fontWeight");

    if (value.type === ValueType.Number) {
      return { value, source };
    }

    switch (value.value) {
      case "normal":
        return { value: number(400), source };
      case "bold":
        return { value: number(700), source };
      case "lighter":
      case "bolder":
        return {
          value: resolveRelativeFontWeight(
            value,
            getComputedProperty(style.parent, "fontWeight").value
          ),
          source
        };
    }
  }
};

function resolveRelativeFontWeight(
  { value }: RelativeFontWeight,
  { value: parentValue }: Values.Number
): Values.Number {
  const isBolder = value === "bolder";

  if (parentValue >= 1 && parentValue <= 99) {
    return number(isBolder ? 400 : parentValue);
  }

  if (parentValue >= 100 && parentValue <= 349) {
    return number(isBolder ? 400 : 100);
  }

  if (parentValue >= 350 && parentValue <= 549) {
    return number(isBolder ? 700 : 100);
  }

  if (parentValue >= 550 && parentValue <= 749) {
    return number(isBolder ? 900 : 400);
  }

  if (parentValue >= 750 && parentValue <= 899) {
    return number(isBolder ? 900 : 700);
  }

  return number(isBolder ? parentValue : 700);
}
