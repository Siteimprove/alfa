import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";

import { Property, Style, Value } from "../src";

const device = Device.standard();

/**
 * @internal
 */
export function cascaded<N extends Property.Name>(
  element: Element,
  name: N
): Value.JSON<Style.Cascaded<N>> {
  return Style.from(element, device).cascaded(name).getUnsafe().toJSON();
}
