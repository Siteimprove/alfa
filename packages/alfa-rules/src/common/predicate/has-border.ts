import { Color, Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";

const sides = ["top", "right", "bottom", "left"] as const;

export function hasBorder(
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device, context);

    return sides.some(
      (side) =>
        style.computed(`border-${side}-width` as const).none(Length.isZero) &&
        style
          .computed(`border-${side}-style` as const)
          .none((style) => style.value === "none") &&
        style
          .computed(`border-${side}-color` as const)
          .none((color) => color.type === "color" && Color.isTransparent(color))
    );
  };
}
