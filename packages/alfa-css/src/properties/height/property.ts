import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Resolvers } from "../../resolvers";
import { Values, ValueType } from "../../values";
import {
  getComputedProperty,
  getSpecifiedProperty
} from "../helpers/get-property";
import { HeightGrammar } from "./grammar";
import { Height } from "./types";

/**
 * @see https://www.w3.org/TR/CSS22/visudet.html#propdef-height
 */
export const height: Longhand<
  Height,
  Values.Keyword<"auto"> | Values.Percentage | Values.Length
> = {
  parse(input) {
    const parser = parse(input, HeightGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("auto");
  },
  computed(style, device) {
    const { value, source } = getSpecifiedProperty(style, "height");

    switch (value.type) {
      case ValueType.Keyword:
        return { value, source };

      case ValueType.Length:
        return { value: Resolvers.length(value, device, style), source };

      case ValueType.Percentage:
        const { value: parentValue } = getComputedProperty(
          style.parent,
          "height"
        );

        if (parentValue.type !== ValueType.Length) {
          return { value, source };
        }

        return {
          value: Resolvers.percentage(value, parentValue, device, style),
          source
        };
    }
  }
};
