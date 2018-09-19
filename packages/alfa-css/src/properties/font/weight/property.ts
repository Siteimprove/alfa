import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values, ValueType } from "../../../values";
import { FontWeight, RelativeFontWeight } from "../types";
import { FontWeightGrammar } from "./grammar";

const { keyword, number } = Values;

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
    return keyword("normal");
  },
  computed(getProperty, getParentProperty) {
    const value = getProperty("fontWeight");

    if (value.type === ValueType.Number) {
      return value;
    }

    switch (value.value) {
      case "normal":
        return number(400);
      case "bold":
        return number(700);
      case "lighter":
      case "bolder":
        return resolveRelativeFontWeight(
          value,
          getParentProperty("fontWeight")
        );
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
