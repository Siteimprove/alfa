import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../../properties";
import { Values } from "../../../values";
import { getSpecifiedProperty } from "../../helpers/get-property";
import { OverflowGrammar } from "../grammar";
import { Overflow } from "../types";

const { keyword } = Values;

/**
 * @see https://drafts.csswg.org/css-overflow-3/#propdef-overflow
 */
export const overflowY: Longhand<Overflow> = {
  parse(input) {
    const parser = parse(input, OverflowGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return keyword("visible");
  },
  computed(style) {
    const { value: valueY, source } = getSpecifiedProperty(style, "overflowY");
    const { value: valueX } = getSpecifiedProperty(style, "overflowX");

    if (valueX.value !== "visible" && valueX.value !== "clip") {
      switch (valueY.value) {
        case "visible":
          return { value: keyword("auto"), source };
        case "clip":
          return { value: keyword("hidden"), source };
      }
    }

    return { value: valueY, source };
  }
};
