import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Units } from "../../../units";
import { Values, ValueType } from "../../../values";
import {
  AbsoluteFontSize,
  FontFamily,
  FontSize,
  RelativeFontSize
} from "../types";
import { FontSizeGrammar } from "./grammar";

/**
 * @see https://www.w3.org/TR/css-fonts/#propdef-font-size
 */
export const fontSize: Longhand<
  FontSize,
  Values.Length<Units.AbsoluteLength>
> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, FontSizeGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("medium");
  },
  computed(getProperty, getParentProperty) {
    const value = getProperty("fontSize");

    switch (value.type) {
      case ValueType.Keyword:
        switch (value.value) {
          case "xx-small":
          case "x-small":
          case "small":
          case "medium":
          case "large":
          case "x-large":
          case "xx-large":
            return resolveAbsoluteFontSize(value, getProperty("fontFamily"));
        }

        return resolveRelativeFontSize(value, getParentProperty("fontSize"));

      case ValueType.Length:
        return resolveLengthFontSize(value, getParentProperty("fontSize"));

      case ValueType.Percentage:
        return resolvePercentageFontSize(value, getParentProperty("fontSize"));
    }
  }
};

function resolveAbsoluteFontSize(
  { value }: AbsoluteFontSize,
  fontFamily: FontFamily
): Values.Length<"px"> {
  let factor: number;

  switch (value) {
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

  const base = fontFamily.value[0].value === "monospace" ? 13 : 16;

  return {
    type: ValueType.Length,
    value: Math.round(factor * base),
    unit: "px"
  };
}

function resolveRelativeFontSize(
  { value }: RelativeFontSize,
  { value: parentValue, unit }: Values.Length<Units.AbsoluteLength>
): Values.Length<Units.AbsoluteLength> {
  switch (value) {
    case "smaller":
      return {
        type: ValueType.Length,
        value: parentValue / 1.2,
        unit
      };
    case "larger":
      return {
        type: ValueType.Length,
        value: parentValue * 1.2,
        unit
      };
  }
}

function resolveLengthFontSize(
  { value, unit }: Values.Length,
  { value: parentValue, unit: parentUnit }: Values.Length<Units.AbsoluteLength>
): Values.Length<Units.AbsoluteLength> {
  switch (unit) {
    // https://www.w3.org/TR/css-values/#em
    case "em":
      return Values.length(parentValue * value, parentUnit);

    // https://www.w3.org/TR/css-values/#ex
    case "ex":
      return Values.length(parentValue * value * 0.5, parentUnit);
  }

  if (Units.isRelativeLength(unit)) {
    throw new Error(`Cannot resolve unit "${unit}"`);
  }

  return Values.length(value, unit);
}

function resolvePercentageFontSize(
  { value }: Values.Percentage,
  { value: parentValue, unit }: Values.Length<Units.AbsoluteLength>
): Values.Length<Units.AbsoluteLength> {
  return {
    type: ValueType.Length,
    value: parentValue * value,
    unit
  };
}
