import type { Device } from "@siteimprove/alfa-device";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Rectangle } from "@siteimprove/alfa-rectangle";
import type { Element } from "../../element.js";

/**
 * @public
 */
export function hasBox(
  predicate: Predicate<Rectangle> = () => true,
  device: Device,
): Predicate<Element> {
  return (element) => element.getBoundingBox(device).some(predicate);
}
