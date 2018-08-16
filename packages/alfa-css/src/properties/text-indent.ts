import { parse } from "@siteimprove/alfa-lang";
import { TextIndentGrammar } from "../grammars/text-indent";
import { AbsoluteLength, Property, RelativeLength } from "../types";

export type TextIndent =
  | {
      type: "length";
      value: number;
      unit: AbsoluteLength;
      hanging?: boolean;
      eachLine?: boolean;
    }
  | {
      type: "percentage";
      value: number;
      unit?: RelativeLength;
      hanging?: boolean;
      eachLine?: boolean;
    };

/**
 * @see https://www.w3.org/TR/css-content/#propdef-content
 */
export const TextIndentProperty: Property<TextIndent> = {
  inherits: true,
  parse(input) {
    return parse(input, TextIndentGrammar);
  },
  initial() {
    return {
      type: "length",
      value: 0,
      unit: "px"
    };
  },
  computed(getProperty) {
    return getProperty("textIndent");
  }
};
