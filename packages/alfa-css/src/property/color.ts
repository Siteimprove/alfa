import { parse } from "@siteimprove/alfa-lang";
import { ColorGrammar } from "../grammar/color";
import { Property } from "../types";

export interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly alpha: number;
}

/**
 * @see https://www.w3.org/TR/css-color/#the-color-property
 */
export const ColorProperty: Property<Color> = {
  inherits: true,
  parse(input) {
    return parse(input, ColorGrammar);
  },
  initial() {
    return { red: 0, green: 0, blue: 0, alpha: 1 };
  },
  computed(own, parent) {
    return own.color || null;
  }
};
