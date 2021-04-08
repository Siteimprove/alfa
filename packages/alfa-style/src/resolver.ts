import {
  Color,
  Converter,
  Current,
  Gradient,
  Image,
  Length,
  Linear,
  Percentage,
  RGB,
  System,
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
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
   * {@link https://drafts.csswg.org/css-values/#lengths}
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
   * {@link https://drafts.csswg.org/css-color/#resolving-color-values}
   */
  export function color(
    color: Color
  ): Current | System | RGB<Percentage, Percentage> {
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

  export function image(image: Image, style: Style) {
    switch (image.image.type) {
      case "url":
        return Image.of(image.image);

      case "gradient":
        return gradient(image.image, style);
    }
  }

  function gradient(gradient: Gradient, style: Style) {
    switch (gradient.kind) {
      case "linear": {
        const { direction, items, repeats } = gradient;

        return Image.of(
          Linear.of(
            direction.type === "angle" ? direction.withUnit("deg") : direction,
            Iterable.map(items, (item) => gradientItem(item, style)),
            repeats
          )
        );
      }
    }
  }

  function gradientItem(item: Gradient.Item, style: Style) {
    switch (item.type) {
      case "stop": {
        const { color, position } = item;

        return Gradient.Stop.of(
          Resolver.color(color),
          position.map((position) =>
            position.type === "length" ? length(position, style) : position
          )
        );
      }

      case "hint": {
        const { position } = item;

        return Gradient.Hint.of(
          position.type === "length" ? length(position, style) : position
        );
      }
    }
  }
}
