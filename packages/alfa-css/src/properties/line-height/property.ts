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
    const { value, source } = getSpecifiedProperty(style, "lineHeight");

    switch (value.type) {
      case ValueType.Number:
      case ValueType.Keyword:
        return { value, source };

      case ValueType.Length:
        return { value: Resolvers.length(value, device, style), source };

      case ValueType.Percentage:
        return {
          value: Resolvers.percentage(
            value,
            getComputedProperty(style, "fontSize").value,
            device,
            style
          ),
          source
        };
    }
  }
};
