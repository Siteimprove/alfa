import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Element } from "../../element";

/**
 * @public
 */
export function hasBox(
  predicate: Predicate<Rectangle> = () => true,
  device: Device,
): Predicate<Element> {
  return (element) => element.getBoundingBox(device).some(predicate);
}
