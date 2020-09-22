import { Converter, Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";

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
   *
   * @remarks
   * Relative lengths in media queries are based on initial values of the
   * associated properties.
   */
  export function length(length: Length, device: Device): Length<"px"> {
    const { unit, value } = length;
    const { viewport } = device;

    switch (unit) {
      // https://www.w3.org/TR/css-values/#em
      case "em":
      // https://www.w3.org/TR/css-values/#rem
      case "rem":
        return Length.of(16 * value, "px");

      // https://www.w3.org/TR/css-values/#ex
      case "ex":
      // https://www.w3.org/TR/css-values/#ch
      case "ch":
        return Length.of(16 * value * 0.5, "px");

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
}
