import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Context } from "@siteimprove/alfa-selector";

/**
 * @public
 * Gets the bounding box, corresponding to a specific device, of an element
 *
 * @privateRemarks
 * We don't use the passed in device yet, but later we should use it to ensure the device used to collect the bounding box corresponds to the current device
 */
export function getBoundingBox(
  element: Element,
  device: Device,
  context: Context = Context.empty()
): Option<Rectangle> {
  // We assume layout is only grabbed on empty contexts, so if the context is non-empty we don't have layout
  if (!context.isEmpty()) {
    return None;
  }

  return element.box;
}
