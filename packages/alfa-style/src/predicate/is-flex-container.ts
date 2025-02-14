import { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";

import type { Style } from "../style.js";

import { hasComputedStyle } from "../element/element.js";

/**
 * {@link https://drafts.csswg.org/css-flexbox-1/#flex-container}
 *
 * @internal
 */
export function isFlexContainer(
  device: Device,
  context?: Context,
): Predicate<Element>;
export function isFlexContainer(style: Style): boolean;
export function isFlexContainer(
  deviceOrStyle: Device | Style,
  context?: Context,
): Predicate<Element> | boolean {
  if (Device.isDevice(deviceOrStyle)) {
    return hasComputedStyle(
      "display",
      ({ values: [_, inside] }) => inside?.value === "flex",
      deviceOrStyle,
      context,
    );
  }

  const [_, inside] = deviceOrStyle.computed("display").value.values;
  return inside?.value === "flex";
}
