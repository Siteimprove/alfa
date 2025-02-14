import { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";

import type { Style } from "../style.js";

import { hasComputedStyle } from "../element/element.js";

/**
 * {@link https://www.w3.org/TR/css-grid-2/#grid-container}
 *
 * @internal
 */
export function isGridContainer(
  device: Device,
  context?: Context,
): Predicate<Element>;
export function isGridContainer(style: Style): boolean;
export function isGridContainer(
  deviceOrStyle: Device | Style,
  context?: Context,
): Predicate<Element> | boolean {
  if (Device.isDevice(deviceOrStyle)) {
    return hasComputedStyle(
      "display",
      ({ values: [_, inside] }) => inside?.value === "grid",
      deviceOrStyle,
      context,
    );
  }

  const [_, inside] = deviceOrStyle.computed("display").value.values;
  return inside?.value === "grid";
}
