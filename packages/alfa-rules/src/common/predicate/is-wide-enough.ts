import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Longhands, Style } from "@siteimprove/alfa-style";

const { hasComputedStyle } = Style;

/**
 * @deprecated
 * Used by R91/R92/R93 version 1
 */
export function isWideEnough<N extends Longhands.Name>(
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
