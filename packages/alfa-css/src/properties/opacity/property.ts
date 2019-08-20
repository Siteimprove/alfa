import { parse } from "@siteimprove/alfa-lang";
import { clamp } from "@siteimprove/alfa-util";
import { Longhand } from "../../properties";
import { Values } from "../../values";
import { getSpecifiedProperty } from "../helpers/get-property";
import { OpacityGrammar } from "./grammar";
import { Opacity } from "./types";

const { number } = Values;

/**
 * @see https://www.w3.org/TR/css-color/#propdef-opacity
 */
export const opacity: Longhand<Opacity> = {
  parse(input) {
    const parser = parse(input, OpacityGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return number(1);
  },
  computed(style) {
    const { value, source } = getSpecifiedProperty(style, "opacity");

    return {
      value: number(clamp(value.value, 0, 1)),
      source
    };
  }
};
