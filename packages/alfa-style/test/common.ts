import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";

import { Property, Style, Value } from "../src";

const device = Device.standard();

/**
 * @internal
 */
export function cascaded<N extends Property.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty()
): Value.JSON<Style.Cascaded<N>> {
  return Style.from(element, device, context)
    .cascaded(name)
    .getUnsafe()
    .toJSON();
}
