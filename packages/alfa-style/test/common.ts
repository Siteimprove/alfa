import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";

import { type Longhands, Style, type Value } from "../src";

const device = Device.standard();

/**
 * @internal
 */
export function cascaded<N extends Longhands.Name>(
  element: Element,
  name: N,
  context: Context = Context.empty()
): Value.JSON<Style.Cascaded<N>> {
  return Style.from(element, device, context)
    .cascaded(name)
    .getUnsafe()
    .toJSON();
}
