import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Resolvers } from "../../resolvers";
import { Values, ValueType } from "../../values";
import {
  getComputedProperty,
  getSpecifiedProperty
} from "../helpers/get-property";
import { WidthGrammar } from "./grammar";
import { Width } from "./types";

/**
 * @see https://www.w3.org/TR/CSS22/visudet.html#propdef-width
 */
export const width: Longhand<
  Width,
  Values.Keyword<"auto"> | Values.Percentage | Values.Length
> = {
  depends: ["width"],
  parse(input) {
    const parser = parse(input, WidthGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return Values.keyword("auto");
  },
  computed(style, device) {
    const value = getSpecifiedProperty(style, "width");
    const parentValue = getComputedProperty(style.parent, "width");

    switch (value.type) {
      case ValueType.Keyword:
        return value;

      case ValueType.Length:
        return Resolvers.length(value, device, style);

      case ValueType.Percentage:
        if (parentValue.type !== ValueType.Length) {
          return Values.keyword("auto");
        }
        return Resolvers.percentage(value, parentValue, device, style);
    }
  }
};
