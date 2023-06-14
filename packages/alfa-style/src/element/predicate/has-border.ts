import { Color, Numeric } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style";

const sides = ["top", "right", "bottom", "left"] as const;

/**
 * @public
 */
export function hasBorder(
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device, context);

    return sides.some(
      (side) =>
        style.computed(`border-${side}-width` as const).none(Numeric.isZero) &&
        style
          .computed(`border-${side}-color` as const)
          .none((color) => color.type === "color" && Color.isTransparent(color))
    );
  };
}
