import { parse } from "@siteimprove/alfa-lang";
import { Longhand } from "../../properties";
import { Values, ValueType } from "../../values";
import { getSpecifiedProperty } from "../helpers/get-property";
import { hslToRgb } from "./convert";
import { ColorGrammar } from "./grammar";
import { NamedColors } from "./named";
import { Color } from "./types";

const { isKeyword, number, func } = Values;

/**
 * @see https://www.w3.org/TR/css-color/#propdef-color
 */
export const color: Longhand<Color, Color.RGB> = {
  inherits: true,
  parse(input) {
    const parser = parse(input, ColorGrammar);

    if (!parser.done) {
      return null;
    }

    return parser.result;
  },
  initial() {
    return func("rgb", [number(0), number(0), number(0)]);
  },
  computed(style) {
    const { value, source } = getSpecifiedProperty(style, "color");

    if (isKeyword(value, "transparent")) {
      return {
        value: func("rgb", [number(0), number(0), number(0), number(0)]),
        source
      };
    }

    switch (value.type) {
      case ValueType.String:
        return {
          value: NamedColors[value.value],
          source
        };

      case ValueType.Number:
        const { value: hex } = value;
        return {
          value: func("rgb", [
            number((hex >> 24) & 0xff),
            number((hex >> 16) & 0xff),
            number((hex >> 8) & 0xff),
            number((hex & 0xff) / 0xff)
          ]),
          source
        };
    }

    const { value: color } = value;

    switch (color.name) {
      case "rgb": {
        const [red, green, blue, alpha] = color.args;
        return {
          value: func(
            "rgb",
            alpha === undefined ? [red, green, blue] : [red, green, blue, alpha]
          ),
          source
        };
      }

      case "hsl": {
        const [hue, saturation, lightness, alpha] = color.args;
        const [red, green, blue] = hslToRgb(
          hue.value,
          saturation.value,
          lightness.value
        );
        return {
          value: func(
            "rgb",
            alpha === undefined
              ? [number(red), number(green), number(blue)]
              : [number(red), number(green), number(blue), number(alpha.value)]
          ),
          source
        };
      }
    }
  }
};
