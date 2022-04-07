import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Property, Style } from "@siteimprove/alfa-style";

const { hasComputedStyle } = Style;

export function isWideEnough<N extends Property.Name>(
  device: Device,
  property: N,
  predicate: (
    value: Style.Computed<N>
  ) => Predicate<Style.Computed<"font-size">>
): Predicate<Element> {
  return (element) =>
    hasComputedStyle(
      property,
      (value) =>
        hasComputedStyle("font-size", predicate(value), device)(element),
      device
    )(element);
}
