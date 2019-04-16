import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import {
  getComputedProperty,
  getSpecifiedProperty
} from "../helpers/get-property";
import { OverflowGrammar } from "./grammar";
import { Overflow } from "./types";

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
    const value = getSpecifiedProperty(style, "overflowY");

    switch (value) {
      case keyword("visible"):
        return keyword("auto");
      case keyword("clip"):
        return keyword("hidden");
    }

    return getSpecifiedProperty(style, "overflowY");
  }
};
