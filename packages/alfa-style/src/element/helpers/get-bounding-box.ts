import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Rectangle } from "@siteimprove/alfa-rectangle";

/**
 * @public
 * Gets the bounding box, corresponding to a specific device, of an element
 *
 * @privateRemarks
 * We don't use the passed in device yet, but later we should use it to ensure the device used to collect the bounding box corresponds to the current device
 */
export function getBoundingBox(
  element: Element,
  device: Device
): Option<Rectangle> {
  return element.box;
}
