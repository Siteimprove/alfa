import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Resolvers } from "../../resolvers";
import { Values, ValueType } from "../../values";
import {
  getComputedProperty,
  getSpecifiedProperty
} from "../helpers/get-property";
import { LineHeightGrammar } from "./grammar";
import { LineHeight } from "./types";

/**
 * @see https://www.w3.org/TR/CSS22/visudet.html#propdef-line-height
 */
export const lineHeight: Longhand<
  LineHeight,
  Values.Keyword<"normal"> | Values.Number | Values.Length<"px">
> = {
  inherits: true,
  depends: ["fontSize"],
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
  computed(style, device) {
    const value = getSpecifiedProperty(style, "lineHeight");
    const fontSize = getComputedProperty(style, "fontSize");

    switch (value.type) {
      case ValueType.Number:
      case ValueType.Keyword:
        return value;

      case ValueType.Length:
        return Resolvers.length(value, device, style);

      case ValueType.Percentage:
        return Resolvers.percentage(value, fontSize, device, style);
    }
  }
};
