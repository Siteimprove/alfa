import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Units } from "../../units";
import { Values, ValueType } from "../../values";
import { LineHeightGrammar } from "./grammar";
import { LineHeight } from "./types";

/**
 * @see https://www.w3.org/TR/CSS22/visudet.html#propdef-line-height
 */
export const lineHeight: Longhand<LineHeight> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, LineHeightGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("normal");
  },
  computed(getProperty) {
    const value = getProperty("lineHeight");

    switch (value.type) {
      case ValueType.Number:
      case ValueType.Keyword:
        return value;

      case ValueType.Length:
        if (Units.isRelativeLength(value.unit)) {
          throw new Error(`Cannot resolve unit "${value.unit}"`);
        }

        return value;

      case ValueType.Percentage:
        return value;
    }
  }
};
