import {
  Color,
  Converter,
  Length,
  Percentage,
  RGB,
} from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";

import { Style } from "./style";

/**
 * Resolvers are functions that resolve values to their canonical, computed
 * representation.
 *
 * @internal
 */
export namespace Resolver {
  /**
   * Resolve a length in an arbitrary unit to a length in pixels.
   *
   * @see https://drafts.csswg.org/css-values/#lengths
   */
  export function length(length: Length, style: Style): Length<"px"> {
    const { unit, value } = length;
    const { viewport } = style.device;

    const { value: fontSize } = style.computed("font-size");

    switch (unit) {
      // https://www.w3.org/TR/css-values/#em
      case "em":
        return Length.of(fontSize.value * value, fontSize.unit);

      // https://www.w3.org/TR/css-values/#rem
      case "rem": {
        const { value: rootFontSize } = style.root().computed("font-size");

        return Length.of(rootFontSize.value * value, fontSize.unit);
      }

      // https://www.w3.org/TR/css-values/#ex
      case "ex":
      // https://www.w3.org/TR/css-values/#ch
      case "ch":
        return Length.of(fontSize.value * value * 0.5, fontSize.unit);

      // https://www.w3.org/TR/css-values/#vh
      case "vh":
        return Length.of((viewport.height * value) / 100, "px");

      // https://www.w3.org/TR/css-values/#vw
      case "vw":
        return Length.of((viewport.width * value) / 100, "px");

      // https://www.w3.org/TR/css-values/#vmin
      case "vmin":
        return Length.of(
          (Math.min(viewport.width, viewport.height) * value) / 100,
          "px"
        );

      // https://www.w3.org/TR/css-values/#vmax
      case "vmax":
        return Length.of(
          (Math.max(viewport.width, viewport.height) * value) / 100,
          "px"
        );
    }

    return Length.of(Converter.length(value, unit, "px"), "px");
  }

  /**
   * @see https://drafts.csswg.org/css-color/#resolving-color-values
   */
  export function color(color: Color) {
    switch (color.type) {
      case "color": {
        const [red, green, blue] = [
          color.red,
          color.green,
          color.blue,
        ].map((channel) =>
          Percentage.of(
            Real.clamp(
              channel.type === "number" ? channel.value / 0xff : channel.value,
              0,
              1
            )
          )
        );

        return RGB.of(
          red,
          green,
          blue,
          Percentage.of(Real.clamp(color.alpha.value, 0, 1))
        );
      }

      case "keyword":
        return color;
    }
  }
}
