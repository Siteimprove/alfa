import { Color, Numeric } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style";

/**
 * @public
 */
export function hasOutline(
  device: Device,
  context?: Context,
): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device, context);

    return (
      style.computed("outline-width").none(Numeric.isZero) &&
      style.computed("outline-style").none((style) => style.value === "none") &&
      style
        .computed("outline-color")
        .none((color) => color.type === "color" && Color.isTransparent(color))
    );
  };
}
